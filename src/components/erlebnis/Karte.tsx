"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { bundeslaender, mapSitz } from "@/content/deutschlandkarte";
import { lauf } from "./lauf";
import { istNacht } from "./zeitachse";

/**
 * Deutschlandkarte als Linien am Boden (Spur `karte`, Referenzen).
 *
 * Dieselben Ländergrenzen wie die Karte der alten Unterseiten
 * (content/deutschlandkarte.ts), nur flach auf den Boden gelegt. Die
 * Anlage steht auf dem Firmensitz Musterstadt — der Kartenursprung liegt
 * darum genau unter dem Turm. Osten = +x, Süden = +z (wie der Sonnenlauf).
 *
 * Maßstab bewusst als Illustration: Eine Karteneinheit sind
 * KARTE_MASSSTAB Meter, ganz Deutschland misst so gut 3 km — groß genug
 * für eine Aufsicht, klein genug, dass die Anlage darauf noch zu sehen ist.
 */
const KARTE_MASSSTAB = 6;

/** SVG-Koordinate der Karte (viewBox 0 0 560 759) → Weltpunkt am Boden. */
export function karteNachWelt(x: number, y: number, aus = new THREE.Vector3()) {
  return aus.set(
    (x - mapSitz.x) * KARTE_MASSSTAB,
    0,
    (y - mapSitz.y) * KARTE_MASSSTAB,
  );
}

/* Pfade bestehen nur aus M, L und Z: jede Strecke wird ein Linienpaar. */
const kanten = (() => {
  const p: number[] = [];
  const H = 0.2;
  for (const land of bundeslaender) {
    const teile = land.d.match(/[MLZ][^MLZ]*/g) ?? [];
    let start: [number, number] | null = null;
    let vor: [number, number] | null = null;
    for (const t of teile) {
      const art = t[0];
      if (art === "Z") {
        if (vor && start) p.push(...welt(vor, H), ...welt(start, H));
        vor = start;
        continue;
      }
      const [x, y] = t.slice(1).trim().split(/[\s,]+/).map(Number);
      const jetzt: [number, number] = [x, y];
      if (art === "M") start = jetzt;
      else if (vor) p.push(...welt(vor, H), ...welt(jetzt, H));
      vor = jetzt;
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

function welt([x, y]: [number, number], h: number) {
  return [
    (x - mapSitz.x) * KARTE_MASSSTAB,
    h,
    (y - mapSitz.y) * KARTE_MASSSTAB,
  ];
}

const mat = new THREE.LineBasicMaterial({
  color: "#121417",
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const linien = new THREE.LineSegments(kanten, mat);
linien.frustumCulled = false;
linien.visible = false;
linien.renderOrder = 1;

export default function Karte() {
  useFrame(() => {
    const k = lauf.szene.karte;
    linien.visible = k > 0.005;
    if (!linien.visible) return;
    mat.color.set(istNacht(lauf.uhr) ? "#A9CCF0" : "#121417");
    mat.opacity = k * 0.7;
  });
  return <primitive object={linien} />;
}
