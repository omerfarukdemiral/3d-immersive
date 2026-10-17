import type { ComponentType } from "react";

/**
 * Vertrag zwischen einer Seite und der gemeinsamen Bühne.
 *
 * Jede Erlebnis-Seite beschreibt in einer eigenen Datei, was die Szene während
 * ihres Scrolls tut: Kapitel, Kamera, Zustand der Anlage, Himmel und die
 * Messgröße im HUD. Die Bühne (Erlebnis.tsx, Szene.tsx) kennt keine
 * einzelne Seite mehr — sie spielt nur, was die aktuelle Partitur sagt.
 * Doku: docs/04-sayfa-api.md.
 *
 * Erzählzeit T: ganzzahliger Teil = Index des Kapitels, Rest = Weg durch
 * das Kapitel (0–1 über seine ganze Höhe). Alle Spuren hängen an T.
 */

/** Stützpunkt einer Spur: [Erzählzeit, Wert]. Zwischen zwei Punkten weich. */
export type Punkt<V> = [number, V];

/** Feste Zahl oder Verlauf über die Erzählzeit. */
export type Spur = number | Punkt<number>[];

/**
 * Bewegungsstufe:
 * L3 volle Choreografie · L2 wenige Stationen · L1 Lesemodus, Szene steht
 * blass in einem Bild · L0 nichts bewegt sich von selbst.
 */
export type Bewegung = "L0" | "L1" | "L2" | "L3";

export type Kapiteldef = {
  /** Anker im HTML (id und data-kapitel des Abschnitts). */
  id: string;
  /** Name in der Kapitelschiene und im HUD. */
  titel: string;
  /**
   * Höhe in Fensterhöhen für feste Bühnen (Kapitel-Baustein). Fließende
   * Abschnitte (Datenblatt, Abspann) lassen sie weg — ihre Höhe ergibt
   * sich aus dem Inhalt, und die Bühne misst sie.
   */
  hoehe?: number;
  /** Uhrzeit in Stunden (über 24 = nächster Tag), für himmel "kapitel". */
  uhr?: number;
  /** Angabe in der Marke des Kapitels („03:10", „Blick 090°"). */
  marke?: string;
  /**
   * Luft nach diesem Kapitel in Fensterhöhen, wenn die Kamerafahrt zum
   * nächsten besonders weit ist (Standard: LUFT).
   */
  luft?: number;
};

/**
 * Kamerastellung. Maßstab 1 = 1 m, Nabe auf ~60 m, Rotor zeigt nach +x.
 *
 * `blick` ist der Zielpunkt, `versatz` schiebt das Bild seitlich (Anteil
 * der Breite), damit die Anlage neben dem Text steht. Positiv = Anlage
 * nach rechts. Hochformat (nur wenn das Fenster höher als breit ist):
 * `hoch` hebt das Bild um diesen Anteil der Höhe, `weite` zieht die
 * Kamera zusätzlich zurück, `dreh` schwenkt sie in Grad um die Turmachse.
 */
export type Stellung = {
  pos: number[];
  blick: number[];
  fov: number;
  versatz: number;
  hoch: number;
  weite: number;
  dreh: number;
};

/** Woher die Uhrzeit (und damit Himmel und Licht) kommt. */
export type Himmelsquelle =
  /** Aus `uhr` der Kapitel: steht im Halt fast, springt im Übergang. */
  | { quelle: "kapitel" }
  /** Eigener Verlauf in Stunden über T (Monitoring 03:10 → 07:00). */
  | { quelle: "spur"; uhr: Spur }
  /** Eine feste Tageszeit. */
  | { quelle: "fest"; uhr: number }
  /** Echte Uhrzeit in Musterstadt (Kontakt, Formulare). */
  | { quelle: "echt" };

/**
 * Zustand der Szene. Jede Spur hat einen Grundwert (siehe `grundzustand`),
 * eine Seite gibt nur an, was sie anders haben will.
 */
export type Szenenzustand = {
  /** Rotordrehzahl in U/min. */
  drehzahl: number;
  /** Größe der Anlage: 1 = 60-m-Klasse, 2 = 120-m-Klasse. */
  massstab: number;
  /** Rotor in Y-Stellung arretiert (0 frei, 1 fest). */
  parken: number;
  /** Deckkraft der Gondelhülle (Anatomie: 0,12 = Triebstrang sichtbar). */
  huelle: number;
  /** Geisterumriss der 120-m-Klasse. */
  geist: number;
  /** Flotte der 140 Anlagen: 0 im Boden, 1 steht. */
  flotte: number;
  /** Wie viele Anlagen der Flotte in Signalfarbe stehen (0–140). */
  markiert: number;
  /** Neun geplante Projekte als roter Umriss. */
  planung: number;
  /** Linienzeichnung: 0 Körper, 1 nur Kanten (Standards). */
  linien: number;
  /** Anlage über dem Fundament: 1 steht, 0 nur Fundament (404, Rückbau). */
  anlage: number;
  /** Deutschlandkarte als Linien am Boden (Referenzen). */
  karte: number;
  /** Maßraster am Boden. */
  raster: number;
  /**
   * Fünf Kraftwerke mit Freileitung (Kraftwerke.tsx): 0 nichts, i → das
   * i-te Kraftwerk hebt sich, zwischen i und i+1 steht es im Fokus.
   */
  kraftwerke: number;
};

export const grundzustand: Szenenzustand = {
  drehzahl: 9,
  massstab: 1,
  parken: 0,
  huelle: 1,
  geist: 0,
  flotte: 0,
  markiert: 0,
  planung: 0,
  linien: 0,
  anlage: 1,
  karte: 0,
  raster: 1,
  kraftwerke: 0,
};

/** Bauteil im Fokus: glimmt in Signalfarbe, Leitlinie zum Element [data-teil=id]. */
export type Fokus = { id: string; von: number; bis: number };

/** Was der HUD-Formatierer zu jedem Bild bekommt. */
export type HudKontext = {
  /** Uhrzeit in Stunden (aus der Himmelsquelle). */
  uhr: number;
  /** Index des aktuellen Kapitels. */
  kapitel: number;
  /** Weg durch das aktuelle Kapitel, 0–1 über seine ganze Höhe. */
  anteil: number;
  /** Aktueller Szenenzustand (geglättet, inkl. Seitenwechsel). */
  szene: Szenenzustand;
};

/**
 * Anzeige im HUD unten links. Beispiel „HÖHE 42 M · Nabenhöhe dieser
 * Anlage": etikett "Höhe", wert "42", einheit "m", notiz "Nabenhöhe
 * dieser Anlage". Leere Teile entfallen.
 */
export type HudWert = {
  wert: string;
  etikett?: string;
  einheit?: string;
  notiz?: string;
};

export type Partitur = {
  /** Eindeutiger Name, z. B. der Pfad. */
  id: string;
  /** Seitenname, wie er im Rundgang steht. */
  name: string;
  bewegung: Bewegung;
  /** Reihenfolge = Reihenfolge der Abschnitte im HTML. */
  kapitel: Kapiteldef[];
  /** Mindestens eine Stellung. Bei L0/L1 gilt nur die erste. */
  kamera: Punkt<Stellung>[];
  himmel: Himmelsquelle;
  spuren?: Partial<Record<keyof Szenenzustand, Spur>>;
  fokus?: Fokus[];
  /** T → Messgröße. Ohne: Uhrzeit und Standort wie auf der Startseite. */
  hud?: (T: number, k: HudKontext) => HudWert;
  /** Nebel [nah, fern] in Metern. Standard [600, 5200]. */
  nebel?: [number, number];
  /**
   * Eigene R3F-Bausteine der Seite, im Canvas gerendert. Datei mit
   * "use client", liest `lauf`, legt three-Objekte auf Modulebene an.
   */
  zusatz?: ComponentType;
};

/* ------------------------------------------------------------------ */
/* Werkzeug für Partitur-Dateien                                       */
/* ------------------------------------------------------------------ */

/**
 * Luft nach jeder festen Bühne, in Fensterhöhen. In dieser Strecke steht
 * kein Text im Bild — nur die Kamera fliegt zum nächsten Kapitel. Ohne
 * sie hatte jede Fahrt zwischen zwei Kapiteln nur eine Fensterhöhe
 * Scroll, und weite Wege (zwei Kilometer vom Umspannwerk zurück zur
 * Anlage) rauschten in einem Mausradschub vorbei.
 */
export const LUFT = 1;

/**
 * Anteil eines Kapitels (über seine ganze Strecke inkl. Luft), in dem
 * seine Bühne feststeht. Danach schiebt sie sich hinaus, die Luft läuft
 * durch, und das nächste Kapitel schiebt sich herein — genau in diesem
 * Rest laufen die Kamerafahrten zwischen zwei Kapiteln.
 */
export function haltAnteil(k: Kapiteldef) {
  if (k.hoehe === undefined) return 0.5;
  const h = Math.max(1.0001, k.hoehe);
  return (h - 1) / (h + (k.luft ?? LUFT));
}

/**
 * Zeitraster einer Kapitelliste. `tAus(id, q)` rechnet einen Ort in der
 * festen Bühne (0–1) in Erzählzeit um — so schreiben Partituren ihre
 * Stützpunkte in den Begriffen der Takte statt in rohem T.
 */
export function zeitraster(kapitel: Kapiteldef[]) {
  const index = (id: string) => {
    const i = kapitel.findIndex((k) => k.id === id);
    if (i < 0) throw new Error(`Kapitel „${id}" fehlt in der Partitur`);
    return i;
  };
  const halt = (i: number) => haltAnteil(kapitel[i]);
  const tAus = (id: string, q: number) => {
    const i = index(id);
    return i + q * halt(i);
  };
  return { index, halt, tAus };
}

/** Kurzform für eine Kamerastellung. */
export function stellung(
  t: number,
  pos: number[],
  blick: number[],
  {
    fov = 36,
    versatz = 0,
    hoch = 0.16,
    weite = 1,
    dreh = 0,
  }: Partial<Omit<Stellung, "pos" | "blick">> = {},
): Punkt<Stellung> {
  return [t, { pos, blick, fov, versatz, hoch, weite, dreh }];
}
