"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DIMENSIONS } from "@/components/three/turbineGeometry";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";
import { NABENHOEHE, hoeheBei, raster } from "./kapitel";

/**
 * Zusatz der Service-Seite: ein Messband am Turm.
 *
 * Die Messgröße der Seite ist die Höhe (HUD „Höhe 0 → 60 m"). Damit sie
 * nicht nur unten links als Zahl steht, zeichnet ein dünner roter Strich
 * sie an der Turmwand nach — vom Fuß bis zur aktuellen Höhe, mit einem
 * Teilstrich alle fünf Meter und einem Ring auf der erreichten Höhe. Das
 * Band liegt immer auf der Seite des Turms, die zur Kamera zeigt, und
 * folgt der Verjüngung des Turms.
 *
 * three-Objekte auf Modulebene: useFrame verändert sie in jedem Bild,
 * und die Lint-Regel react-hooks/immutability lässt das nur für Werte
 * außerhalb der Komponente zu.
 */

const { towerBaseRadius, towerTopRadius, towerHeight } = DIMENSIONS;
/** Abstand zur Turmwand, damit das Band nicht im Turm flimmert. */
const LUFT = 0.06;
/** Turmradius auf Höhe y (Modellmaßstab 1, linear verjüngt). */
const radiusBei = (y: number) =>
  towerBaseRadius - ((towerBaseRadius - towerTopRadius) * y) / towerHeight;

/** Teilstriche alle 5 m: 0, 5, … 60 m. */
const TEILUNG = 5;
const STRICHE = NABENHOEHE / TEILUNG + 1;
/** Länge eines Teilstrichs; jeder dritte (alle 15 m) ist länger. */
const STRICH = 0.5;

const strichMat = new THREE.LineBasicMaterial({
  color: "#E0472A",
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

/* Senkrechter Strich: zwei Punkte, jedes Bild neu gesetzt. */
const bandGeo = new THREE.BufferGeometry();
bandGeo.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(6), 3),
);
const band = new THREE.Line(bandGeo, strichMat);
band.frustumCulled = false;

/* Teilstriche: je zwei Punkte, gezeigt wird nur bis zur aktuellen Höhe. */
const teilGeo = new THREE.BufferGeometry();
teilGeo.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(STRICHE * 6), 3),
);
const teile = new THREE.LineSegments(teilGeo, strichMat);
teile.frustumCulled = false;

/* Ring auf der erreichten Höhe. */
const ringMat = new THREE.MeshBasicMaterial({
  color: "#E0472A",
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.045, 6, 72), ringMat);
ring.rotation.x = Math.PI / 2;

/** Ende der Bühnen: ab dem Datenblatt blendet das Band aus. */
const ENDE = raster.index("daten");

export default function Messband() {
  /* Kamera aus dem Frame-Zustand, nicht aus useThree (Lint, Doku 9). */
  useFrame(({ camera }) => {
    const T = lauf.szeneT;
    /* Nur im Aufstieg; im Übergang zum Datenblatt aus. Mit dem
       Seitenwechsel eingeblendet, damit es nicht vor der Kamera da ist. */
    const da = 1 - klemm((T - (ENDE - 0.35)) / 0.3);
    const deckkraft = da * lauf.wechsel;
    strichMat.opacity = deckkraft * 0.95;
    ringMat.opacity = deckkraft * 0.9;
    const sichtbar = deckkraft > 0.01;
    band.visible = teile.visible = ring.visible = sichtbar;
    if (!sichtbar) return;

    /* Was an der Anlage hängt, wächst mit dem Maßstab (Doku 4.8). */
    const m = lauf.szene.massstab;
    const h = hoeheBei(T);

    /* Seite des Turms, die zur Kamera zeigt. */
    const w = Math.atan2(camera.position.x, camera.position.z);
    const sx = Math.sin(w);
    const sz = Math.cos(w);

    const p = bandGeo.attributes.position as THREE.BufferAttribute;
    const r0 = (radiusBei(0) + LUFT) * m;
    const rh = (radiusBei(h) + LUFT) * m;
    p.setXYZ(0, sx * r0, 0.2 * m, sz * r0);
    p.setXYZ(1, sx * rh, Math.max(0.2, h) * m, sz * rh);
    p.needsUpdate = true;

    /* Teilstriche quer zur Blickrichtung, an der Wand entlang. */
    const q = teilGeo.attributes.position as THREE.BufferAttribute;
    let n = 0;
    for (let i = 0; i < STRICHE; i++) {
      const y = i * TEILUNG;
      if (y > h + 0.01) break;
      const r = (radiusBei(y) + LUFT) * m;
      const l = (i % 3 === 0 ? STRICH * 1.8 : STRICH) * m;
      /* Tangente an den Turm: senkrecht zur Richtung (sx, sz). */
      q.setXYZ(2 * i, sx * r - sz * l * 0.5, y * m, sz * r + sx * l * 0.5);
      q.setXYZ(2 * i + 1, sx * r + sz * l * 0.5, y * m, sz * r - sx * l * 0.5);
      n = i + 1;
    }
    q.needsUpdate = true;
    teilGeo.setDrawRange(0, n * 2);

    /* Ring: knapp außerhalb der Wand auf der erreichten Höhe. */
    ring.position.y = h * m;
    ring.scale.setScalar((radiusBei(h) + LUFT * 2) * m);
  });

  return (
    <>
      <primitive object={band} />
      <primitive object={teile} />
      <primitive object={ring} />
    </>
  );
}
