"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DIMENSIONS } from "@/components/three/turbineGeometry";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";

/**
 * Bild des Beitrags „Repowering nach § 16b": alte und neue Anlage übereinander, und nur der Unterschied ist
 * markiert — dasselbe Bild wie der vierte Schritt auf der Planungsseite
 * („Genehmigung nach § 16b"). Geprüft wird die Veränderung gegenüber dem
 * Bestand; genau die steht in Signalrot.
 *
 * Die neue Anlage selbst ist der Geisterumriss der Bühne (Spur `geist`);
 * hier liegen nur die Markierungen: Maßkette vom alten zum neuen
 * Nabenniveau, alter Rotorkreis blass, neuer rot. Keine Zahlen — das sind
 * Bildmaße der Modellanlage, keine Planwerte.
 *
 * three-Objekte liegen auf Modulebene (Lint-Regel react-hooks/immutability).
 */

const TINTE = "#121417";
const SIGNAL = "#E0472A";

const HUB_Y = DIMENSIONS.towerHeight + 0.4;
const ROTOR_R = DIMENSIONS.hubRadius + DIMENSIONS.bladeLength;
const ROTOR_X = DIMENSIONS.nacelleLength * 0.42 + 1.2;

const diffMat = new THREE.MeshBasicMaterial({
  color: SIGNAL,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  side: THREE.DoubleSide,
});
const altMat = new THREE.MeshBasicMaterial({
  color: TINTE,
  transparent: true,
  opacity: 0,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const differenz = new THREE.Group();

/* Maßkette neben dem Turm, auf der Seite zur Kamera (Südwesten), damit
   sie nicht im Rotor verschwindet. */
const ABSTAND = 34;
const kette = new THREE.Mesh(new THREE.BoxGeometry(0.9, HUB_Y, 0.9), diffMat);
kette.position.set(-ABSTAND * 0.7, HUB_Y * 1.5, ABSTAND * 0.7);
differenz.add(kette);
/* Ober- und Unterkante als kurze Querstriche zur Turmachse hin. */
const quer = new THREE.BoxGeometry(ABSTAND, 0.7, 0.7);
for (const [mat, y] of [
  [altMat, HUB_Y],
  [diffMat, HUB_Y * 2],
] as const) {
  const m = new THREE.Mesh(quer, mat);
  m.position.set(-ABSTAND * 0.35, y, ABSTAND * 0.35);
  m.rotation.y = Math.PI / 4;
  differenz.add(m);
}
/* Rotorkreise in der y-z-Ebene (der Rotor zeigt nach +x). */
const kreisAlt = new THREE.Mesh(
  new THREE.RingGeometry(ROTOR_R - 0.25, ROTOR_R + 0.25, 128),
  altMat,
);
kreisAlt.rotation.y = Math.PI / 2;
kreisAlt.position.set(ROTOR_X, HUB_Y, 0);
const kreisNeu = new THREE.Mesh(
  new THREE.RingGeometry(ROTOR_R * 2 - 0.5, ROTOR_R * 2 + 0.5, 160),
  diffMat,
);
kreisNeu.rotation.y = Math.PI / 2;
kreisNeu.position.set(ROTOR_X * 2, HUB_Y * 2, 0);
differenz.add(kreisAlt, kreisNeu);

/**
 * Die Markierungen. `sicht` liefert 0–1 (in jedem Bild gelesen): im
 * Beitrag der Seitenwechsel, auf /insights das Fenster des zweiten Beitrags.
 */
export function Differenz({ sicht }: { sicht: () => number }) {
  useFrame(() => {
    const v = klemm(sicht());
    diffMat.opacity = v * 0.9;
    altMat.opacity = v * 0.55;
    differenz.visible = v > 0.005;
  });
  return <primitive object={differenz} />;
}

/** Zusatz des Beitrags „Repowering": steht, sobald die Seite da ist. */
export default function DifferenzBeitrag() {
  return <Differenz sicht={() => lauf.wechsel} />;
}
