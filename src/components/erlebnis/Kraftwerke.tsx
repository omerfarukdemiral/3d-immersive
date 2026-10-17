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
import { MASTABSTAND, kraftwerke, trasse } from "./kraftwerkOrte";
import {
  PORTAL,
  biogas,
  balken,
  block,
  eins,
  mat as bauMat,
  solarpark,
  speicher,
  umspannwerk,
  zylinder,
  type Teil,
  type V3,
} from "./kraftwerkBauten";
import { glatt, istNacht, klemm } from "./zeitachse";

/**
 * Fünf Kraftwerke und eine Freileitung, ganz aus Code.
 *
 * Windpark, Solarpark, Batteriespeicher, Biogasanlage und Umspannwerk
 * entstehen aus Quadern, Zylindern und den Bauteilen der einen Anlage —
 * kein Modell wird geladen. Jedes Kraftwerk ist ein eigenes, einmal
 * zusammengeführtes Netz je Material; die Masten der Freileitung sind
 * ein instanziertes Netz, die Leiterseile eine einzige Liniengeometrie,
 * deren Zeichenbereich mit dem Scroll wächst.
 *
 * Gesteuert wird alles über eine Spur: `lauf.szene.kraftwerke` (0–5).
 * Kraftwerk i hebt sich aus dem Boden, sobald der Wert i überschreitet,
 * und trägt seinen roten Ring, solange der Wert zwischen i und i+1 liegt.
 */

/* Materialien der Bauten plus zwei eigene: Fokusring und Leiterseil. */
const mat = {
  ...bauMat,
  ring: new THREE.MeshBasicMaterial({
    color: "#E0472A",
    transparent: true,
    opacity: 0,
    depthWrite: false,
  }),
  seil: new THREE.LineBasicMaterial({ color: "#2B3036" }),
};

/* ------------------------------------------------------------------ */
/* Die fünf Kraftwerke                                                 */
/* ------------------------------------------------------------------ */

/**
 * Windpark: drei Anlagen in einer Reihe quer zur Blickrichtung der
 * Kamera, damit keine hinter der anderen verschwindet. Die Rotoren
 * drehen als eigenes instanziertes Netz.
 */
const REIHE = [0.81, 0.59];
const WIND = [-75, 0, 75].map((t, i) => ({
  x: t * REIHE[0],
  z: t * REIHE[1],
  s: 0.92 + (i % 3) * 0.05,
}));
const HUB_Y = DIMENSIONS.towerHeight + 0.4;
const HUB_X = DIMENSIONS.nacelleLength * 0.42;

const windRotor = (() => {
  const blaetter = [0, 1, 2].map((i) => {
    const b = createBladeGeometry(12, 8);
    b.clearGroups();
    b.translate(0, DIMENSIONS.hubRadius * 0.55, 0);
    b.rotateX((i * Math.PI * 2) / 3);
    return b;
  });
  return mergeGeometries(blaetter, false);
})();

function windpark(): Teil[] {
  const mast = mergeGeometries(
    [createTowerGeometry(), createNacelleGeometry().translate(0, HUB_Y, 0)],
    false,
  );
  const masten = WIND.map((w) =>
    mast.clone().scale(w.s, w.s, w.s).translate(w.x, 0, w.z),
  );
  const fundamente = WIND.map((w) => zylinder(w.x, 0, w.z, 8, 0.4, 24));
  const weg = block(0, 0, 0, 6, 0.2, 170).rotateY(Math.atan2(REIHE[0], REIHE[1]));
  return [
    { geo: eins(masten), mat: mat.hell, wirft: true },
    { geo: eins([...fundamente, weg]), mat: mat.beton },
  ];
}

const bauten = [windpark, solarpark, speicher, biogas, umspannwerk];

/* Einmal auf Modulebene gebaut: Seitenwechsel bauen nichts neu. */
const anlagen = kraftwerke.map((k, i) => {
  const gruppe = new THREE.Group();
  gruppe.position.set(k.x, 0, k.z);
  gruppe.visible = false;
  for (const t of bauten[i]()) {
    const m = new THREE.Mesh(t.geo, t.mat);
    m.receiveShadow = true;
    m.castShadow = !!t.wirft;
    gruppe.add(m);
  }
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(k.r, k.r + 1.6, 96).rotateX(-Math.PI / 2),
    mat.ring.clone(),
  );
  ring.position.set(k.x, 0.35, k.z);
  ring.renderOrder = 2;
  const anker = new THREE.Object3D();
  anker.position.set(k.x, k.ankerY, k.z);
  /* Wie tief das Kraftwerk versinkt: seine ganze Höhe, dann ist es
     vom Boden verdeckt. */
  const tiefe = new THREE.Box3().setFromObject(gruppe).max.y + 1;
  return { k, gruppe, ring, anker, tiefe };
});

const rotoren = (() => {
  const x = new THREE.InstancedMesh(windRotor, mat.hell, WIND.length);
  x.frustumCulled = false;
  x.castShadow = true;
  x.visible = false;
  return x;
})();

/* ------------------------------------------------------------------ */
/* Freileitung                                                         */
/* ------------------------------------------------------------------ */

const MAST_H = 42;
/** Aufhängepunkte der fünf Seile: Erdseil oben, je zwei Leiter pro Traverse. */
const AUFHAENGUNG: V3[] = [
  [0, MAST_H, 0],
  [0, 23.5, -11],
  [0, 23.5, 11],
  [0, 30.5, -8.5],
  [0, 30.5, 8.5],
];

/** Gittermast: vier Eckstiele, Riegel, Kreuzverbände, zwei Traversen. */
const mastGeo = (() => {
  const t: THREE.BufferGeometry[] = [];
  const ebenen = [0, 7, 14, 20, 26, 31, 36];
  const w = (y: number) => 4.5 + (1.2 - 4.5) * (y / 36);
  const ecken = (y: number): V3[] => {
    const b = w(y);
    return [
      [-b, y, -b],
      [b, y, -b],
      [b, y, b],
      [-b, y, b],
    ];
  };
  for (let e = 0; e < ebenen.length - 1; e++) {
    const u = ecken(ebenen[e]);
    const o = ecken(ebenen[e + 1]);
    for (let c = 0; c < 4; c++) {
      const n = (c + 1) % 4;
      t.push(balken(u[c], o[c], 0.45));
      t.push(balken(o[c], o[n], 0.3));
      t.push(balken(u[c], o[n], 0.24));
      t.push(balken(u[n], o[c], 0.24));
    }
  }
  for (const c of ecken(36)) t.push(balken(c, [0, MAST_H, 0], 0.3));
  for (const [y, l] of [
    [26, 11],
    [33, 8.5],
  ]) {
    for (const s of [-1, 1]) {
      const b = w(y);
      t.push(balken([0, y, s * b], [0, y, s * l], 0.5));
      t.push(balken([0, y + 3, s * b], [0, y, s * l], 0.3));
      t.push(balken([0, y, s * l], [0, y - 2.5, s * l], 0.35));
    }
  }
  return eins(t);
})();

/* Maste entlang der Trasse, im festen Abstand, jeweils quer zur Leitung. */
const maste = (() => {
  const liste: { pos: THREE.Vector3; dreh: number; a: number }[] = [];
  for (let i = 0; i < trasse.length - 1; i++) {
    const p = trasse[i];
    const q = trasse[i + 1];
    const dx = q.x - p.x;
    const dz = q.z - p.z;
    const len = Math.hypot(dx, dz);
    const n = Math.max(1, Math.round(len / MASTABSTAND));
    const dreh = Math.atan2(-dz, dx);
    for (let k = 0; k < n; k++) {
      const f = k / n;
      liste.push({
        pos: new THREE.Vector3(p.x + dx * f, 0, p.z + dz * f),
        dreh,
        a: p.a + (q.a - p.a) * f,
      });
    }
  }
  const l = trasse[trasse.length - 1];
  const v = liste[liste.length - 1];
  liste.push({ pos: new THREE.Vector3(l.x, 0, l.z), dreh: v.dreh, a: l.a });
  /* An Knickpunkten mittelt der Mast die Richtung beider Spannfelder. */
  for (let i = 1; i < liste.length - 1; i++) {
    const d1 = liste[i].pos.clone().sub(liste[i - 1].pos).normalize();
    const d2 = liste[i + 1].pos.clone().sub(liste[i].pos).normalize();
    const d = d1.add(d2);
    liste[i].dreh = Math.atan2(-d.z, d.x);
  }
  return liste;
})();

const mastNetz = (() => {
  const x = new THREE.InstancedMesh(mastGeo, mat.stahl, maste.length);
  x.frustumCulled = false;
  x.castShadow = true;
  x.visible = false;
  return x;
})();

/** Leiterseile: Spannfeld für Spannfeld, darin Stück für Stück, darin Seil für Seil. */
const STUECKE = 14;
const seile = (() => {
  const o = new THREE.Object3D();
  const welt = maste.map((m) => {
    o.position.copy(m.pos);
    o.rotation.set(0, m.dreh, 0);
    o.updateMatrix();
    return AUFHAENGUNG.map((p) => new THREE.Vector3(...p).applyMatrix4(o.matrix));
  });
  /* Letztes Spannfeld: vom Endmast ans Abspannportal des Umspannwerks.
     Jedes Seil behält seine Lage quer zur Trasse (z), nur Ort und Höhe
     kommen vom Portal. */
  const uw = kraftwerke[kraftwerke.length - 1];
  welt.push(
    welt[welt.length - 1].map(
      (p, w) =>
        new THREE.Vector3(
          uw.x + PORTAL.x,
          w === 0 ? PORTAL.erdseilY : PORTAL.leiterY,
          p.z,
        ),
    ),
  );
  const pos: number[] = [];
  const punkt = (a: THREE.Vector3, b: THREE.Vector3, t: number, durchhang: number) => [
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t - durchhang * 4 * t * (1 - t),
    a.z + (b.z - a.z) * t,
  ];
  for (let i = 0; i < welt.length - 1; i++) {
    const spann = welt[i][1].distanceTo(welt[i + 1][1]);
    for (let s = 0; s < STUECKE; s++)
      for (let w = 0; w < AUFHAENGUNG.length; w++) {
        const a = welt[i][w];
        const b = welt[i + 1][w];
        const durchhang = spann * (w === 0 ? 0.025 : 0.035);
        pos.push(...punkt(a, b, s / STUECKE, durchhang));
        pos.push(...punkt(a, b, (s + 1) / STUECKE, durchhang));
      }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  const linie = new THREE.LineSegments(g, mat.seil);
  linie.frustumCulled = false;
  linie.visible = false;
  return linie;
})();
const PRO_STUECK = AUFHAENGUNG.length * 2;
/** Wert der Spur, bei dem die Leitung jeden Aufhängepunkt erreicht (Maste, dann Portal). */
const ankunft = [...maste.map((m) => m.a), 4.9];

/* ------------------------------------------------------------------ */
/* Bewegung                                                            */
/* ------------------------------------------------------------------ */

/**
 * Wie weit ein Kraftwerk bei Spurwert v aus dem Boden ist (0–1).
 * Es steigt aus dem Boden, statt in der Höhe gestaucht zu werden: Platt
 * gedrückte Körper warfen im flachen Abendlicht gestreifte Schatten.
 */
const heben = (v: number, ab: number) => glatt(klemm((v - ab) / 0.35));

const hilf = { o: new THREE.Object3D(), v: new THREE.Vector3(), winkel: 0 };

export default function Kraftwerke() {
  useFrame(({ camera, size }, dt) => {
    const v = lauf.szene.kraftwerke;
    const aktiv = v > 0.001;
    const { o } = hilf;

    mastNetz.visible = aktiv;
    seile.visible = aktiv;
    rotoren.visible = aktiv;
    if (!aktiv) {
      for (const a of anlagen) {
        a.gruppe.visible = false;
        a.ring.visible = false;
        const anker = lauf.anker[a.k.id];
        if (anker) anker.da = false;
      }
      return;
    }

    const nacht = istNacht(lauf.uhr);
    mat.seil.color.set(nacht ? "#7E95AE" : "#2B3036");

    anlagen.forEach((a, i) => {
      const h = heben(v, i);
      a.gruppe.visible = h > 0.001;
      a.gruppe.position.y = -(1 - h) * a.tiefe;
      /* Ring nach dem Takt im Text, nicht nach der Spur: Beim Versinken
         durchläuft die Spur jedes Kraftwerk noch einmal. */
      const f = lauf.partitur?.fokus?.find((x) => x.id === a.k.id);
      const fokus = f
        ? klemm((lauf.szeneT - f.von) / 0.01) * klemm((f.bis - lauf.szeneT) / 0.01)
        : 0;
      a.ring.visible = fokus > 0.001;
      (a.ring.material as THREE.MeshBasicMaterial).opacity = fokus * 0.85;

      /* Anker für die Leitlinie zum Textblock (data-teil = id). */
      hilf.v.copy(a.anker.position);
      hilf.v.y += a.gruppe.position.y;
      hilf.v.project(camera);
      const anker = (lauf.anker[a.k.id] ??= { x: 0, y: 0, da: false });
      anker.x = ((hilf.v.x + 1) / 2) * size.width;
      anker.y = ((1 - hilf.v.y) / 2) * size.height;
      anker.da = hilf.v.z < 1 && h > 0.5;
    });

    /* Rotoren des Windparks: gleiche Hebung wie ihr Kraftwerk. */
    const wind = kraftwerke[0];
    const unten = anlagen[0].gruppe.position.y;
    if (!lauf.ruhig) hilf.winkel += Math.min(dt, 0.1) * 1.3;
    WIND.forEach((w, i) => {
      o.position.set(wind.x + w.x + HUB_X * w.s, HUB_Y * w.s + unten, wind.z + w.z);
      o.rotation.set(hilf.winkel + i * 0.9, 0, 0);
      o.scale.setScalar(w.s);
      o.updateMatrix();
      rotoren.setMatrixAt(i, o.matrix);
    });
    rotoren.instanceMatrix.needsUpdate = true;

    /* Maste heben sich, sobald die Leitung bei ihnen ankommt. */
    maste.forEach((m, i) => {
      const h = heben(v, m.a - 0.15);
      o.position.copy(m.pos);
      o.position.y = -(1 - h) * (MAST_H + 1);
      o.rotation.set(0, m.dreh, 0);
      /* Ganz unten: weg, damit er nicht unter dem Boden mitgerendert wird. */
      o.scale.setScalar(h < 0.002 ? 0 : 1);
      o.updateMatrix();
      mastNetz.setMatrixAt(i, o.matrix);
    });
    mastNetz.instanceMatrix.needsUpdate = true;

    /* Seile laufen den Masten hinterher: Spitze der Leitung bei v − 0,3. */
    const spitze = v - 0.3;
    let stuecke = 0;
    for (let i = 0; i < ankunft.length - 1; i++) {
      const a = ankunft[i];
      const b = ankunft[i + 1];
      stuecke += klemm((spitze - a) / Math.max(b - a, 0.0001)) * STUECKE;
    }
    seile.geometry.setDrawRange(0, Math.floor(stuecke) * PRO_STUECK);
  });

  return (
    <>
      {anlagen.map((a) => (
        <group key={a.k.id}>
          <primitive object={a.gruppe} />
          <primitive object={a.ring} />
        </group>
      ))}
      <primitive object={rotoren} />
      <primitive object={mastNetz} />
      <primitive object={seile} />
    </>
  );
}
