"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";
import s from "./seite.module.css";

/**
 * Bild des Beitrags „Post-EEG": Zwanzig
 * Förderjahre liegen als volle Leiste am Boden und laufen auf die Anlage
 * zu. Dort, am Turmfuß, gabelt sich der Weg in die vier Optionen des
 * Beitrags — Weiterbetrieb, Verkauf, Repowering, Rückbau.
 *
 * Alle Maße sind Bild, keine Planwerte: Ein Jahr ist ein Strich von 7 m.
 * Die Beschriftung steht nur als Bild hier (aria-hidden); im Text der
 * Seite stehen die vier Wege ausgeschrieben.
 *
 * three-Objekte liegen auf Modulebene (Lint-Regel react-hooks/immutability,
 * docs/04-sayfa-api.md Abschnitt 8).
 */

const TINTE = "#121417";
const SIGNAL = "#E0472A";
/** Knapp über dem Boden, damit nichts mit dem Raster flimmert. */
const BODEN_Y = 0.35;

/* Die Leiste kommt von Süden (auf die Kamera zu) und läuft auf den
   Turmfuß zu; hinter der Anlage fächern die vier Wege nach Norden in die
   Tiefe. So steht das ganze Bild schmal neben dem Text, und die
   Perspektive erzählt mit: Die Jahre liegen vorn, die Wege führen weg. */
const JAHRE = 20;
const JAHR_M = 6;
const LUECKE_M = 1.4;
/** Ende der Leiste = Gabelpunkt, knapp vor dem Turmfuß (Süden = +z). */
const GABEL: [number, number] = [0, 10];
const LEISTE_START = GABEL[1] + JAHRE * (JAHR_M + LUECKE_M);

/** Die vier Wege, in der Reihenfolge des Beitrags. Enden im Norden. */
const WEGE = ["Keep running", "Sell", "Repowering", "Decommissioning"];
const ENDEN: [number, number][] = [
  [-96, -200],
  [-32, -250],
  [32, -250],
  [96, -200],
];

function flach(farbe: string) {
  return new THREE.MeshBasicMaterial({
    color: farbe,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    fog: true,
  });
}

/** Band entlang eines Linienzugs am Boden (Breite in m), in der x-z-Ebene. */
function band(punkte: [number, number][], breite: number, p: number[] = []) {
  const h = breite / 2;
  for (let i = 0; i < punkte.length - 1; i++) {
    const [ax, az] = punkte[i];
    const [bx, bz] = punkte[i + 1];
    const l = Math.hypot(bx - ax, bz - az) || 1;
    const nx = (-(bz - az) / l) * h;
    const nz = ((bx - ax) / l) * h;
    p.push(
      ax + nx, 0, az + nz, bx + nx, 0, bz + nz, bx - nx, 0, bz - nz,
      ax + nx, 0, az + nz, bx - nx, 0, bz - nz, ax - nx, 0, az - nz,
    );
  }
  return p;
}

function geometrie(p: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
}

/* Zwanzig Jahre: einzelne Striche, alle gefüllt — die Förderung ist
   abgelaufen. */
const jahrMat = flach(SIGNAL);
const jahrPunkte: number[] = [];
for (let j = 0; j < JAHRE; j++) {
  const z = LEISTE_START - j * (JAHR_M + LUECKE_M);
  band(
    [
      [GABEL[0], z],
      [GABEL[0], z - JAHR_M],
    ],
    3.2,
    jahrPunkte,
  );
}
const leiste = new THREE.Mesh(geometrie(jahrPunkte), jahrMat);

/* Vier Wege: weiche Bögen vom Gabelpunkt nach Norden, jeder mit einem
   Ring am Ende. Tinte, nicht Signal — keiner ist der empfohlene. */
const wegMat = flach(TINTE);
const ringMat = flach(TINTE);
const wegPunkte: number[] = [];
const ringe = new THREE.Group();
const ringGeo = new THREE.RingGeometry(4.2, 5.6, 48);
for (const [ex, ez] of ENDEN) {
  /* Quadratischer Bogen: erst ein Stück geradeaus, dann auseinander. */
  const kx = GABEL[0];
  const kz = GABEL[1] - 90;
  const zug: [number, number][] = [];
  for (let s = 0; s <= 24; s++) {
    const t = s / 24;
    const u = 1 - t;
    zug.push([
      u * u * GABEL[0] + 2 * u * t * kx + t * t * ex,
      u * u * GABEL[1] + 2 * u * t * kz + t * t * ez,
    ]);
  }
  band(zug, 1.8, wegPunkte);
  const r = new THREE.Mesh(ringGeo, ringMat);
  r.rotation.x = -Math.PI / 2;
  r.position.set(ex, 0, ez);
  ringe.add(r);
}
const wege = new THREE.Mesh(geometrie(wegPunkte), wegMat);

const gabel = new THREE.Group();
gabel.add(leiste, wege, ringe);
gabel.position.y = BODEN_Y;

/* Die beiden inneren Beschriftungen rücken vom Turm weg: Mittig über dem
   Ring würde „Repowering" vom seitlich stehenden Rotorblatt angeschnitten. */
const INNEN: (string | undefined)[] = [undefined, s.wegLinks, s.wegRechts];

/**
 * Die Gabel am Boden. `sicht` liefert 0–1 (wird in jedem Bild gelesen):
 * im Beitrag einfach der Seitenwechsel, auf /insights das Fenster des
 * ersten Beitrags. `schrift` steuert die vier Beschriftungen eigens
 * (Standard: wie die Gabel) — im Beitrag gehen sie beim Lesen ganz weg.
 */
export function Wegegabel({
  sicht,
  schrift = sicht,
}: {
  sicht: () => number;
  schrift?: () => number;
}) {
  const etiketten = useRef<HTMLSpanElement[]>([]);
  useFrame(() => {
    const v = klemm(sicht());
    jahrMat.opacity = v * 0.88;
    wegMat.opacity = v * 0.62;
    ringMat.opacity = v * 0.8;
    gabel.visible = v > 0.005;
    const e = klemm(schrift());
    const o = e > 0.005 ? String(Math.round(e * 100) / 100) : "0";
    for (const el of etiketten.current) {
      if (el && el.style.opacity !== o) el.style.opacity = o;
    }
  });
  return (
    <>
      <primitive object={gabel} />
      {ENDEN.map(([x, z], i) => (
        <Html
          key={WEGE[i]}
          position={[x, 2, z - 12]}
          zIndexRange={[1, 0]}
          style={{ pointerEvents: "none" }}
        >
          <span
            ref={(el) => {
              if (el) etiketten.current[i] = el;
            }}
            aria-hidden="true"
            className={`e-etikett ${s.wegEtikett} ${INNEN[i] ?? ""}`}
            style={{ opacity: 0 }}
          >
            {WEGE[i]}
          </span>
        </Html>
      ))}
    </>
  );
}

/*
 * Lesemodus: Im Auftakt steht die Gabel voll und beschriftet neben dem
 * Titel. Sobald der erste Abschnitt hereinschiebt (Erzählzeit 0,3 → 0,7,
 * der Auftakt steht bis 0,375), läuft der Text über die Breite, in der die
 * Gabel liegt — auf keiner Breite passt sie zwischen 68ch-Spalte und
 * Kapitelschiene. Darum gehen die Beschriftungen ganz weg (kein Text über
 * Text), und Leiste und Wege bleiben nur als blasse Spur stehen.
 */
const LESEN: [number, number] = [0.3, 0.7];
const SPUR = 0.28;

function lesen() {
  const q = klemm((lauf.T - LESEN[0]) / (LESEN[1] - LESEN[0]));
  return q * q * (3 - 2 * q);
}

/** Zusatz des Beitrags „Post-EEG": steht, sobald die Seite da ist. */
export default function WegegabelBeitrag() {
  return (
    <Wegegabel
      sicht={() => lauf.wechsel * (1 - (1 - SPUR) * lesen())}
      schrift={() => lauf.wechsel * (1 - lesen())}
    />
  );
}
