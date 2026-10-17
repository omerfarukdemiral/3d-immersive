"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { lauf } from "@/components/erlebnis/lauf";
import { glatt, klemm } from "@/components/erlebnis/zeitachse";
import { LEITSTAND, zeiten } from "./raster";
import stil from "./seite.module.css";

/**
 * Zusatz der Monitoring-Seite: Die Meldung läuft als rote Linie von der
 * Gondel zum Leitstand am Horizont.
 *
 * Die Linie wächst mit dem Scroll (Takt „Die Meldung läuft auf …"), ein
 * Lichtpunkt läuft danach immer wieder an ihr entlang — die Verbindung
 * steht. Im Blick in die Gondel tritt sie zurück, am Morgen ist sie weg.
 *
 * three-Objekte auf Modulebene (nicht in useMemo): useFrame verändert
 * sie in jedem Bild, und die Lint-Regel react-hooks/immutability lässt
 * das nur für Werte außerhalb der Komponente zu.
 */

const SIGNAL = "#E0472A";
/** Stützpunkte der Linie: genug für einen glatten Bogen. */
const N = 96;
/** Oberkante der Gondel bei Maßstab 1 (Nabe auf ~60 m). */
const GONDEL_Y = 62;
/** Scheitel des Bogens über der Geraden — ein Funkweg, kein Kabel. */
const BOGEN = 50;

/* Die Linie liegt in Weltkoordinaten; neu berechnet wird sie nur, wenn
   sich der Maßstab der Anlage ändert (auf dieser Seite nie). */
const punkte = new Float32Array(N * 3);
const linienGeo = new THREE.BufferGeometry();
linienGeo.setAttribute("position", new THREE.BufferAttribute(punkte, 3));
const linienMat = new THREE.LineBasicMaterial({
  color: SIGNAL,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  fog: false,
});
const linie = new THREE.Line(linienGeo, linienMat);
linie.frustumCulled = false;

/* Leitstand und Lichtpunkt: Punkte fester Bildschirmgröße — auf
   anderthalb Kilometer wäre eine Kugel sonst nur ein Pixel. */
const marken = new Float32Array(6);
const markenGeo = new THREE.BufferGeometry();
markenGeo.setAttribute("position", new THREE.BufferAttribute(marken, 3));
const markenMat = new THREE.PointsMaterial({
  color: SIGNAL,
  size: 7,
  sizeAttenuation: false,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  fog: false,
});
const markenPunkte = new THREE.Points(markenGeo, markenMat);
markenPunkte.frustumCulled = false;

/* Mast des Leitstands: ein kurzer senkrechter Strich über dem Boden. */
const mastGeo = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(LEITSTAND[0], 0, LEITSTAND[2]),
  new THREE.Vector3(LEITSTAND[0], 46, LEITSTAND[2]),
]);
const mast = new THREE.Line(mastGeo, linienMat);
mast.frustumCulled = false;

const ziel = new THREE.Vector3(LEITSTAND[0], 46, LEITSTAND[2]);
const v = new THREE.Vector3();
const stand = { massstab: -1 };

/** Punkt auf dem Bogen bei s (0 = Gondel, 1 = Leitstand). */
function bogen(s: number, m: number, aus: THREE.Vector3) {
  const y0 = GONDEL_Y * m;
  aus.set(
    ziel.x * s,
    y0 + (ziel.y - y0) * s + Math.sin(s * Math.PI) * BOGEN,
    ziel.z * s,
  );
  return aus;
}

function linieBauen(m: number) {
  for (let i = 0; i < N; i++) {
    bogen(i / (N - 1), m, v);
    punkte[i * 3] = v.x;
    punkte[i * 3 + 1] = v.y;
    punkte[i * 3 + 2] = v.z;
  }
  linienGeo.attributes.position.needsUpdate = true;
  linienGeo.computeBoundingSphere();
  marken[0] = ziel.x;
  marken[1] = ziel.y;
  marken[2] = ziel.z;
}

export default function Leitstand() {
  const etikett = useRef<HTMLDivElement>(null);
  const zuletzt = useRef(-1);

  useFrame(({ clock }) => {
    const T = lauf.szeneT;
    const m = lauf.szene.massstab;
    if (m !== stand.massstab) {
      stand.massstab = m;
      linieBauen(m);
    }

    /* Wie weit die Meldung schon gelaufen ist (0–1). */
    const lauf01 = glatt(
      klemm((T - zeiten.meldungVon) / (zeiten.meldungAn - zeiten.meldungVon)),
    );
    /* Stärke: voll in der Meldung, leise im Befund, an der Steuerung
       aus — dort steht die Kamera am Turmfuß, die Linie liefe nur noch
       als roter Strich durch den Himmel. */
    const leiser = klemm((T - zeiten.meldungLeiser + 0.3) / 0.3);
    const aus = klemm((T - zeiten.meldungAus + 0.3) / 0.25);
    const staerke = (1 - leiser * 0.65) * (1 - aus) * lauf.wechsel;
    const sichtbar = lauf01 > 0.001 && staerke > 0.01;
    linie.visible = sichtbar;
    mast.visible = sichtbar;
    markenPunkte.visible = sichtbar;

    if (sichtbar) {
      linienGeo.setDrawRange(0, Math.max(2, Math.round(lauf01 * N)));
      linienMat.opacity = 0.9 * staerke;
      markenMat.opacity = staerke;

      /* Lichtpunkt: läuft, solange die Linie steht, alle 2,4 s einmal
         von der Gondel zum Leitstand. Bei reduzierter Bewegung steht er
         am Leitstand. */
      const s =
        lauf01 < 1
          ? lauf01
          : lauf.ruhig
            ? 1
            : (clock.elapsedTime % 2.4) / 2.4;
      bogen(s, m, v);
      marken[3] = v.x;
      marken[4] = v.y;
      marken[5] = v.z;
      markenGeo.attributes.position.needsUpdate = true;
    }

    /* Etikett am Leitstand: wenn die Meldung angekommen ist, und nur in
       ihrem Kapitel — aus der Gondel gesehen stünde es mitten im Bild. */
    const o =
      Math.round(
        klemm((lauf01 - 0.85) / 0.15) * (1 - leiser) * lauf.wechsel * 100,
      ) / 100;
    if (o !== zuletzt.current && etikett.current) {
      zuletzt.current = o;
      etikett.current.style.opacity = String(o);
    }
  });

  return (
    <>
      <primitive object={linie} />
      <primitive object={mast} />
      <primitive object={markenPunkte} />
      <Html
        position={[ziel.x, ziel.y, ziel.z]}
        zIndexRange={[2, 2]}
        style={{ pointerEvents: "none" }}
      >
        <div ref={etikett} className={stil.leitstand} aria-hidden="true">
          Musterstadt control room
        </div>
      </Html>
      <AnkerLeitstand />
    </>
  );
}

/**
 * Schreibt die Bildschirmlage des Leitstands in `lauf.anker` (eigene Id
 * mit Präfix der Seite). Die Bühne zieht daraus die Leitlinie zum Text
 * (fokus „monitoring-leitstand"), wie zu einem Bauteil der Anlage.
 */
function AnkerLeitstand() {
  useFrame(({ camera, size }) => {
    v.copy(ziel).project(camera);
    const a = (lauf.anker["monitoring-leitstand"] ??= {
      x: 0,
      y: 0,
      da: false,
    });
    a.x = ((v.x + 1) / 2) * size.width;
    a.y = ((1 - v.y) / 2) * size.height;
    a.da = v.z < 1;
  });
  return null;
}
