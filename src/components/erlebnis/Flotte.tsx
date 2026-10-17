"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  DIMENSIONS,
  createBladeGeometry,
  createNacelleGeometry,
  createTowerGeometry,
} from "@/components/three/turbineGeometry";
import { lauf } from "./lauf";
import { klemm } from "./zeitachse";

/**
 * Der Bestand als Flotte: 140 Anlagen, die sich im Kapitel „Bestand"
 * aus dem Boden heben und je nach Kennzahl markiert werden. Dazu neun
 * Umrisse für die Planungsprojekte.
 *
 * Zwei instanzierte Netze (Mast mit Gondel, Rotor) statt 140 Einzelanlagen:
 * ein Zeichenaufruf je Netz, die Rotoren drehen über ihre Matrizen.
 */

const ANZAHL = 140;
const GEPLANT = 9;
const HUB_Y = DIMENSIONS.towerHeight + 0.4;
const HUB_X = DIMENSIONS.nacelleLength * 0.42;

/* Fester Zufall: jede Seite zeigt dieselbe Aufstellung. */
function zufall(saat: number) {
  let s = saat;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Platz = { x: number; z: number; s: number; verzug: number; phase: number };

function aufstellen(
  n: number,
  saat: number,
  rMin: number,
  rMax: number,
  abstand: number,
) {
  const r = zufall(saat);
  const plaetze: Platz[] = [];
  let versuche = 0;
  while (plaetze.length < n && versuche++ < 20000) {
    const w = r() * Math.PI * 2;
    const d = Math.sqrt(rMin * rMin + r() * (rMax * rMax - rMin * rMin));
    const x = Math.cos(w) * d;
    const z = Math.sin(w) * d;
    if (
      plaetze.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < abstand * abstand)
    )
      continue;
    plaetze.push({
      x,
      z,
      s: 0.8 + r() * 0.35,
      verzug: r() * 0.55,
      phase: r() * Math.PI * 2,
    });
  }
  return plaetze;
}

const { mast, rotor } = (() => {
  const turm = createTowerGeometry();
  const gondel = createNacelleGeometry().translate(0, HUB_Y, 0);
  const mast = mergeGeometries([turm, gondel], false);
  const blaetter = [0, 1, 2].map((i) => {
    const b = createBladeGeometry(10, 8);
    b.clearGroups();
    b.translate(0, DIMENSIONS.hubRadius * 0.55, 0);
    b.rotateX((i * Math.PI * 2) / 3);
    return b;
  });
  const rotor = mergeGeometries(blaetter, false);
  return { mast, rotor };
})();

const plaetze = aufstellen(ANZAHL, 7, 240, 1500, 95);
const geplant = aufstellen(GEPLANT, 31, 520, 1300, 200);

const mat = {
  anlage: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.65 }),
  umriss: new THREE.MeshBasicMaterial({
    color: "#E0472A",
    transparent: true,
    opacity: 0,
    depthWrite: false,
    wireframe: true,
  }),
};

/* Imperativ angelegt, damit die Instanzfarben schon beim ersten
     Kompilieren des Shaders existieren. */
const netze = (() => {
  const neu = (
    g: THREE.BufferGeometry,
    m: THREE.Material,
    n: number,
    farbe: boolean,
  ) => {
    const x = new THREE.InstancedMesh(g, m, n);
    x.frustumCulled = false;
    x.visible = false;
    if (farbe)
      for (let i = 0; i < n; i++) x.setColorAt(i, new THREE.Color("#E9EBEB"));
    return x;
  };
  return {
    masten: neu(mast, mat.anlage, ANZAHL, true),
    rotoren: neu(rotor, mat.anlage, ANZAHL, true),
    umrisse: neu(mast, mat.umriss, GEPLANT, false),
    umrissRotoren: neu(rotor, mat.umriss, GEPLANT, false),
  };
})();
const hilf = {
  o: new THREE.Object3D(),
  grund: new THREE.Color("#E9EBEB"),
  signal: new THREE.Color("#E0472A"),
  c: new THREE.Color(),
  winkel: 0,
};

export default function Flotte() {
  useFrame((_, dt) => {
    const hoehe = lauf.szene.flotte;
    const sichtbar = hoehe > 0.001;
    netze.masten.visible = sichtbar;
    netze.rotoren.visible = sichtbar;
    const pl = lauf.szene.planung;
    netze.umrisse.visible = pl > 0.01;
    netze.umrissRotoren.visible = pl > 0.01;
    mat.umriss.opacity = pl * 0.5;
    if (!sichtbar && pl <= 0.01) return;

    hilf.winkel += Math.min(dt, 0.1) * 1.4;
    const n = lauf.szene.markiert;
    const { o, c } = hilf;

    plaetze.forEach((p, i) => {
      const h = klemm((hoehe * 1.55 - p.verzug) / 1) * p.s;
      const y = Math.max(h, 0.0001);
      o.position.set(p.x, 0, p.z);
      o.rotation.set(0, 0, 0);
      o.scale.set(p.s, y, p.s);
      o.updateMatrix();
      netze.masten.setMatrixAt(i, o.matrix);

      o.position.set(p.x + HUB_X * p.s, HUB_Y * y, p.z);
      o.rotation.set(hilf.winkel + p.phase, 0, 0);
      o.scale.setScalar(Math.max(y, 0.0001));
      o.updateMatrix();
      netze.rotoren.setMatrixAt(i, o.matrix);

      const an = klemm(n - i);
      c.copy(hilf.grund).lerp(hilf.signal, an);
      netze.masten.setColorAt(i, c);
      netze.rotoren.setColorAt(i, c);
    });
    netze.masten.instanceMatrix.needsUpdate = true;
    netze.rotoren.instanceMatrix.needsUpdate = true;
    if (netze.masten.instanceColor)
      netze.masten.instanceColor.needsUpdate = true;
    if (netze.rotoren.instanceColor)
      netze.rotoren.instanceColor.needsUpdate = true;

    geplant.forEach((p, i) => {
      o.position.set(p.x, 0, p.z);
      o.rotation.set(0, 0, 0);
      o.scale.setScalar(1.6);
      o.updateMatrix();
      netze.umrisse.setMatrixAt(i, o.matrix);
      o.position.set(p.x + HUB_X * 1.6, HUB_Y * 1.6, p.z);
      o.rotation.set(hilf.winkel * 0.5 + p.phase, 0, 0);
      o.updateMatrix();
      netze.umrissRotoren.setMatrixAt(i, o.matrix);
    });
    netze.umrisse.instanceMatrix.needsUpdate = true;
    netze.umrissRotoren.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <primitive object={netze.masten} />
      <primitive object={netze.rotoren} />
      <primitive object={netze.umrisse} />
      <primitive object={netze.umrissRotoren} />
    </>
  );
}
