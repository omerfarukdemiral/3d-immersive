"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";
import { rechtsrahmen } from "./inhalt";
import { angeheftetAb, tAus } from "./raster";
import stil from "./seite.module.css";

/**
 * Zusatz der Standards-Seite: Die Vorschriften werden an die
 * Linienzeichnung geheftet.
 *
 * Jede Vorschrift bekommt einen Stift an ihrem Bauteil — Gondel, Turm,
 * Turmfuß, Fundament —, und zwei Vorschriften, die kein einzelnes Bauteil
 * meinen, bekommen eine eigene Linie: die Betriebssicherheitsverordnung
 * einen gestrichelten Rahmen um die ganze Anlage (sie verpflichtet den
 * Betreiber, nicht ein Bauteil), § 16b BImSchG die Grenze des Standorts
 * am Boden. Die Stifte bleiben stehen, wenn die nächste Vorschrift kommt:
 * Am Ende des Kapitels ist die Zeichnung vollständig beschriftet.
 *
 * Für die Leitlinie des gerade gelesenen Takts schreibt der Zusatz eigene
 * Anker `standards-r1` … `standards-r6` in `lauf.anker` (Bühnen-API 4.8).
 * Die Beschriftungen sind nur Bild (aria-hidden über die Szene); der Text
 * jeder Vorschrift steht im HTML der Seite.
 */

const SIGNAL = "#E0472A";

/* Ansatzpunkte der sechs Vorschriften in Weltkoordinaten (Maßstab 1). */
const STIFTE: [number, number, number][] = [
  /* DIN EN 50308: Dach der Gondel — Aufstieg, Arbeitsplatz oben */
  [-0.7, 62.3, 0],
  /* DGUV Regel 112-198/199: im Turm, wo abgestiegen und geborgen wird */
  [0, 36, 1.6],
  /* DGUV Vorschrift 3: Turmfuß über der Tür — Umrichter, Schaltanlage.
     Etwas höher als der Anker `fuss`, damit sich die Beschriftung in der
     Gesamtansicht nicht mit der des Fundaments darunter deckt. */
  [0, 7, 2.05],
  /* Weiterbetriebsgutachten: Turm und Fundament, am Rand des Fundaments */
  [0, 0.3, 7.5],
  /* BetrSichV: obere Ecke des Rahmens um die ganze Anlage */
  [7, 92, 32],
  /* § 16b BImSchG: Ecke der Standortgrenze */
  [80, 0.2, 80],
];

/* three-Objekte auf Modulebene: useFrame verändert sie in jedem Bild,
   und react-hooks/immutability lässt das nur außerhalb der Komponente zu. */
const rahmenMat = new THREE.LineDashedMaterial({
  color: SIGNAL,
  dashSize: 2.2,
  gapSize: 1.6,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
/* Rahmen um die Anlage: Turm, Gondel und Rotorkreis (Blattspitze ~90 m). */
const rahmen = new THREE.LineSegments(
  new THREE.EdgesGeometry(new THREE.BoxGeometry(14, 92, 64)),
  rahmenMat,
);
rahmen.position.set(1, 46, 0);
rahmen.computeLineDistances();

const grenzeMat = new THREE.LineDashedMaterial({
  color: SIGNAL,
  dashSize: 6,
  gapSize: 4,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
/* Standortgrenze: ein Quadrat von 160 m am Boden, knapp über dem Raster. */
const grenze = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints(
    [
      [-80, -80],
      [80, -80],
      [80, 80],
      [-80, 80],
    ].map(([x, z]) => new THREE.Vector3(x, 0.2, z)),
  ),
  grenzeMat,
);
grenze.computeLineDistances();

const v = new THREE.Vector3();

/* Ende des Rahmens: Mit dem letzten Takt gehen die Stifte. Im
   Kapitelwechsel schiebt der Text der letzten Vorschrift (mobil unten im
   Bild) nach oben über die Zeichnung — stünden die Beschriftungen dann
   noch, lägen Text und Kästen übereinander. Später schimmerten sie auch
   durch das Papier des Datenblatts. */
const ausVon = tAus("rahmen", 0.965);
const ausBis = tAus("rahmen", 1);

/** Deckkraft des Stifts i über die Zeit: ab seinem Takt bis zum Ende des Rahmens. */
function sichtbar(i: number, T: number) {
  const an = klemm((T - angeheftetAb(i)) / 0.03);
  const aus = 1 - klemm((T - ausVon) / (ausBis - ausVon));
  return an * aus * lauf.wechsel;
}

/* Ränder des Bilds, an denen kein Stift stehen darf: oben die Kopfleiste
   (mobil steht dort auch das HUD), unten die HUD-Zeile, rechts die
   Sprungliste. Bei den Nahaufnahmen von Turmfuß und Fundament wandern
   Ansatzpunkte dorthin; der Stift blendet dann weich aus, wie der Text an
   den Kanten — sonst deckte „DGUV Regel …" die Menüpunkte ab. */
const KOPF = 96;
const FUSS = 72;
const WEICH = 40;
/* Breite der Sprungliste samt Rand (nur auf breiten Fenstern). */
const LISTE = 236;
function amRand(x: number, y: number, breite: number, w: number, h: number) {
  const oben = klemm((y - KOPF) / WEICH);
  const unten = klemm((h - FUSS - y) / WEICH);
  /* Der Kasten reicht vom Ansatzpunkt um seine eigene Breite nach rechts.
     Die Sprungliste steht nur im mittleren Band der Höhe; darüber und
     darunter darf ein Stift bis an den Rand. */
  const frei = w >= 768 ? w - LISTE : w - 8;
  const neben = w >= 768 ? klemm((Math.abs(y - h / 2) - 90) / WEICH) : 0;
  /* Voll, solange der Kasten ganz frei steht; aus, wenn er WEICH Pixel
     in die gesperrte Zone ragt. */
  const rechts = Math.max(neben, klemm(1 + (frei - (x + breite)) / WEICH));
  return oben * unten * rechts;
}

export default function Vorschriften() {
  const stifte = useRef<(HTMLDivElement | null)[]>([]);
  /* Breiten der Kästen, einmal gemessen — jedes Bild neu zu messen
     erzwänge zwischen den Stilwerten ein Layout. */
  const breiten = useRef<number[]>([]);

  /* Kamera und Größe aus dem Frame-Zustand, nicht aus useThree. */
  useFrame(({ camera, size }) => {
    const T = lauf.szeneT;

    rahmenMat.opacity = sichtbar(4, T) * 0.85;
    rahmen.visible = rahmenMat.opacity > 0.01;
    grenzeMat.opacity = sichtbar(5, T) * 0.9;
    grenze.visible = grenzeMat.opacity > 0.01;

    const m = lauf.szene.massstab;
    STIFTE.forEach((p, i) => {
      /* Anker für die Leitlinie. An der Anlage hängende Punkte wachsen
         mit dem Maßstab, die Standortgrenze nicht. */
      v.set(p[0] * (i < 5 ? m : 1), p[1] * (i < 5 ? m : 1), p[2] * (i < 5 ? m : 1));
      v.project(camera);
      const a = (lauf.anker[`standards-r${i + 1}`] ??= { x: 0, y: 0, da: false });
      a.x = ((v.x + 1) / 2) * size.width;
      a.y = ((1 - v.y) / 2) * size.height;
      a.da = v.z < 1;

      /* Das DOM nur bei Änderung anfassen; der letzte Wert steht am
         Element selbst, damit ein neu aufgebauter Stift (Seite erneut
         besucht) nicht an einem alten Wert hängen bleibt. */
      const el = stifte.current[i];
      if (el && !breiten.current[i]) breiten.current[i] = el.offsetWidth;
      const rand = a.da ? amRand(a.x, a.y, breiten.current[i] ?? 0, size.width, size.height) : 0;
      const o = String(Math.round(sichtbar(i, T) * rand * 100) / 100);
      if (el && el.dataset.o !== o) {
        el.dataset.o = o;
        el.style.opacity = o;
        el.style.visibility = o === "0" ? "hidden" : "visible";
      }
    });
  });

  return (
    <>
      <primitive object={rahmen} />
      <primitive object={grenze} />
      {rechtsrahmen.map((r, i) => (
        <Html
          key={r.norm}
          position={STIFTE[i]}
          pointerEvents="none"
          zIndexRange={[2, 2]}
        >
          <div
            ref={(el) => {
              stifte.current[i] = el;
            }}
            className={stil.stift}
            aria-hidden="true"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <span className={stil.stiftNr}>{String(i + 1).padStart(2, "0")}</span>
            <span>{r.stift}</span>
          </div>
        </Html>
      ))}
    </>
  );
}
