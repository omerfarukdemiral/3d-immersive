"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { buehne, lauf } from "./lauf";
import type { Partitur, Stellung } from "./partitur";
import {
  glatt,
  himmelUm,
  istNacht,
  klemm,
  mix,
  kurve,
  sonnenRichtung,
} from "./zeitachse";
import Anlage from "./Anlage";
import Flotte from "./Flotte";
import Karte from "./Karte";
import Kraftwerke from "./Kraftwerke";

/**
 * Eine Szene für alle Erlebnis-Seiten. Sie liegt im Layout fest hinter dem Text
 * und liest bei jedem Bild Erzählzeit und Partitur aus `lauf` — React
 * rendert hier nur neu, wenn eine andere Seite ihren Zusatz mitbringt.
 */
export default function Szene() {
  /* Verliert der Browser den WebGL-Kontext (Tab im Hintergrund auf dem
     Handy, Treiberneustart), wird die Szene neu aufgebaut statt leer
     stehen zu bleiben. */
  const [aufbau, neu] = useState(0);
  /* Auflösung nach Bildrate: Fällt die Szene unter ~50 fps, sinkt die
     Pixeldichte schrittweise bis 1 — lieber etwas weicher als ruckelnd.
     Hat das Gerät Luft, geht sie wieder hoch. */
  const [dichte, setDichte] = useState(() =>
    Math.min(1.5, typeof window === "undefined" ? 1 : window.devicePixelRatio),
  );
  return (
    <Canvas
      key={aufbau}
      dpr={dichte}
      /* PCF statt PCFSoft: three hat PCFSoftShadowMap abgekündigt, und
         die weichen Kanten sind bei 2048er-Schattenkarte kaum zu sehen. */
      shadows="percentage"
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [190, 18, 150], fov: 34, near: 1, far: 20000 }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener(
          "webglcontextlost",
          (e) => {
            e.preventDefault();
            setTimeout(() => neu((n) => n + 1), 400);
          },
          { once: true },
        );
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      {/* Nur abwärts: Jeder Wechsel der Pixeldichte legt den Zeichenpuffer
          neu an und ist als Ruck sichtbar. Ein Hin und Her zwischen zwei
          Stufen war selbst eine Quelle der Hänger. */}
      <PerformanceMonitor
        bounds={() => [45, 200]}
        flipflops={1}
        onDecline={() => setDichte(1)}
      />
      <Welt />
    </Canvas>
  );
}

function Welt() {
  const partitur = useSyncExternalStore(
    buehne.abonnieren,
    buehne.lesen,
    buehne.leer,
  );
  const Zusatz = partitur?.zusatz;
  return (
    <>
      <Kamerafuehrung />
      <Vorwaermen />
      <Himmel />
      <Licht />
      <Boden />
      <Karte />
      <Anlage />
      <Flotte />
      <Kraftwerke />
      {/* Eigene Bausteine der Seite (Partitur.zusatz). Der Schlüssel
          sorgt dafür, dass beim Seitenwechsel kein Zustand hinüberwandert. */}
      {Zusatz ? <Zusatz key={partitur.id} /> : null}
    </>
  );
}

/**
 * Vorwärmen: Ein Bild direkt nach dem Start, in dem alles sichtbar ist —
 * auch die Kraftwerke, die Flotte und die Geister, die erst viel später
 * im Scroll auftauchen. three kompiliert dabei jedes Shaderprogramm
 * (inklusive der Schattenvarianten) und lädt jede Textur auf die GPU.
 * Ohne das passierte all das in dem Moment, in dem ein Kraftwerk zum
 * ersten Mal ins Bild kommt: 300 ms Stillstand mitten im Scroll.
 */
function Vorwaermen() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const versteckt: THREE.Object3D[] = [];
      const ausserhalb: THREE.Object3D[] = [];
      scene.traverse((o) => {
        if (!o.visible) {
          versteckt.push(o);
          o.visible = true;
        }
        /* Auch, was außerhalb des ersten Bildausschnitts liegt: Die
           Kraftwerke stehen bis 1,1 km entfernt. Ohne das wurde ihr
           Shader erst kompiliert, als sie ins Bild kamen — 0,5–0,7 s
           Stillstand, danach sprang die Szene dem Scroll hinterher. */
        if (o.frustumCulled) {
          ausserhalb.push(o);
          o.frustumCulled = false;
        }
      });
      gl.render(scene, camera);
      for (const o of versteckt) o.visible = false;
      for (const o of ausserhalb) o.frustumCulled = true;
    });
    return () => cancelAnimationFrame(id);
  }, [gl, scene, camera]);
  return null;
}

/* ------------------------------------------------------------------ */

const tmp = { pos: [0, 0, 0], blick: [0, 0, 0] };
const weg = new THREE.Vector3();
const ziel = new THREE.Vector3();
const hochAchse = new THREE.Vector3(0, 1, 0);

/* Seitenwechsel: Die Kamera fährt in gut einer Sekunde von ihrer letzten
   Stellung zur ersten der neuen Seite, unabhängig vom Scroll. Gemerkt
   wird das fertige Bild (Ort, Ziel, Brennweite, Bildverschiebung), damit
   auch Hochformat-Korrekturen weich mitlaufen. */
const WECHSEL_S = 1;
const zuletzt = {
  pos: new THREE.Vector3(),
  ziel: new THREE.Vector3(),
  fov: 36,
  versatz: 0,
  hoch: 0,
};
const von = {
  pos: new THREE.Vector3(),
  ziel: new THREE.Vector3(),
  fov: 36,
  versatz: 0,
  hoch: 0,
};
const fahrt = { partitur: null as Partitur | null, start: -Infinity };
/* ?debug in der Adresse: aktuelle Kamerastellung für Messungen im Browser */
if (typeof window !== "undefined" && location.search.includes("debug"))
  (window as unknown as { __kamera: typeof zuletzt }).__kamera = zuletzt;

function Kamerafuehrung() {
  /* Erstes Bild dieses Canvas: Es gibt keine alte Stellung, aus der die
     Kamera kommen könnte (Rückkehr von einer alten Unterseite). */
  const erstes = useRef(true);
  useFrame(({ camera, size, clock }) => {
    const cam = camera as THREE.PerspectiveCamera;
    const p = lauf.partitur;
    if (!p) return;
    const jetzt = clock.elapsedTime;
    if (p !== fahrt.partitur) {
      if (!erstes.current && fahrt.partitur && !lauf.ruhig) {
        von.pos.copy(zuletzt.pos);
        von.ziel.copy(zuletzt.ziel);
        von.fov = zuletzt.fov;
        von.versatz = zuletzt.versatz;
        von.hoch = zuletzt.hoch;
        fahrt.start = jetzt;
      } else {
        fahrt.start = -Infinity;
      }
      fahrt.partitur = p;
    }
    erstes.current = false;

    /* Jede Größe der Stellung als eigene monotone Kurve über T: Die
       Kamera fährt durch Zwischenpunkte hindurch, statt an jedem kurz
       anzuhalten (zeitachse.ts, `kurve`). */
    const kam = p.kamera;
    const sT = lauf.szeneT;
    const feld = (f: (s: Stellung) => number) =>
      kurve(kam.length, (i) => kam[i][0], (i) => f(kam[i][1]), sT);
    for (let j = 0; j < 3; j++) {
      tmp.pos[j] = feld((s) => s.pos[j]);
      tmp.blick[j] = feld((s) => s.blick[j]);
    }
    const fov = feld((s) => s.fov);
    let versatz = feld((s) => s.versatz);

    ziel.set(tmp.blick[0], tmp.blick[1], tmp.blick[2]);
    cam.position.set(tmp.pos[0], tmp.pos[1], tmp.pos[2]);

    /* Hochformat: Text liegt unten, die Anlage gehört in die obere
       Bildhälfte und braucht mehr Abstand, weil das Bild schmal ist.
       Wie hoch und wie klein, sagt die Stellung (zeitachse.ts). */
    const aspekt = size.width / size.height;
    let hoch = 0;
    if (aspekt < 1) {
      const weite = feld((s) => s.weite);
      const dreh = feld((s) => s.dreh);
      weg.subVectors(cam.position, ziel);
      if (dreh) weg.applyAxisAngle(hochAchse, (dreh * Math.PI) / 180);
      weg.multiplyScalar((1 + (1 / aspekt - 1) * 0.55) * weite);
      cam.position.copy(ziel).add(weg);
      /* Bei Untersichten zeigt `weg` nach unten — zurückziehen darf die
         Kamera nicht unter den Boden schieben. */
      cam.position.y = Math.max(cam.position.y, 1.8);
      versatz = 0;
      hoch = feld((s) => s.hoch);
    }
    let fovJetzt = fov;
    const f = (jetzt - fahrt.start) / WECHSEL_S;
    if (f < 1) {
      const g = glatt(klemm(f));
      cam.position.lerpVectors(von.pos, cam.position, g);
      ziel.lerpVectors(von.ziel, ziel, g);
      fovJetzt = mix(von.fov, fov, g);
      versatz = mix(von.versatz, versatz, g);
      hoch = mix(von.hoch, hoch, g);
    }
    zuletzt.pos.copy(cam.position);
    zuletzt.ziel.copy(ziel);
    zuletzt.fov = fovJetzt;
    zuletzt.versatz = versatz;
    zuletzt.hoch = hoch;

    cam.fov = fovJetzt;
    cam.lookAt(ziel);

    const w = size.width;
    const h = size.height;
    cam.setViewOffset(w, h, -versatz * w, hoch * h, w, h);
    cam.updateProjectionMatrix();
  });
  return null;
}

/* ------------------------------------------------------------------ */

const himmelVert = /* glsl */ `
  varying vec3 vRichtung;
  void main() {
    vRichtung = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const himmelFrag = /* glsl */ `
  uniform vec3 uOben;
  uniform vec3 uHorizont;
  uniform vec3 uBoden;
  varying vec3 vRichtung;
  void main() {
    float y = vRichtung.y;
    vec3 c = y > 0.0
      ? mix(uHorizont, uOben, pow(clamp(y, 0.0, 1.0), 0.55))
      : mix(uHorizont, uBoden, clamp(-y * 6.0, 0.0, 1.0));
    gl_FragColor = vec4(c, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Grundnebel [nah, fern] in Metern; eine Partitur kann ihn weiter ziehen. */
const NEBEL: [number, number] = [600, 5200];
const nebel = new THREE.Fog("#cccccc", NEBEL[0], NEBEL[1]);
const himmelMat = new THREE.ShaderMaterial({
  vertexShader: himmelVert,
  fragmentShader: himmelFrag,
  side: THREE.BackSide,
  depthWrite: false,
  fog: false,
  uniforms: {
    uOben: { value: new THREE.Color() },
    uHorizont: { value: new THREE.Color() },
    uBoden: { value: new THREE.Color() },
  },
});

function Himmel() {
  const mat = himmelMat;
  const kugel = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    const h = himmelUm(lauf.uhr);
    mat.uniforms.uOben.value.set(h.oben);
    mat.uniforms.uHorizont.value.set(h.horizont);
    mat.uniforms.uBoden.value.set(h.boden);
    nebel.color.set(h.horizont);
    const [nah, fern] = lauf.partitur?.nebel ?? NEBEL;
    nebel.near = nah;
    nebel.far = fern;
    kugel.current?.position.copy(camera.position);
  });

  return (
    <>
      <primitive object={nebel} attach="fog" />
      <mesh ref={kugel} material={mat} renderOrder={-1} frustumCulled={false}>
        <sphereGeometry args={[9000, 32, 16]} />
      </mesh>
    </>
  );
}

/* ------------------------------------------------------------------ */

const sonnenPos = [0, 0, 0];
/**
 * Die Schattenkamera folgt dem Blickpunkt der Kamera (am Boden), statt
 * fest um die eine Anlage zu stehen. So werfen auch die Kraftwerke
 * zwei Kilometer weiter echte Schatten — Kontaktschatten sind das
 * Wichtigste, damit prozedurale Körper auf dem Boden „stehen".
 *
 * Gegen Flimmern beim Fahren: Der Mittelpunkt wird im Raum des Lichts
 * auf ganze Texel gerastert (nicht in Welt-x/z — das Licht fällt schräg,
 * dort passt das Raster nicht). So tastet die Schattenkarte die Welt
 * bei jeder Verschiebung an denselben Stellen ab, und Kanten bleiben
 * ruhig. 4096er-Karte auf ±140 m: knapp 7 cm je Texel.
 */
const SCHATTEN_W = 140;
const SCHATTEN_KARTE = 4096;
const TEXEL = (SCHATTEN_W * 2) / SCHATTEN_KARTE;
const schattenZiel = new THREE.Object3D();
export const schattenMitte = new THREE.Vector3();
const zumLicht = new THREE.Vector3();
const lichtRechts = new THREE.Vector3();
const lichtHoch = new THREE.Vector3();
const OBEN = new THREE.Vector3(0, 1, 0);

function Licht() {
  const sonne = useRef<THREE.DirectionalLight>(null);
  const umgebung = useRef<THREE.HemisphereLight>(null);

  useFrame(() => {
    const h = himmelUm(lauf.uhr);
    const s = sonne.current!;
    sonnenRichtung(lauf.sonnenUhr, sonnenPos);
    /* Achsen der Schattenkamera, wie three sie per lookAt bildet */
    zumLicht.set(sonnenPos[0], sonnenPos[1], sonnenPos[2]).normalize();
    lichtRechts.crossVectors(OBEN, zumLicht).normalize();
    lichtHoch.crossVectors(zumLicht, lichtRechts);
    const z = zuletzt.ziel;
    const a = Math.round(z.dot(lichtRechts) / TEXEL) * TEXEL;
    const b = Math.round(z.dot(lichtHoch) / TEXEL) * TEXEL;
    const c = z.dot(zumLicht);
    schattenMitte
      .copy(lichtRechts)
      .multiplyScalar(a)
      .addScaledVector(lichtHoch, b)
      .addScaledVector(zumLicht, c);
    schattenZiel.position.copy(schattenMitte);
    schattenZiel.updateMatrixWorld();
    s.target = schattenZiel;
    s.position.set(
      schattenMitte.x + sonnenPos[0],
      schattenMitte.y + sonnenPos[1],
      schattenMitte.z + sonnenPos[2],
    );
    s.color.set(h.sonne);
    s.intensity = h.sonnenKraft;
    const u = umgebung.current!;
    u.color.set(h.oben);
    u.groundColor.set(h.boden);
    u.intensity = h.umgebung * 1.6;
  });

  return (
    <>
      <primitive object={schattenZiel} />
      <hemisphereLight ref={umgebung} />
      <directionalLight
        ref={sonne}
        castShadow
        shadow-mapSize={[SCHATTEN_KARTE, SCHATTEN_KARTE]}
        shadow-camera-left={-SCHATTEN_W}
        shadow-camera-right={SCHATTEN_W}
        shadow-camera-top={SCHATTEN_W}
        shadow-camera-bottom={-SCHATTEN_W}
        shadow-camera-near={1}
        shadow-camera-far={600}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */

/**
 * Boden als Maßraster: alle 20 m eine feine, alle 100 m eine kräftigere
 * Linie. Das Raster gibt der Kamerafahrt Halt — ohne Bezugsfläche
 * wirkt jede Bewegung um eine einzelne Anlage wie Schweben.
 */
const bodenVert = /* glsl */ `
  varying vec3 vWelt;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWelt = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const bodenFrag = /* glsl */ `
  uniform vec3 uBoden;
  uniform vec3 uLinie;
  uniform vec3 uNebel;
  uniform vec3 uKamera;
  uniform float uRaster;
  uniform vec2 uNebel2;
  varying vec3 vWelt;

  float raster(vec2 p, float teilung, float breite) {
    vec2 q = p / teilung;
    vec2 w = fwidth(q);
    vec2 g = abs(fract(q - 0.5) - 0.5) / w;
    float linie = 1.0 - min(min(g.x, g.y) / breite, 1.0);
    /* Wird eine Rasterzelle kleiner als ein paar Pixel, laufen die
       Linien ineinander und flimmern bei jeder Kamerabewegung (Moiré).
       Dort blendet das Raster aus, nach der Bildschirmdichte statt nach
       der Entfernung. */
    float dichte = max(w.x, w.y);
    return linie * (1.0 - smoothstep(0.08, 0.3, dichte));
  }

  void main() {
    float d = distance(vWelt.xz, uKamera.xz);
    float fein = raster(vWelt.xz, 20.0, 1.0) * (1.0 - smoothstep(150.0, 700.0, d));
    float grob = raster(vWelt.xz, 100.0, 1.2) * (1.0 - smoothstep(600.0, 3200.0, d));
    vec3 c = mix(uBoden, uLinie, max(fein * 0.35, grob * 0.6) * uRaster);
    float nebel = smoothstep(uNebel2.x, uNebel2.y, d);
    c = mix(c, uNebel, nebel);
    gl_FragColor = vec4(c, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const bodenTon = new THREE.Color();

const bodenMat = new THREE.ShaderMaterial({
  vertexShader: bodenVert,
  fragmentShader: bodenFrag,
  uniforms: {
    uBoden: { value: new THREE.Color() },
    uLinie: { value: new THREE.Color() },
    uNebel: { value: new THREE.Color() },
    uKamera: { value: new THREE.Vector3() },
    uRaster: { value: 1 },
    uNebel2: { value: new THREE.Vector2(500, 5200) },
  },
});
const schatten = new THREE.ShadowMaterial({ opacity: 0.18, transparent: true });

function Boden() {
  const mat = bodenMat;
  const schattenFlaeche = useRef<THREE.Mesh>(null);

  useFrame(({ camera }) => {
    const h = himmelUm(lauf.uhr);
    mat.uniforms.uBoden.value.set(h.horizont).lerp(bodenTon.set(h.boden), 0.35);
    const nacht = istNacht(lauf.uhr);
    mat.uniforms.uLinie.value.set(nacht ? "#3A5674" : "#5E6A70");
    mat.uniforms.uNebel.value.set(h.horizont);
    mat.uniforms.uKamera.value.copy(camera.position);
    mat.uniforms.uRaster.value = lauf.szene.raster;
    const [nah, fern] = lauf.partitur?.nebel ?? NEBEL;
    mat.uniforms.uNebel2.value.set(nah - 100, fern);
    /* Linienzeichnung und „nur Fundament" werfen keinen Turmschatten. */
    const koerper = (1 - klemm(lauf.szene.linien)) * klemm(lauf.szene.anlage);
    schatten.opacity = klemm(h.sonnenKraft / 2.4) * 0.34 * koerper;
    /* Die Fläche liegt in der gedrehten Gruppe: lokal y = −Welt-z. */
    schattenFlaeche.current?.position.set(schattenMitte.x, -schattenMitte.z, 0.05);
  });

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh material={mat}>
        <planeGeometry args={[30000, 30000]} />
      </mesh>
      <mesh ref={schattenFlaeche} material={schatten} position={[0, 0, 0.05]} receiveShadow>
        <planeGeometry args={[600, 600]} />
      </mesh>
    </group>
  );
}
