"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";

/**
 * Bild des Beitrags „Rückbaupflicht":
 * Die Anlage ist fort (Spur `anlage` = 0), nur das Fundament steht. Wo
 * Kranstellfläche und Zuwegung lagen, bleibt nur eine gestrichelte
 * Kontur auf dem wiederhergestellten Boden — genau die Teile, die der
 * Beitrag als Umfang der Verpflichtung nennt (Anlage, Zuwegung,
 * Kranstellfläche, Fundament).
 *
 * Bildmaße, keine Planwerte. three-Objekte auf Modulebene (Lint-Regel
 * react-hooks/immutability).
 */

const TINTE = "#121417";
const BODEN_Y = 0.3;

const mat = new THREE.MeshBasicMaterial({
  color: TINTE,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  side: THREE.DoubleSide,
  polygonOffset: true,
  polygonOffsetFactor: -2,
  fog: true,
});

/** Strichlinie als einzelne Vierecke am Boden (x-z-Ebene). */
function striche(
  zug: [number, number][],
  strich: number,
  luecke: number,
  breite: number,
  p: number[],
) {
  const h = breite / 2;
  for (let i = 0; i < zug.length - 1; i++) {
    const [ax, az] = zug[i];
    const [bx, bz] = zug[i + 1];
    const l = Math.hypot(bx - ax, bz - az);
    const dx = (bx - ax) / l;
    const dz = (bz - az) / l;
    const nx = -dz * h;
    const nz = dx * h;
    for (let s = 0; s < l; s += strich + luecke) {
      const e = Math.min(l, s + strich);
      const x0 = ax + dx * s;
      const z0 = az + dz * s;
      const x1 = ax + dx * e;
      const z1 = az + dz * e;
      p.push(
        x0 + nx, 0, z0 + nz, x1 + nx, 0, z1 + nz, x1 - nx, 0, z1 - nz,
        x0 + nx, 0, z0 + nz, x1 - nx, 0, z1 - nz, x0 - nx, 0, z0 - nz,
      );
    }
  }
}

const punkte: number[] = [];
/* Kranstellfläche neben dem Turmfuß (wie auf der Planungsseite). */
const KX = 40;
const KZ = 34;
const KB = 42;
const KT = 24;
striche(
  [
    [KX - KB / 2, KZ - KT / 2],
    [KX + KB / 2, KZ - KT / 2],
    [KX + KB / 2, KZ + KT / 2],
    [KX - KB / 2, KZ + KT / 2],
    [KX - KB / 2, KZ - KT / 2],
  ],
  3,
  2.2,
  0.9,
  punkte,
);
/* Zuwegung: zwei Kanten, die von der Fläche nach Osten auslaufen. */
for (const versatz of [-3, 3]) {
  striche(
    [
      [KX + KB / 2, KZ + versatz],
      [140, 60 + versatz],
      [320, 100 + versatz],
    ],
    3,
    2.2,
    0.9,
    punkte,
  );
}
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.Float32BufferAttribute(punkte, 3));
const kontur = new THREE.Mesh(geo, mat);
kontur.position.y = BODEN_Y;

/**
 * Die Kontur. `sicht` liefert 0–1 (in jedem Bild gelesen): im Beitrag der
 * Seitenwechsel, auf /insights das Fenster des dritten Beitrags.
 */
export function Flaeche({ sicht }: { sicht: () => number }) {
  useFrame(() => {
    const v = klemm(sicht());
    mat.opacity = v * 0.5;
    kontur.visible = v > 0.005;
  });
  return <primitive object={kontur} />;
}

/** Zusatz des Beitrags „Rückbau": steht, sobald die Seite da ist. */
export default function FlaecheBeitrag() {
  return <Flaeche sicht={() => lauf.wechsel} />;
}
