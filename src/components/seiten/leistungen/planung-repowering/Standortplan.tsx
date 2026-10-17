"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DIMENSIONS } from "@/components/three/turbineGeometry";
import { lauf } from "@/components/erlebnis/lauf";
import { glatt, klemm } from "@/components/erlebnis/zeitachse";
import { schrittEnde, schrittT } from "./takte";

/**
 * Lageplan am Boden für „Der Standort" (Zusatz der Partitur).
 *
 * Jeder Verfahrensschritt zeichnet etwas auf das Gelände, und der Plan
 * wächst mit: Was ein Schritt gezeichnet hat, bleibt blass stehen, wenn
 * der nächste kommt — am Ende liegt der ganze Plan um die Anlage.
 *
 *   1 Standortbewertung   Abstandsringe, dahinter die Bebauung
 *   2 Wirtschaftlichkeit  zwei Säulen: Bestand / Repowering
 *   3 Vorplanung          Zuwegung und Kranstellfläche
 *   4 Genehmigung (§ 16b) nur die Veränderung in Signalrot: Turm von 60
 *                         auf 120 m, neuer Rotorkreis
 *   5 Ausführungsplanung  Netzanschluss als Strichlinie zum Horizont
 *
 * Alle Maße sind Bild, keine Planwerte — es gibt keine Beschriftung mit
 * Zahlen. Die Anlage selbst (Geist, Maßstab) steuert die Partitur.
 *
 * three-Objekte liegen auf Modulebene (Lint-Regel react-hooks/immutability,
 * docs/04-sayfa-api.md Abschnitt 8).
 */

const TINTE = "#121417";
const SIGNAL = "#E0472A";
/** Knapp über dem Boden, damit nichts mit dem Raster flimmert. */
const BODEN_Y = 0.3;

const HUB_Y = DIMENSIONS.towerHeight + 0.4;
const ROTOR_R = DIMENSIONS.hubRadius + DIMENSIONS.bladeLength;
const ROTOR_X = DIMENSIONS.nacelleLength * 0.42 + 1.2;

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

/* ------------------------------------------------------------------ */
/* Geometrie-Werkzeug                                                  */
/* ------------------------------------------------------------------ */

/** Band entlang eines Linienzugs am Boden (Breite in m). */
function band(punkte: [number, number][], breite: number) {
  const p: number[] = [];
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
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
}

/** Strichlinie als einzelne Vierecke — so lässt sie sich per drawRange abrollen. */
function strichlinie(
  von: [number, number],
  bis: [number, number],
  strich: number,
  luecke: number,
  breite: number,
) {
  const l = Math.hypot(bis[0] - von[0], bis[1] - von[1]);
  const dx = (bis[0] - von[0]) / l;
  const dz = (bis[1] - von[1]) / l;
  const p: number[] = [];
  let n = 0;
  for (let s = 0; s < l; s += strich + luecke) {
    const e = Math.min(l, s + strich);
    const a: [number, number] = [von[0] + dx * s, von[1] + dz * s];
    const b: [number, number] = [von[0] + dx * e, von[1] + dz * e];
    const h = breite / 2;
    const nx = -dz * h;
    const nz = dx * h;
    p.push(
      a[0] + nx, 0, a[1] + nz, b[0] + nx, 0, b[1] + nz, b[0] - nx, 0, b[1] - nz,
      a[0] + nx, 0, a[1] + nz, b[0] - nx, 0, b[1] - nz, a[0] - nx, 0, a[1] - nz,
    );
    n++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return { g, n };
}

/** Rechteck als Umriss (vier Bänder) am Boden. */
function rahmen(cx: number, cz: number, b: number, t: number, breite: number) {
  const x0 = cx - b / 2;
  const x1 = cx + b / 2;
  const z0 = cz - t / 2;
  const z1 = cz + t / 2;
  return band(
    [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
      [x0, z0 - breite / 2],
    ],
    breite,
  );
}

/* ------------------------------------------------------------------ */
/* 1 — Standortbewertung: Abstandsringe und Bebauung                   */
/* ------------------------------------------------------------------ */

const ringMat = flach(SIGNAL);
const hausMat = new THREE.MeshBasicMaterial({
  color: TINTE,
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const ringe = new THREE.Group();
for (const r of [150, 300, 450]) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r - 1.4, r + 1.4, 160), ringMat);
  m.rotation.x = -Math.PI / 2;
  ringe.add(m);
}
ringe.position.y = BODEN_Y;

/* Bebauung jenseits des äußeren Rings: zwei kleine Ortslagen — beide im
   Nordosten, auf der Seite, die nicht unter dem Text liegt. */
const haeuser = new THREE.Group();
const hausGeo = new THREE.BoxGeometry(14, 9, 10);
const lagen: [number, number][] = [
  [230, -440], [265, -425], [205, -475], [250, -480], [290, -460],
  [395, -300], [425, -275], [410, -335], [450, -310],
];
for (const [x, z] of lagen) {
  const m = new THREE.Mesh(hausGeo, hausMat);
  m.position.set(x, 4.5, z);
  m.rotation.y = (x * 0.013 + z * 0.007) % 1;
  haeuser.add(m);
}

/* ------------------------------------------------------------------ */
/* 2 — Wirtschaftlichkeit: Bestand / Repowering                        */
/* ------------------------------------------------------------------ */

const bestandMat = new THREE.MeshBasicMaterial({ color: TINTE, transparent: true, opacity: 0, depthWrite: false });
const repowerMat = new THREE.MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0, depthWrite: false });
const bestandKante = new THREE.LineBasicMaterial({ color: TINTE, transparent: true, opacity: 0 });
const repowerKante = new THREE.LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0 });

/** Säule, Fuß am Boden; skaliert in y von 0 auf ihre Höhe. */
function saeule(hoehe: number, fuell: THREE.Material, kante: THREE.LineBasicMaterial) {
  const geo = new THREE.BoxGeometry(14, hoehe, 14);
  geo.translate(0, hoehe / 2, 0);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, fuell));
  g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), kante));
  return g;
}
/* Reine Gegenüberstellung, kein Ertragswert. Unter „Wirtschaftlichkeit"
   würde ein Verhältnis 1 : 2 als Vielfaches gelesen, das der Content
   nirgends verspricht — darum nur ein mäßiger Unterschied. */
const saeuleBestand = saeule(HUB_Y, bestandMat, bestandKante);
const saeuleRepower = saeule(HUB_Y * 1.35, repowerMat, repowerKante);
saeuleBestand.position.set(-96, 0, -20);
saeuleRepower.position.set(-66, 0, -20);

/* ------------------------------------------------------------------ */
/* 3 — Vorplanung: Zuwegung und Kranstellfläche                        */
/* ------------------------------------------------------------------ */

const wegMat = flach(TINTE);
const kranMat = flach(SIGNAL);
/* Kranstellfläche neben dem Turmfuß, am Ende der Zuwegung (Mitte x, z). */
const KRAN: [number, number] = [40, 34];
const kranFlaecheMat = flach(SIGNAL);
const weg = new THREE.Mesh(
  band(
    [
      [1000, 180],
      [620, 150],
      [320, 100],
      [130, 52],
      [48, 22],
      [24, 12],
    ],
    6,
  ),
  wegMat,
);
weg.position.y = BODEN_Y;
const kran = new THREE.Mesh(rahmen(KRAN[0], KRAN[1], 42, 24, 1.6), kranMat);
kran.position.y = BODEN_Y + 0.05;
const kranFlaeche = new THREE.Mesh(new THREE.PlaneGeometry(42, 24), kranFlaecheMat);
kranFlaeche.rotation.x = -Math.PI / 2;
kranFlaeche.position.set(KRAN[0], BODEN_Y, KRAN[1]);

/* ------------------------------------------------------------------ */
/* 4 — Genehmigung nach § 16b: nur die Veränderung                     */
/* ------------------------------------------------------------------ */

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

/* Maßlinie neben dem Turm: vom alten zum neuen Nabenniveau. Sie steht auf
   der Seite zum Text hin, damit sie nicht im Rotor verschwindet. */
const MASS_AB = 34;
const massKette = new THREE.Group();
const kette = new THREE.Mesh(new THREE.BoxGeometry(0.9, HUB_Y, 0.9), diffMat);
kette.position.y = HUB_Y / 2;
massKette.add(kette);
massKette.position.set(-MASS_AB * 0.7, HUB_Y, MASS_AB * 0.7);
differenz.add(massKette);
/* Ober- und Unterkante als kurze Querstriche, zur Turmachse hin. */
const quer = new THREE.BoxGeometry(MASS_AB, 0.7, 0.7);
const unten = new THREE.Mesh(quer, altMat);
const oben = new THREE.Mesh(quer, diffMat);
for (const [m, y] of [
  [unten, HUB_Y],
  [oben, HUB_Y * 2],
] as const) {
  m.position.set(-MASS_AB * 0.35, y, MASS_AB * 0.35);
  m.rotation.y = Math.PI / 4;
  differenz.add(m);
}
/* Rotorkreise: der alte blass, der neue in Signalfarbe. Rotor zeigt nach +x,
   die Kreise stehen also in der y-z-Ebene. */
const kreisAlt = new THREE.Mesh(new THREE.RingGeometry(ROTOR_R - 0.25, ROTOR_R + 0.25, 128), altMat);
kreisAlt.rotation.y = Math.PI / 2;
kreisAlt.position.set(ROTOR_X, HUB_Y, 0);
const kreisNeu = new THREE.Mesh(new THREE.RingGeometry(ROTOR_R * 2 - 0.5, ROTOR_R * 2 + 0.5, 160), diffMat);
kreisNeu.rotation.y = Math.PI / 2;
kreisNeu.position.set(ROTOR_X * 2, HUB_Y * 2, 0);
differenz.add(kreisAlt, kreisNeu);

/* ------------------------------------------------------------------ */
/* 5 — Ausführungsplanung: Netzanschluss                               */
/* ------------------------------------------------------------------ */

const netzMat = flach(SIGNAL);
const NETZ_ZIEL: [number, number] = [1250, -1450];
const netzLinie = strichlinie([5, -6], NETZ_ZIEL, 22, 14, 3.2);
const netz = new THREE.Mesh(netzLinie.g, netzMat);
netz.position.y = BODEN_Y;
/* Netzverknüpfungspunkt am Ende der Leitung */
const knotenMat = flach(SIGNAL);
const knoten = new THREE.Mesh(rahmen(NETZ_ZIEL[0], NETZ_ZIEL[1], 60, 60, 4), knotenMat);
knoten.position.y = BODEN_Y;

const plan = new THREE.Group();
plan.add(ringe, haeuser, saeuleBestand, saeuleRepower, weg, kranFlaeche, kran, differenz, netz, knoten);

/* ------------------------------------------------------------------ */

/**
 * Sichtbarkeit eines Schritts: blendet zu Beginn seines Takts ein, steht
 * voll bis zum Ende und bleibt dann mit `rest` stehen (der Plan wächst).
 * Weg in den Takt (0–1) für Aufbau-Bewegungen als zweiter Wert.
 */
function schritt(T: number, i: number, rest: number): [number, number] {
  const a = schrittT(i);
  const e = schrittEnde(i);
  const ein = klemm((T - (a - 0.02)) / 0.06);
  const aus = klemm((T - e) / 0.05);
  const weg = klemm((T - a) / Math.max(0.01, (e - a) * 0.55));
  return [ein * (1 - aus * (1 - rest)), glatt(weg)];
}

export default function Standortplan() {
  useFrame(() => {
    const T = lauf.szeneT;
    /* Nach dem Verfahren (Datenblatt, Abspann) tritt der Plan zurück. */
    const p = lauf.partitur;
    const daten = p ? p.kapitel.findIndex((k) => k.id === "daten") : 2;
    const ende = 1 - klemm((T - (daten + 0.2)) / 0.6) * 0.75;
    const w = lauf.wechsel * ende;

    const [r, rw] = schritt(T, 0, 0.32);
    ringMat.opacity = r * 0.75 * w;
    ringe.scale.setScalar(0.02 + rw * 0.98);
    ringe.visible = ringMat.opacity > 0.005;
    /* Die Häuser gehören nur zur Standortbewertung; in den Seitenansichten
       stünden sie im Vordergrund unter dem Text. */
    const [h] = schritt(T, 0, 0);
    hausMat.opacity = h * 0.55 * w;
    haeuser.visible = hausMat.opacity > 0.005;

    const [s, sw] = schritt(T, 1, 0);
    bestandMat.opacity = s * 0.16 * w;
    repowerMat.opacity = s * 0.22 * w;
    bestandKante.opacity = s * 0.85 * w;
    repowerKante.opacity = s * 0.95 * w;
    /* Erst steht der Bestand, dann wächst die Repowering-Säule. */
    saeuleBestand.scale.y = Math.max(0.001, klemm(sw * 2));
    saeuleRepower.scale.y = Math.max(0.001, klemm((sw - 0.3) / 0.7));
    saeuleBestand.visible = saeuleRepower.visible = s * w > 0.005;

    const [v, vw] = schritt(T, 2, 0.45);
    wegMat.opacity = v * 0.5 * w;
    kranMat.opacity = v * 0.9 * w;
    kranFlaecheMat.opacity = v * 0.14 * w;
    /* Die Kranstellfläche füllt sich, nachdem die Zuwegung liegt. */
    kranFlaecheMat.opacity *= klemm(vw * 2 - 0.6);
    weg.visible = kran.visible = kranFlaeche.visible = v * w > 0.005;

    /* § 16b: im vierten Schritt, und im sechsten noch einmal, solange die
       Anlage in die roten Maße hineinwächst. Im fünften (Draufsicht auf
       die Leitung) stünde sie nur im Weg. */
    const [g, gw] = schritt(T, 3, 0);
    const [g6, w6] = schritt(T, 5, 0);
    const d = Math.max(g, g6 * (1 - klemm((w6 - 0.75) / 0.25)));
    diffMat.opacity = d * 0.95 * w;
    altMat.opacity = d * 0.6 * w;
    massKette.scale.y = Math.max(0.001, g6 > 0 ? 1 : gw);
    oben.visible = g6 > 0 || gw > 0.98;
    differenz.visible = d * w > 0.005;

    const [n, nw] = schritt(T, 4, 0.5);
    netzMat.opacity = n * 0.85 * w;
    knotenMat.opacity = n * 0.85 * klemm(nw * 3 - 2) * w;
    netz.geometry.setDrawRange(0, Math.ceil(netzLinie.n * nw) * 6);
    netz.visible = knoten.visible = n * w > 0.005;
  });
  return <primitive object={plan} />;
}
