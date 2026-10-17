"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";

/**
 * Zusatz der Muster-Seite: ein Ring in Signalfarbe um den Turm, auf der
 * Höhe der Kamera — die Messgröße des HUD als Marke an der Anlage.
 *
 * three-Objekte auf Modulebene (nicht in useMemo): useFrame verändert
 * sie in jedem Bild, und die Lint-Regel react-hooks/immutability lässt
 * das nur für Werte außerhalb der Komponente zu.
 */
const mat = new THREE.MeshBasicMaterial({
  color: "#E0472A",
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 6, 64), mat);
ring.rotation.x = Math.PI / 2;

export default function Hoehenring() {
  /* Kamera aus dem Frame-Zustand, nicht aus useThree. */
  useFrame(({ camera }) => {
    /* Nur im Aufstieg (erstes Kapitel), mit dem Seitenwechsel eingeblendet. */
    const da = lauf.T < 1 ? 1 - klemm((lauf.T - 0.7) / 0.1) : 0;
    mat.opacity = da * lauf.wechsel * 0.9;
    ring.visible = mat.opacity > 0.01;
    /* Der Turm verjüngt sich: oben ist der Ring etwas enger. */
    const y = klemm(camera.position.y, 1, 60);
    ring.position.y = y;
    ring.scale.setScalar(1 - (y / 60) * 0.42);
  });
  return <primitive object={ring} />;
}
