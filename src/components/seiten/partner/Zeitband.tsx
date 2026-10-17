"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";
import { jahrBei, raster } from "./zeit";
import css from "./seite.module.css";

/**
 * Zusatz der Partner-Seite: das Zeitband am Boden.
 *
 * Die Messgröße der Seite ist das Betriebsjahr (HUD „Betriebsjahr
 * 0 → 30"). Damit die Laufzeit nicht nur als Zahl unten links steht,
 * liegt neben der Anlage ein Band auf dem Boden: 30 Jahre, ein Teilstrich
 * alle fünf, längere bei 0, 20 (Ende der EEG-Vergütung) und 30. Es füllt
 * sich rot mit dem Jahr und leert sich beim Repowering wieder — eine neue
 * Laufzeit am selben Standort.
 *
 * Die Jahreszahlen am Band sind nur Bild (aria-hidden); im SSR-HTML
 * stehen dieselben Marken an den Balken im Text.
 *
 * three-Objekte auf Modulebene: useFrame verändert sie in jedem Bild
 * (Lint-Regel react-hooks/immutability, docs/04-sayfa-api.md 8).
 */

/** Meter je Betriebsjahr: 30 Jahre = 75 m Band. */
const M_JE_JAHR = 2.5;
const JAHRE = 30;
const LAENGE = JAHRE * M_JE_JAHR;
const BREITE = 0.9;
/** Abstand vom Turm, damit das Fundament das Band nicht verdeckt. */
const ABSTAND = 12;
/**
 * Richtung des Bands in Grad, von +x (Osten) nach +z (Süden). 125° =
 * nach Südwesten: Von der Kamera im Süden aus läuft das Band vom Turmfuß
 * schräg nach vorn links, unter den Text — es bleibt ganz im Bild und
 * kreuzt die Anlage nicht.
 */
const RICHTUNG = 125;
const HOEHE = 0.06;

const band = new THREE.Group();
const phi = (RICHTUNG * Math.PI) / 180;
band.position.set(Math.cos(phi) * ABSTAND, HOEHE, Math.sin(phi) * ABSTAND);
band.rotation.y = -phi;

/* Flach liegende Rechtecke: Ebene in XZ, Länge entlang +x. */
const flach = (laenge: number, breite: number, abX: number) => {
  const g = new THREE.PlaneGeometry(laenge, breite);
  g.rotateX(-Math.PI / 2);
  g.translate(abX, 0, 0);
  return g;
};

const grundMat = new THREE.MeshBasicMaterial({
  color: "#121417",
  transparent: true,
  opacity: 0,
  depthWrite: false,
});
const fuellMat = new THREE.MeshBasicMaterial({
  color: "#E0472A",
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

const grund = new THREE.Mesh(flach(LAENGE, BREITE, LAENGE / 2), grundMat);
/* Füllung von 0 bis 1 entlang x, skaliert auf das aktuelle Jahr. */
const fuellung = new THREE.Mesh(flach(1, BREITE * 1.4, 0.5), fuellMat);
fuellung.position.y = 0.02;
band.add(grund, fuellung);

/** Jahre mit langer Marke. */
const MARKEN = [0, 20, 30];
for (let j = 0; j <= JAHRE; j += 5) {
  const lang = MARKEN.includes(j);
  const strich = new THREE.Mesh(
    flach(lang ? 0.36 : 0.22, lang ? 7 : 3, 0),
    grundMat,
  );
  strich.position.x = j * M_JE_JAHR;
  band.add(strich);
}

/* Ein: in der Fahrt vom Auftakt zur Laufzeit. Aus: sobald es sich beim
   Repowering geleert hat — die Kamera zieht sich dann für die größere
   Anlage zurück, und das Band rückte sonst an den unteren Rand unter
   das HUD. */
const EIN = [raster.tAus("auftakt", 0.6), raster.index("modell") + 0.04] as const;
const AUS = [raster.tAus("modell", 0.84), raster.tAus("modell", 0.93)] as const;
/* Die Jahreszahlen gehen schon mit dem Beginn des Repowerings: Beim
   Rückzug der Kamera rücken sie zusammen („Jahr 30Jahr 20") und liefen
   im Hochformat über den linken Rand. Das Band selbst leert sich weiter. */
const MARKEN_AUS = [raster.tAus("modell", 0.72), raster.tAus("modell", 0.76)] as const;

const weich = (x: number) => x * x * (3 - 2 * x);

export default function Zeitband() {
  const marken = useRef<(HTMLDivElement | null)[]>([]);

  useFrame(() => {
    const T = lauf.szeneT;
    const ein = weich(klemm((T - EIN[0]) / (EIN[1] - EIN[0])));
    const aus = weich(klemm((T - AUS[0]) / (AUS[1] - AUS[0])));
    const da = ein * (1 - aus) * lauf.wechsel;
    const jahr = jahrBei(T);
    const markeDa =
      da * (1 - weich(klemm((T - MARKEN_AUS[0]) / (MARKEN_AUS[1] - MARKEN_AUS[0]))));

    band.visible = da > 0.004;
    grundMat.opacity = da * 0.42;
    fuellMat.opacity = da * 0.95;
    fuellung.scale.x = Math.max(0.0001, jahr * M_JE_JAHR);

    for (let i = 0; i < MARKEN.length; i++) {
      const el = marken.current[i];
      if (!el) continue;
      /* Erreichte Marke in Signalfarbe. */
      const erreicht = jahr >= MARKEN[i] - 0.05 && jahr > 0.05;
      el.style.opacity = markeDa.toFixed(3);
      el.style.visibility = markeDa < 0.01 ? "hidden" : "visible";
      el.dataset.erreicht = erreicht ? "1" : "0";
    }
  });

  return (
    <primitive object={band}>
      {MARKEN.map((j, i) => (
        <Html
          key={j}
          position={[j * M_JE_JAHR, 0, -4.6]}
          center
          zIndexRange={[3, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={(el) => {
              marken.current[i] = el;
            }}
            className={css.bandmarke}
            aria-hidden="true"
          >
            Year {j}
          </div>
        </Html>
      ))}
    </primitive>
  );
}
