"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";
import { SCHRITT_TAKTE, index, tAus, uebergaben } from "./takte";
import css from "./seite.module.css";

/**
 * Zusatz der Ankauf-Seite: die Lasten des Betreibers als Etiketten am
 * Turm.
 *
 * Jedes Etikett hängt an einem Punkt auf der Turmachse und zeigt mit
 * einer kurzen Linie nach links auf die Seite „Sie" (grau). In seinem
 * Übergabeschritt (Vertrag, Übernahme) wandert es auf die rechte Seite,
 * wird signalrot und heißt „Wir". Zur Abgabe lösen sich alle von der
 * Anlage — im letzten Bild hängt nichts mehr an ihr.
 *
 * Text und Bezeichnungen stehen zusätzlich im SSR-HTML der Seite (Takte
 * der Schritte); diese Etiketten sind nur Bild (aria-hidden).
 */

/* Höhen auf dem Turm (m, 60-m-Klasse): oberhalb des Fußes, unterhalb
   der Gondel. Gleichmäßig verteilt, damit die Etiketten sich nicht
   berühren, auch wenn die Kamera etwas von oben schaut. */
const HOEHEN = [50, 41, 32, 23, 14];

/* Ein Gerüst, das mit dem Maßstab der Anlage wächst (Seitenwechsel von
   der Startseite kann bei der 120-m-Klasse beginnen). Modulebene, weil
   useFrame es in jedem Bild verändert. */
const geruest = new THREE.Group();

/* Zeitpunkte je Etikett, einmal ausgerechnet. Innerhalb eines Schritts
   kommen die Etiketten kurz nacheinander, damit man jedes einzelne
   wechseln sieht. */
const plan = uebergaben.map((u, j) => {
  const vorher = uebergaben
    .slice(0, j)
    .filter((v) => v.beiSchritt === u.beiSchritt).length;
  const [a] = SCHRITT_TAKTE[u.beiSchritt];
  return {
    last: u.last,
    hoehe: HOEHEN[j % HOEHEN.length],
    ueber: tAus("schritte", a + 0.025 + vorher * 0.022),
  };
});

/* Ein: über die Einfahrt in die Bühne der Schritte. Aus: über die
   Einfahrt in die Abgabe. Im Hochformat steigt der Text der Übernahme
   beim Verlassen genau durch die Zone der Anlage — dort sind die
   Schilder fort, bevor er sie erreicht (nach etwa einem Fünftel der
   Fensterhöhe). */
const EIN = [tAus("ankauf", 1), index("schritte") + 0.02] as const;
const AUS = [tAus("schritte", 1), index("abgabe") + 0.04] as const;
const AUS_MOBIL = [tAus("schritte", 1) - 0.012, tAus("schritte", 1) + 0.03] as const;
const UEBER_DAUER = 0.035;

/* Platz, den die Schilder rechts frei lassen (px vom rechten Rand): Auf
   Desktop steht dort die Kapitelschiene (Kapitelname + Nummern, rund
   190 px breit, dazu der Seitenrand) — ein „Wir"-Schild darf nicht
   darunter laufen. Mobil gibt es keine Schiene, nur den Rand von 16 px. */
const FREI_SCHIENE = 268;
const FREI_MOBIL = 16;

/* Wiederverwendeter Punkt für die Projektion der Turmachse ins Bild
   (Modulebene, weil useFrame ihn in jedem Bild verändert). */
const achse = new THREE.Vector3();

/* Weich zwischen 0 und 1. */
const weich = (x: number) => x * x * (3 - 2 * x);

export default function Lasten() {
  const etiketten = useRef<(HTMLDivElement | null)[]>([]);
  /* Breite der Schilder in px, einmal je Fenstergröße gemessen: Die
     Schleife schreibt sonst nur Variablen, ein Lesen des Layouts in
     jedem Bild würde es jedes Mal neu erzwingen. */
  const breiten = useRef<{ fuer: string; px: number[] }>({ fuer: "", px: [] });

  useFrame(({ size, camera }) => {
    const T = lauf.T;
    const massstab = lauf.szene.massstab;
    geruest.scale.setScalar(massstab);
    const mobil = size.width < 768;
    /* Abstand der Etiketten vom Turm in px. Rechts dreht der Rotor fast
       von der Seite gesehen als schmales Band neben dem Turm — die Schilder
       stehen weit genug weg, dass kein Blatt durch sie läuft. Im
       Hochformat knapper. */
    const abstand = mobil ? 30 : 66;
    /* Auf der „Wir"-Seite ist der Platz begrenzt: bis zur Kapitelschiene
       (Desktop) bzw. zum Rand (mobil). Wird es eng, rückt das Schild
       näher an den Turm — lieber streift ein Blatt hinter dem Schild
       vorbei, als dass das Schild die Schiene oder den Rand überdeckt. */
    const grenze = size.width - (mobil ? FREI_MOBIL : FREI_SCHIENE);
    const schluessel = `${size.width}x${size.height}`;
    if (breiten.current.fuer !== schluessel) {
      const px = plan.map(
        (_, j) =>
          (etiketten.current[j]?.lastElementChild as HTMLElement | null)
            ?.offsetWidth ?? 0,
      );
      /* Erst gültig, wenn alle Schilder eingehängt und messbar sind (Html
         hängt sie nicht alle im selben Bild ein). */
      if (px.every((b) => b > 0)) breiten.current = { fuer: schluessel, px };
    }
    const ein = weich(klemm((T - EIN[0]) / (EIN[1] - EIN[0])));
    const [a0, a1] = mobil ? AUS_MOBIL : AUS;
    const aus = weich(klemm((T - a0) / (a1 - a0)));
    for (let j = 0; j < plan.length; j++) {
      const el = etiketten.current[j];
      if (!el) continue;
      const u = lauf.ruhig
        ? T >= plan[j].ueber
          ? 1
          : 0
        : weich(klemm((T - plan[j].ueber) / UEBER_DAUER));
      /* Wo steht der Turm an dieser Höhe im Bild? (Dieselbe Projektion,
         mit der Html das Etikett setzt, inklusive des seitlichen
         Versatzes der Kamera.) */
      let rechts = abstand;
      let frei = 1;
      const breite = breiten.current.px[j];
      if (u > 0 && breite) {
        achse.set(0, plan[j].hoehe * massstab, 0).project(camera);
        const turmX = (achse.x * 0.5 + 0.5) * size.width;
        const min = mobil ? 10 : 20;
        const platz = grenze - turmX - breite;
        rechts = Math.min(abstand, Math.max(min, platz));
        /* Reicht selbst der kleinste Abstand nicht (die Kamera fährt zur
           Abgabe, der Turm wandert nach rechts), blendet das Schild aus,
           statt unter die Schiene zu laufen. */
        if (platz < min) frei = 1 - u * klemm((min - platz) / 32);
      }
      const da = ein * (1 - aus) * frei * lauf.wechsel;
      el.style.opacity = da.toFixed(3);
      el.style.visibility = da < 0.01 ? "hidden" : "visible";
      el.style.setProperty("--u", u.toFixed(3));
      /* Ort des Etiketts: von −abstand (Sie, links) nach +rechts (Wir,
         rechts); beim Abschied steigt es zusätzlich nach oben weg. */
      const x = -abstand + u * (abstand + rechts);
      el.style.setProperty("--x", `${x.toFixed(1)}px`);
      el.style.setProperty("--y", `${(-aus * 40).toFixed(1)}px`);
    }
  });

  return (
    <primitive object={geruest}>
      {plan.map((p, j) => (
        <Html
          key={p.last}
          position={[0, p.hoehe, 0]}
          zIndexRange={[3, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={(el) => {
              etiketten.current[j] = el;
            }}
            className={css.etikett}
            aria-hidden="true"
          >
            <span className={css.linie} />
            <span className={css.punkt} />
            <span className={css.schild}>
              <span className={css.wer}>
                <span className={css.sie}>You</span>
                <span className={css.wir}>Us</span>
              </span>
              <span className={css.last}>{p.last}</span>
            </span>
          </div>
        </Html>
      ))}
    </primitive>
  );
}
