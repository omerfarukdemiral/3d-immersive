import { zeitraster, type Kapiteldef } from "@/components/erlebnis/partitur";
import { leistungBySlug } from "@/content/leistungen";

/**
 * Zeitraster der Ankauf-Seite: Kapitel, Takte der fünf Schritte und
 * Schritt bei T. Eigene Datei, weil Partitur (Server und Client), Text
 * und der Zusatz im Canvas dieselben Zahlen brauchen — und der Zusatz
 * die Partitur nicht importieren darf, ohne einen Kreis zu bilden.
 */

const ankauf = leistungBySlug("acquisition")!;
export const ablauf = ankauf.ablauf!;
export const uebergaben = ankauf.uebergaben!;

export const kapitel: Kapiteldef[] = [
  { id: "ankauf", titel: "Acquisition", hoehe: 2.4, marke: "Step 1/5" },
  { id: "schritte", titel: "Five steps", hoehe: 4.6, marke: "Step 1/5 → 5/5" },
  { id: "abgabe", titel: "Handover", hoehe: 1.8, marke: "Step 5/5" },
  { id: "daten", titel: "Data sheet" },
  { id: "abspann", titel: "Contact" },
];

export const { tAus, index } = zeitraster(kapitel);

/**
 * Takte der fünf Schritte in der Bühne „schritte" (0–1). Davor steht ein
 * Einleitungstakt. Text (Kapitel.tsx), HUD und Etiketten lesen dieselben
 * Zahlen — so kann der Wechsel der Etiketten nie neben seinem Schritt
 * liegen.
 */
export const EINLEITUNG = [0, 0.14] as const;
export const SCHRITT_TAKTE: [number, number][] = ablauf.map((_, i) => {
  const a = 0.16 + i * 0.168;
  return [a, i === ablauf.length - 1 ? 1 : a + 0.15];
});

/** Index des Schritts bei Erzählzeit T (vor dem ersten: 0, danach: 4). */
export function schrittBei(T: number) {
  let s = 0;
  for (let i = 1; i < SCHRITT_TAKTE.length; i++) {
    if (T >= tAus("schritte", SCHRITT_TAKTE[i][0] - 0.01)) s = i;
  }
  return s;
}

