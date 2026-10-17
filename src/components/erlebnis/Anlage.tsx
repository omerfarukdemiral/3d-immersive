"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  DIMENSIONS,
  createBladeGeometry,
  createFoundationGeometry,
  createHubGeometry,
  createNacelleGeometry,
  createSpinnerGeometry,
  createTowerGeometry,
} from "@/components/three/turbineGeometry";
import { lauf } from "./lauf";
import { istNacht, klemm } from "./zeitachse";

/**
 * Die eine Anlage. Was sie tut, sagt der Szenenzustand in `lauf.szene`
 * (aus den Spuren der Partitur, Erlebnis.tsx): Drehzahl, Maßstab, Hülle,
 * Geist, Arretierung, Linienzeichnung und ob sie überhaupt über dem
 * Fundament steht.
 */

const {
  towerHeight,
  towerBaseRadius,
  nacelleLength,
  nacelleHeight,
  hubRadius,
  bladeLength,
} = DIMENSIONS;
const HUB_Y = towerHeight + 0.4;
const HUB_X = nacelleLength * 0.42;
const SIGNAL = new THREE.Color("#E0472A");
const DATEN = new THREE.Color("#A9CCF0");

/**
 * Wo die Leitlinie eines Bauteils ansetzt (lokale Koordinaten). Die
 * Bildschirmlage jedes Ankers steht in jedem Bild in `lauf.anker[id]`;
 * dazu kommen die beiden Anker am drehenden Blatt (`rotorblaetter`,
 * `spitze`). Messpunkte (nachts blau) sitzen nur auf den ersten vier.
 */
const ANKER: Record<string, [number, number, number]> = {
  nabe: [HUB_X + 1.6, HUB_Y, 0],
  getriebe: [0.7, HUB_Y + 0.6, 1.05],
  generator: [-1.9, HUB_Y + 0.5, 0.85],
  turm: [0, 24, 1.9],
};
const ANKER_WEITERE: Record<string, [number, number, number]> = {
  /** Dach der Gondel, Ausstieg nach oben */
  gondel: [-nacelleLength * 0.1, HUB_Y + nacelleHeight / 2 + 0.2, 0],
  /** Turmfuß an der Tür: Aufstieg, Umrichter, Schaltanlage */
  fuss: [0, 2.4, towerBaseRadius + 0.1],
  /** Fundament, Oberkante am Rand */
  fundament: [0, 0.3, 7.5],
};

const ankerObj = Object.fromEntries(
  Object.entries({ ...ANKER, ...ANKER_WEITERE }).map(([id, p]) => {
    const o = new THREE.Object3D();
    o.position.set(...p);
    return [id, o];
  }),
);
const v = new THREE.Vector3();
/** Ein Drittel Umdrehung: Nach so viel Weg steht der Rotor wieder gleich. */
const DRITTEL = (Math.PI * 2) / 3;

/* Einmal pro Seite: Die Szene gibt es nur einmal, also auch ihre Teile. */
const geo = {
  blade: createBladeGeometry(26, 14),
  tower: createTowerGeometry(),
  foundation: createFoundationGeometry(),
  nacelle: createNacelleGeometry(),
  hub: createHubGeometry(),
  spinner: createSpinnerGeometry(),
  getriebe: new THREE.CylinderGeometry(1.05, 1.05, 2.2, 20).rotateZ(
    Math.PI / 2,
  ),
  generator: new THREE.CylinderGeometry(0.85, 0.85, 2.6, 20).rotateZ(
    Math.PI / 2,
  ),
  lampe: new THREE.SphereGeometry(0.32, 12, 8),
  sensor: new THREE.SphereGeometry(0.28, 10, 8),
};

/* Linienzeichnung (Spur `linien`): Kanten jedes Bauteils, ab 20° Knick. */
const kante = (g: THREE.BufferGeometry) => new THREE.EdgesGeometry(g, 20);
const kanten = {
  blade: kante(geo.blade),
  /* Der Turm ist glatt gerundet und hätte keine Kante über 20° — für die
     Zeichnung bekommt er ein eigenes grobes Netz: zwölf Mantellinien und
     die Stöße der Turmsegmente, wie auf einem Bauplan. */
  tower: new THREE.EdgesGeometry(
    new THREE.CylinderGeometry(
      DIMENSIONS.towerTopRadius,
      towerBaseRadius,
      towerHeight,
      12,
      4,
      true,
    ).translate(0, towerHeight / 2, 0),
    1,
  ),
  foundation: kante(geo.foundation),
  nacelle: kante(geo.nacelle),
  hub: kante(geo.hub),
  spinner: kante(geo.spinner),
  getriebe: kante(geo.getriebe),
  generator: kante(geo.generator),
};
const kantenMat = new THREE.LineBasicMaterial({
  color: "#121417",
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

const mat = (() => {
  const huelle = (farbe: string, rauh = 0.6) =>
    new THREE.MeshStandardMaterial({
      color: farbe,
      roughness: rauh,
      metalness: 0.05,
    });
  return {
    turm: huelle("#E6E8E8"),
    beton: new THREE.MeshStandardMaterial({
      color: "#A9ABA8",
      roughness: 0.95,
    }),
    gondel: Object.assign(huelle("#E9EBEB"), { transparent: true }),
    dach: Object.assign(huelle("#C9CFD3", 0.7), { transparent: true }),
    nabe: huelle("#E9EBEB"),
    blatt: huelle("#ECEEEE", 0.55),
    spitze: new THREE.MeshStandardMaterial({
      color: "#D9452B",
      roughness: 0.55,
    }),
    getriebe: new THREE.MeshStandardMaterial({
      color: "#7E8890",
      roughness: 0.45,
      metalness: 0.6,
    }),
    generator: new THREE.MeshStandardMaterial({
      color: "#6F7880",
      roughness: 0.45,
      metalness: 0.6,
    }),
    lampe: new THREE.MeshBasicMaterial({ color: "#FF2A12", toneMapped: false }),
    sensor: new THREE.MeshBasicMaterial({
      color: DATEN,
      transparent: true,
      toneMapped: false,
    }),
    geist: new THREE.MeshBasicMaterial({
      color: "#203A55",
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  };
})();

const teilMat: Record<string, THREE.MeshStandardMaterial[]> = {
  rotorblaetter: [mat.blatt, mat.spitze],
  nabe: [mat.nabe],
  getriebe: [mat.getriebe],
  generator: [mat.generator],
  turm: [mat.turm],
};

/* Körper, die für Linienzeichnung und „nur Fundament" durchsichtig werden.
   Gondel und Dach sind es ohnehin (Hülle). */
const koerperMat = [
  mat.turm,
  mat.nabe,
  mat.blatt,
  mat.spitze,
  mat.getriebe,
  mat.generator,
];
const durch = { an: false };

export default function Anlage() {
  const anlage = useRef<THREE.Group>(null);
  const rotor = useRef<THREE.Group>(null);
  const geistGruppe = useRef<THREE.Group>(null);
  const geistRotor = useRef<THREE.Group>(null);
  const blattAnker = useRef<THREE.Object3D>(null);
  const lampe = useRef<THREE.Mesh>(null);
  const sensoren = useRef<THREE.Group>(null);
  const oben = useRef<THREE.Group>(null);
  const spitze = useRef<THREE.Object3D>(null);
  const winkel = useRef(0);
  const parkZiel = useRef<number | null>(null);

  useFrame(({ camera, clock, size }, dt) => {
    const T = lauf.szeneT;
    const z = lauf.szene;
    const upm = z.drehzahl * (lauf.ruhig ? 0.35 : 1);
    lauf.upm = upm;
    winkel.current += (upm / 60) * Math.PI * 2 * Math.min(dt, 0.1);

    /* Arretieren: Beim ersten Bild der Parkphase wird die nächste
       Y-Stellung vor dem Rotor gewählt (mindestens ein halbes Drittel
       voraus, damit er nie zurückdreht), dann blendet der Scroll den
       Winkel dorthin. Steht er ganz, läuft der freie Winkel ab dort weiter. */
    const pk = z.parken;
    let stellung = winkel.current;
    if (pk <= 0) {
      parkZiel.current = null;
    } else {
      parkZiel.current ??= Math.ceil(winkel.current / DRITTEL + 0.5) * DRITTEL;
      /* Wer langsam scrollt, ließe den noch drehenden Rotor an seinem
         Ziel vorbeilaufen — die Mischung zöge ihn dann rückwärts zurück.
         Darum bremst er am Ziel: weiter als bis dorthin dreht er nicht. */
      winkel.current = Math.min(winkel.current, parkZiel.current);
      if (pk >= 1) winkel.current = parkZiel.current;
      stellung = winkel.current + (parkZiel.current - winkel.current) * pk;
    }
    rotor.current!.rotation.x = stellung;
    geistRotor.current!.rotation.x = stellung * 0.6;

    anlage.current!.scale.setScalar(z.massstab);

    /* Linienzeichnung und „nur Fundament": Körper werden durchsichtig,
       die Kanten treten an ihre Stelle. Ein Rest Körper bleibt, damit die
       Zeichnung nicht ins Leere gestellt wirkt. */
    const steht = klemm(z.anlage);
    const koerper = 1 - klemm(z.linien) * 0.94;
    const brauchtDurch = koerper < 0.999 || steht < 0.999;
    if (brauchtDurch !== durch.an) {
      durch.an = brauchtDurch;
      for (const m of [...koerperMat, mat.beton]) {
        m.transparent = brauchtDurch;
        m.needsUpdate = true;
      }
    }
    for (const m of koerperMat) m.opacity = koerper * steht;
    mat.beton.opacity = koerper;
    oben.current!.visible = steht > 0.01;
    kantenMat.opacity = klemm(z.linien) * 0.9;
    kantenMat.color.set(istNacht(lauf.uhr) ? "#EEEDE8" : "#121417");

    /* Gondelhülle öffnen, damit der Triebstrang sichtbar wird */
    const h = z.huelle * koerper * steht;
    mat.gondel.opacity = h;
    mat.gondel.depthWrite = h > 0.95;
    mat.dach.opacity = h;

    /* Bauteil im Fokus glimmt in Signalfarbe */
    const fokus = lauf.partitur?.fokus ?? [];
    for (const id in teilMat) {
      const f = fokus.find((x) => x.id === id);
      const w = 0.015;
      const g = f ? klemm((T - f.von) / w) * klemm((f.bis - T) / w) : 0;
      for (const m of teilMat[id]) {
        if (m === mat.spitze) continue;
        m.emissive.copy(SIGNAL);
        m.emissiveIntensity = g * 0.55;
      }
    }

    /* Geist der größeren Anlage */
    const gv = z.geist;
    mat.geist.opacity = gv * 0.2;
    geistGruppe.current!.visible = gv > 0.01;

    /* Nachts: Befeuerung und Messpunkte. Auf L0-Seiten bewegt sich
       nichts von selbst — das Feuer brennt dort ruhig. */
    const nacht = istNacht(lauf.uhr);
    const t = clock.elapsedTime;
    const ruhigesFeuer = lauf.partitur?.bewegung === "L0";
    lampe.current!.visible = nacht && (ruhigesFeuer || t % 1.5 < 1);
    sensoren.current!.visible = nacht;
    if (nacht)
      mat.sensor.opacity = ruhigesFeuer ? 0.7 : 0.55 + Math.sin(t * 3) * 0.35;

    /* Bildschirmposition der Bauteile für die Leitlinien */
    const proj = (id: string, o: THREE.Object3D) => {
      o.getWorldPosition(v);
      v.project(camera);
      const a = (lauf.anker[id] ??= { x: 0, y: 0, da: false });
      a.x = ((v.x + 1) / 2) * size.width;
      a.y = ((1 - v.y) / 2) * size.height;
      a.da = v.z < 1;
    };
    proj("rotorblaetter", blattAnker.current!);
    proj("spitze", spitze.current!);
    for (const id in ankerObj) proj(id, ankerObj[id]);
  });

  return (
    <>
      <group ref={anlage}>
        <mesh geometry={geo.foundation} material={mat.beton} receiveShadow />
        <lineSegments geometry={kanten.foundation} material={kantenMat} />
        <group ref={oben}>
          <TurbinenKoerper
            geo={geo}
            rotorRef={rotor}
            blattAnker={blattAnker}
            spitze={spitze}
            kanten={kanten}
            fundament={false}
            mat={{
              turm: mat.turm,
              beton: mat.beton,
              gondel: mat.gondel,
              dach: mat.dach,
              nabe: mat.nabe,
              blatt: [mat.blatt, mat.spitze],
            }}
            schatten
          />
          <mesh
            geometry={geo.getriebe}
            material={mat.getriebe}
            position={[0.7, HUB_Y, 0]}
          />
          <lineSegments
            geometry={kanten.getriebe}
            material={kantenMat}
            position={[0.7, HUB_Y, 0]}
          />
          <mesh
            geometry={geo.generator}
            material={mat.generator}
            position={[-1.9, HUB_Y, 0]}
          />
          <lineSegments
            geometry={kanten.generator}
            material={kantenMat}
            position={[-1.9, HUB_Y, 0]}
          />
          <mesh
            ref={lampe}
            geometry={geo.lampe}
            material={mat.lampe}
            position={[-nacelleLength * 0.32, HUB_Y + 2.1, 0]}
          />
          <group ref={sensoren}>
            {Object.values(ANKER).map((p, i) => (
              <mesh
                key={i}
                geometry={geo.sensor}
                material={mat.sensor}
                position={p}
              />
            ))}
          </group>
        </group>
        {Object.values(ankerObj).map((o, i) => (
          <primitive key={i} object={o} />
        ))}
      </group>

      <group ref={geistGruppe} scale={2} visible={false}>
        <TurbinenKoerper
          geo={geo}
          rotorRef={geistRotor}
          mat={{
            turm: mat.geist,
            beton: mat.geist,
            gondel: mat.geist,
            dach: mat.geist,
            nabe: mat.geist,
            blatt: mat.geist,
          }}
        />
      </group>
    </>
  );
}

type Geo = {
  blade: THREE.BufferGeometry;
  tower: THREE.BufferGeometry;
  foundation: THREE.BufferGeometry;
  nacelle: THREE.BufferGeometry;
  hub: THREE.BufferGeometry;
  spinner: THREE.BufferGeometry;
};

function TurbinenKoerper({
  geo,
  mat,
  rotorRef,
  blattAnker,
  spitze,
  kanten,
  fundament = true,
  schatten = false,
}: {
  geo: Geo;
  mat: {
    turm: THREE.Material;
    beton: THREE.Material;
    gondel: THREE.Material;
    dach: THREE.Material;
    nabe: THREE.Material;
    blatt: THREE.Material | THREE.Material[];
  };
  rotorRef: React.RefObject<THREE.Group | null>;
  blattAnker?: React.RefObject<THREE.Object3D | null>;
  spitze?: React.RefObject<THREE.Object3D | null>;
  /** Kantengeometrien für die Linienzeichnung (nur die echte Anlage). */
  kanten?: Record<
    "blade" | "tower" | "nacelle" | "hub" | "spinner",
    THREE.BufferGeometry
  >;
  fundament?: boolean;
  schatten?: boolean;
}) {
  return (
    <>
      {fundament ? (
        <mesh
          geometry={geo.foundation}
          material={mat.beton}
          receiveShadow={schatten}
        />
      ) : null}
      <mesh
        geometry={geo.tower}
        material={mat.turm}
        castShadow={schatten}
        receiveShadow={schatten}
      />
      {kanten ? (
        <lineSegments geometry={kanten.tower} material={kantenMat} />
      ) : null}
      <group position={[0, HUB_Y, 0]}>
        <mesh
          geometry={geo.nacelle}
          material={mat.gondel}
          castShadow={schatten}
        />
        {kanten ? (
          <lineSegments geometry={kanten.nacelle} material={kantenMat} />
        ) : null}
        <mesh position={[-nacelleLength * 0.3, 1.7, 0]} material={mat.dach}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </mesh>
      </group>
      <group ref={rotorRef} position={[HUB_X, HUB_Y, 0]}>
        <mesh geometry={geo.hub} material={mat.nabe} castShadow={schatten} />
        <mesh
          geometry={geo.spinner}
          material={mat.nabe}
          position={[hubRadius * 0.85, 0, 0]}
          castShadow={schatten}
        />
        {kanten ? (
          <>
            <lineSegments geometry={kanten.hub} material={kantenMat} />
            <lineSegments
              geometry={kanten.spinner}
              material={kantenMat}
              position={[hubRadius * 0.85, 0, 0]}
            />
          </>
        ) : null}
        {[0, 1, 2].map((i) => (
          <group key={i} rotation={[(i * Math.PI * 2) / 3, 0, 0]}>
            <mesh
              geometry={geo.blade}
              material={mat.blatt}
              position={[0, hubRadius * 0.55, 0]}
              castShadow={schatten}
            />
            {kanten ? (
              <lineSegments
                geometry={kanten.blade}
                material={kantenMat}
                position={[0, hubRadius * 0.55, 0]}
              />
            ) : null}
            {i === 0 && blattAnker ? (
              <object3D ref={blattAnker} position={[0.4, 17, 0]} />
            ) : null}
            {i === 0 && spitze ? (
              <object3D
                ref={spitze}
                position={[0, hubRadius * 0.55 + bladeLength, 0]}
              />
            ) : null}
          </group>
        ))}
      </group>
    </>
  );
}
