import {
  zeitraster,
  type Kapiteldef,
  type Punkt,
} from "@/components/erlebnis/partitur";
import { klemm, zahl } from "@/components/erlebnis/zeitachse";

/**
 * Zeitraster der Seite „Partner & Investoren" — „Die Laufzeit".
 *
 * Eigene Datei, weil Partitur (Server + Client) und Zeitband (Zusatz im
 * Canvas) dieselben Zeitpunkte brauchen; in partitur.ts stünden sie im
 * Kreis (Partitur → Zeitband → Partitur).
 *
 * Bühnen zusammen 1,8 + 3,6 + 2,2 = 7,6 Fensterhöhen (L2 ≤ 8).
 */

export const kapitel: Kapiteldef[] = [
  /* Auftakt: H1, Lead und die vier Kennzahlen — ein Takt. */
  { id: "auftakt", titel: "Operating year 0", hoehe: 1.8, marke: "Operating year 0" },
  /* Betriebsmodell: Einleitung + drei Stationen der Laufzeit = 4 Takte,
     1 + 0,6 × 4 = 3,4, etwas mehr für den Repowering-Moment. */
  {
    id: "modell",
    titel: "The operating model",
    hoehe: 3.6,
    marke: "Operating year 0 → 30",
  },
  /* Datenraum: Einleitung, dann die sechs versiegelten Mappen. */
  { id: "datenraum", titel: "Data room", hoehe: 2.2, marke: "Under NDA" },
  { id: "daten", titel: "Data sheet" },
  { id: "abspann", titel: "Contact" },
];

export const raster = zeitraster(kapitel);
const { tAus, index } = raster;

/**
 * Takte der Bühne „modell" (0–1 der festen Strecke). Jede Station der
 * Laufzeit ist ein Takt: Einleitung, Jahr 20 (Bestand halten), Jahr 20–30
 * (Technik, zwei Ertragsquellen), Repowering.
 */
export const MODELL_TAKTE = {
  einleitung: [0, 0.2],
  bestand: [0.22, 0.44],
  betrieb: [0.46, 0.72],
  /* Endet knapp vor der Ausfahrt: Im Hochformat stünde der Block sonst
     beim Hinausschieben mitten auf Turm und Rotor, während die Kamera
     zum Datenraum schwenkt. */
  repowering: [0.74, 0.96],
} as const;

/* Wo das Jahr steht (q der Bühne „modell"). Die Balken im Text
   (data-strecke) laufen über genau dieselben Strecken. Die ersten 20
   Jahre zählen im Takt „Bestand halten", nicht schon unter der
   Einleitung. */
export const JAHR_20 = [0.22, 0.4] as const;
export const JAHR_30 = [0.48, 0.68] as const;

/** Repowering beginnt: Das HUD springt auf „Betriebsjahr 0 · Repowering". */
export const REPOWERING = tAus("modell", 0.74);

/**
 * Betriebsjahr der Beispielanlage über T: 0 im Auftakt, 20 am Ende der
 * EEG-Vergütung, 30 nach dem Weiterbetrieb. Mit dem Repowering läuft der
 * Wert zurück auf 0 — das Zeitband am Boden leert sich, eine neue Laufzeit
 * beginnt am selben Standort.
 */
const jahrSpur: Punkt<number>[] = [
  [tAus("modell", JAHR_20[0]), 0],
  [tAus("modell", JAHR_20[1]), 20],
  [tAus("modell", JAHR_30[0]), 20],
  [tAus("modell", JAHR_30[1]), 30],
  [tAus("modell", 0.76), 30],
  [tAus("modell", 0.9), 0],
];

export const jahrBei = (T: number) => klemm(zahl(jahrSpur, T), 0, 30);

/** Ab hier zeigt das HUD den Datenraum statt des Betriebsjahrs. */
export const DATENRAUM = index("datenraum") - 0.25;
