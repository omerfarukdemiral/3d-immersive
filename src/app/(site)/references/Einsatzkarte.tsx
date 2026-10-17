"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { bundeslaender } from "@/content/deutschlandkarte";
import { karteNachWelt } from "@/components/erlebnis/Karte";
import { lauf } from "@/components/erlebnis/lauf";
import type { Punkt } from "@/components/erlebnis/partitur";
import { istNacht, klemm, zahl } from "@/components/erlebnis/zeitachse";
import { index, tAus, takteEinsatz } from "./raster";

/**
 * Zusatz der Referenzseite: was auf der Deutschlandkarte geschieht.
 *
 * Die Ländergrenzen zeichnet die Bühne selbst (Spur `karte`). Hier kommt
 * dazu, was die Seite erzählt — und bewusst nicht mehr:
 *
 * - Ein gleichmäßiges Punktraster über der Fläche Deutschlands. Es steht
 *   für das Einsatzgebiet, nicht für Anlagen: Die Seite sagt selbst
 *   „Einzelne Anlagenstandorte zeigen wir nicht." Ein Raster kann man
 *   nicht als Standortkarte missverstehen, eine gestreute Wolke schon.
 *   Während der Kennzahlen färbt es sich von Musterstadt aus rot.
 * - „Die Ferne kommt zuerst": Ringe laufen vom Firmensitz über das Land.
 * - „Fahrt zur Anlage, nicht zum Termin": zwei gleich starke Linien nach
 *   Mecklenburg und an den Niederrhein — die Strecke ist anders, die Linie
 *   nicht.
 * - Der Firmensitz als Punkt mit Namen.
 */

/* ------------------------------------------------------------------ */
/* Punktraster über der Fläche                                         */
/* ------------------------------------------------------------------ */

/* Ländergrenzen als Ringe von Punkten (Pfade bestehen nur aus M, L, Z). */
const ringe: [number, number][][] = [];
for (const land of bundeslaender) {
  let ring: [number, number][] = [];
  for (const t of land.d.match(/[MLZ][^MLZ]*/g) ?? []) {
    if (t[0] === "Z") {
      if (ring.length > 2) ringe.push(ring);
      ring = [];
      continue;
    }
    const [x, y] = t.slice(1).trim().split(/[\s,]+/).map(Number);
    if (t[0] === "M" && ring.length > 2) {
      ringe.push(ring);
      ring = [];
    }
    ring.push([x, y]);
  }
  if (ring.length > 2) ringe.push(ring);
}

/* Gerade-ungerade-Regel je Ring, „innen" sobald ein Ring den Punkt
   enthält: Berlin liegt als Loch in Brandenburg und zugleich als eigenes
   Land darüber — über alle Ringe gemeinsam gezählt, fiele es heraus. */
function innen(x: number, y: number) {
  let drin = false;
  for (const r of ringe) {
    let kreuzt = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i];
      const [xj, yj] = r[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
        kreuzt = !kreuzt;
    }
    if (kreuzt) {
      drin = true;
      break;
    }
  }
  return drin;
}

/* Versetztes Raster (Bienenwabe) — gleichmäßig, ohne Ordnung nach Ort. */
const RASTER = 11;
const punktGeo = (() => {
  const p: number[] = [];
  const v = new THREE.Vector3();
  for (let zeile = 0, y = 4; y < 759; zeile++, y += RASTER * 0.866) {
    for (let x = (zeile % 2) * (RASTER / 2) + 3; x < 560; x += RASTER) {
      if (!innen(x, y)) continue;
      karteNachWelt(x, y, v);
      p.push(v.x, 1, v.z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  return g;
})();

/* Alles hier liegt flach knapp über dem Boden. Aus großer Höhe reicht
   die Tiefenauflösung dafür nicht, die Flächen flimmerten gegen den
   Boden — deshalb ohne Tiefentest. Verdecken könnte sie ohnehin nur die
   Anlage, und an der stehen Raster und Linien nicht. */
const punktMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  depthTest: false,
  uniforms: {
    uGroesse: { value: 40 },
    uSkala: { value: 450 },
    uDeck: { value: 0 },
    uWelle: { value: 0 },
    uRot: { value: 1 },
    uGrund: { value: new THREE.Color("#121417") },
    uSignal: { value: new THREE.Color("#E0472A") },
  },
  vertexShader: /* glsl */ `
    uniform float uGroesse;
    uniform float uSkala;
    varying float vAbstand;
    void main() {
      vAbstand = length(position.xz);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      /* Gedeckelt: In Bodennähe würden die vorderen Punkte sonst zu
         Scheiben aufquellen. */
      gl_PointSize = clamp(uGroesse * uSkala / -mv.z, 2.0, 7.0);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uDeck;
    uniform float uWelle;
    uniform float uRot;
    uniform vec3 uGrund;
    uniform vec3 uSignal;
    varying float vAbstand;
    void main() {
      vec2 q = gl_PointCoord - 0.5;
      float r = length(q);
      if (r > 0.5) discard;
      float kante = 1.0 - smoothstep(0.38, 0.5, r);
      /* Weiche Front statt harter Kante: 260 m Übergang. */
      float rot = (1.0 - smoothstep(uWelle - 260.0, uWelle, vAbstand)) * uRot;
      vec3 c = mix(uGrund, uSignal, rot);
      gl_FragColor = vec4(c, kante * uDeck * mix(0.42, 1.0, rot));
    }
  `,
});
const punkte = new THREE.Points(punktGeo, punktMat);
punkte.frustumCulled = false;
punkte.renderOrder = 2;

/* ------------------------------------------------------------------ */
/* Ringe, Linien, Firmensitz                                           */
/* ------------------------------------------------------------------ */

const flach = (g: THREE.BufferGeometry) => g.rotateX(-Math.PI / 2);
const signal = (deck = 0) =>
  new THREE.MeshBasicMaterial({
    color: "#E0472A",
    transparent: true,
    opacity: deck,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  });

/* Zwei Ringe hintereinander, Radius 1 — skaliert wird pro Bild. */
const ringGeo = flach(new THREE.RingGeometry(0.985, 1, 160));

/* Westlichster Kartenpunkt in Weltkoordinaten. Die Text-Spalte steht
   links neben der Karte; was westlich der Landesgrenze läge, läge im
   Text. Die Ringe enden darum weich an dieser Linie, statt über
   Überschrift und Absatz zu laufen — „bis an die Landesgrenzen". */
const WESTEN = karteNachWelt(
  Math.min(...ringe.flatMap((r) => r.map(([x]) => x))),
  0,
).x;

const ferneRinge = [0, 1].map(() => {
  const m = new THREE.Mesh(
    ringGeo,
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      uniforms: {
        uDeck: { value: 0 },
        uWesten: { value: WESTEN },
        uFarbe: { value: new THREE.Color("#E0472A") },
      },
      vertexShader: /* glsl */ `
        varying float vX;
        void main() {
          vX = (modelMatrix * vec4(position, 1.0)).x;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uDeck;
        uniform float uWesten;
        uniform vec3 uFarbe;
        varying float vX;
        void main() {
          /* 240 m weicher Auslauf diesseits der Grenze. */
          float drin = smoothstep(uWesten, uWesten + 240.0, vX);
          gl_FragColor = vec4(uFarbe, uDeck * drin);
        }
      `,
    }),
  );
  m.position.y = 2;
  m.renderOrder = 3;
  return m;
});

/* „Mecklenburg" und „Niederrhein" als Kartenpunkte (SVG-Koordinaten).
   Keine Anlagen — Landschaften, die der Satz selbst nennt. */
const ziele = [
  { name: "Mecklenburg", x: 405, y: 112 },
  { name: "Niederrhein", x: 106, y: 304 },
].map((z) => ({ ...z, welt: karteNachWelt(z.x, z.y) }));

/* Band von 0 bis 1 entlang +x, flach; Länge und Richtung pro Linie. */
const bandGeo = flach(new THREE.PlaneGeometry(1, 1)).translate(0.5, 0, 0);
const punktZielGeo = flach(new THREE.CircleGeometry(1, 40));
const linienMat = signal();
const fahrten = ziele.map((z) => {
  const band = new THREE.Mesh(bandGeo, linienMat);
  band.position.y = 2.5;
  band.rotation.y = -Math.atan2(z.welt.z, z.welt.x);
  band.renderOrder = 4;
  const ende = new THREE.Mesh(punktZielGeo, linienMat);
  ende.position.set(z.welt.x, 2.5, z.welt.z);
  ende.renderOrder = 4;
  return { band, ende, laenge: Math.hypot(z.welt.x, z.welt.z) };
});

const sitzMat = signal(1);
const sitz = new THREE.Mesh(punktZielGeo, sitzMat);
sitz.position.y = 3;
sitz.renderOrder = 5;
const sitzRing = new THREE.Mesh(ringGeo, signal());
sitzRing.position.y = 3;
sitzRing.renderOrder = 5;

/* ------------------------------------------------------------------ */
/* Ablauf über die Erzählzeit                                          */
/* ------------------------------------------------------------------ */

/* Deckkraft des Rasters: steigt erst gegen Ende des Aufstiegs (wie die
   Karte, s. partitur.ts), tritt bei „Einzelne Anlagenstandorte zeigen
   wir nicht." zurück und verschwindet an der
   Anlage (Ausgangslagen, Datenblatt) — aus Bodennähe wäre es nur Muster.
   Zum Schluss, wieder in der Aufsicht, kommt es zurück. */
const deckSpur: Punkt<number>[] = [
  [tAus("deutschland", 0.12), 0],
  [tAus("deutschland", 0.22), 1],
  [tAus("einsatz", 0.8), 1],
  [tAus("einsatz", 0.9), 0.3],
  [tAus("einsatz", 0.97), 0.3],
  [tAus("lagen", 0.03), 0],
  [index("abspann"), 0],
  [index("abspann") + 0.15, 0.6],
];

/* Rote Front: jede der vier Kennzahlen schiebt sie ein Stück weiter, bis
   das ganze Land rot ist. Die Schritte sind Bild, kein Maß. */
const z = (q: number) => tAus("deutschland", q);
const welleSpur: Punkt<number>[] = [
  [z(0.33), 0],
  [z(0.42), 900],
  [z(0.52), 900],
  [z(0.59), 1700],
  [z(0.69), 1700],
  [z(0.76), 2600],
  [z(0.86), 2600],
  [z(0.95), 4400],
];
/* Mit dem Wechsel zu „Wo wir arbeiten" wird das Rot wieder Tinte. */
const rotSpur: Punkt<number>[] = [
  [z(0.97), 1],
  [tAus("einsatz", 0.1), 0],
  [index("abspann"), 0],
  [index("abspann") + 0.5, 1],
];

const e = (q: number) => tAus("einsatz", q);
const [ferneA, ferneB] = takteEinsatz.ferne;
const [fahrtA, fahrtB] = takteEinsatz.fahrt;

/* Größen am Firmensitz: in der Aufsicht groß genug zum Sehen, an der
   Anlage (Kapitel „lagen") klein genug, um nicht zu stören. */
const sitzSpur: Punkt<number>[] = [
  [tAus("deutschland", 0.1), 8],
  [tAus("deutschland", 0.2), 46],
  [tAus("einsatz", 0.95), 46],
  [tAus("lagen", 0.04), 8],
  [index("abspann"), 8],
  [index("abspann") + 0.15, 46],
];

const ROT = new THREE.Color("#E0472A");
const NACHT_ROT = new THREE.Color("#FF6A4D");

export default function Einsatzkarte() {
  const etikett = useRef<HTMLDivElement>(null);

  useFrame(({ gl, size }) => {
    const T = lauf.szeneT;
    const k = lauf.szene.karte;
    const nacht = istNacht(lauf.uhr);
    const auf = lauf.wechsel;

    /* Raster */
    punktMat.uniforms.uSkala.value = (size.height * gl.getPixelRatio()) / 2;
    punktMat.uniforms.uDeck.value = zahl(deckSpur, T) * k * auf;
    punktMat.uniforms.uWelle.value = zahl(welleSpur, T);
    punktMat.uniforms.uRot.value = zahl(rotSpur, T);
    punktMat.uniforms.uGrund.value.set(nacht ? "#C9DBEE" : "#121417");
    punkte.visible = punktMat.uniforms.uDeck.value > 0.003;

    /* Ferne: zwei Ringe laufen nacheinander über das Land */
    ferneRinge.forEach((m, i) => {
      const q = klemm((T - e(ferneA + i * 0.06)) / (e(ferneB) - e(ferneA)));
      /* Bis an die Landesgrenzen; im Westen schneidet der Shader ab
         (WESTEN), dort stünde sonst der Text. */
      const r = 40 + q * 2900;
      m.scale.set(r, 1, r);
      (m.material as THREE.ShaderMaterial).uniforms.uDeck.value =
        q > 0 && q < 1 ? Math.sin(q * Math.PI) * (1 - q * 0.6) * 0.85 * k : 0;
      m.visible = q > 0 && q < 1;
    });

    /* Fahrt: zwei Linien gleicher Stärke, beide wachsen gleich schnell
       auf ihren Anteil — die längere braucht nicht länger im Bild. */
    const zug = klemm((T - e(fahrtA)) / ((e(fahrtB) - e(fahrtA)) * 0.45));
    const weg = klemm((T - e(fahrtB - 0.02)) / (e(fahrtB + 0.08) - e(fahrtB - 0.02)));
    linienMat.opacity = zug > 0 ? (1 - weg) * 0.9 * k : 0;
    linienMat.color.copy(nacht ? NACHT_ROT : ROT);
    for (const f of fahrten) {
      f.band.visible = linienMat.opacity > 0.003;
      f.band.scale.set(Math.max(1, f.laenge * zug), 1, 16);
      f.ende.visible = f.band.visible && zug > 0.98;
      f.ende.scale.setScalar(34);
    }

    /* Firmensitz: Punkt, darum ein langsamer Puls */
    const s = zahl(sitzSpur, T);
    sitz.scale.setScalar(s);
    /* An der Anlage (kleine Größe) tritt der Punkt ganz zurück: Dort
       stünde er als rote Scheibe am Turmfuß. */
    sitzMat.opacity = klemm((s - 9) / 12) * k * auf;
    sitz.visible = sitzMat.opacity > 0.003;
    const puls = lauf.ruhig ? 0.5 : (performance.now() / 2400) % 1;
    sitzRing.scale.setScalar(s * (1.4 + puls * 2.6));
    (sitzRing.material as THREE.MeshBasicMaterial).opacity =
      (1 - puls) * 0.7 * k * auf;
    sitzRing.visible = sitz.visible;

    if (etikett.current) {
      /* Name nur in der Aufsicht; an der Anlage stünde er im Weg, und
         im Abspann läge er im Hochformat mitten im Kontakttext. */
      const abspann = klemm((T - index("abspann") + 0.3) / 0.2);
      const sicht = klemm((s - 20) / 20) * (1 - abspann) * k * auf;
      etikett.current.style.opacity = sicht.toFixed(3);
      etikett.current.style.color = nacht ? "#ECEBE4" : "#121417";
    }
  });

  return (
    <>
      <primitive object={punkte} />
      {ferneRinge.map((m, i) => (
        <primitive key={i} object={m} />
      ))}
      {fahrten.map((f, i) => (
        <group key={i}>
          <primitive object={f.band} />
          <primitive object={f.ende} />
        </group>
      ))}
      <primitive object={sitz} />
      <primitive object={sitzRing} />
      {/* Name des Firmensitzes. Nur Bild: Der Text steht im HTML der
          Seite (Kapitel „Einsatz"), Screenreader brauchen ihn hier nicht. */}
      <Html position={[0, 0, 0]} zIndexRange={[1, 0]} pointerEvents="none">
        <div
          ref={etikett}
          aria-hidden="true"
          style={{
            opacity: 0,
            transform: "translate(18px, -50%)",
            font: "600 11px/1 var(--font-archivo, sans-serif)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Musterstadt
        </div>
      </Html>
    </>
  );
}
