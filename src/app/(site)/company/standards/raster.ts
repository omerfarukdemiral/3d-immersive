import { zeitraster, type Kapiteldef } from "@/components/erlebnis/partitur";
import { rahmenTakt } from "./inhalt";

/**
 * Kapitel und Zeitraster der Standards-Seite.
 *
 * Eigene Datei, weil Partitur und Zusatz (Vorschriften.tsx) beide damit
 * rechnen: Die Partitur bindet den Zusatz ein, der Zusatz braucht die
 * Zeitpunkte der Takte — ohne diese dritte Datei importierten sich beide
 * gegenseitig.
 *
 * Höhen nach der Faustregel 1 + 0,6 × Takte: Auftakt + Einleitung (2),
 * vier Punkte (4), Einleitung + sechs Vorschriften (7). Der Rahmen ist
 * etwas länger als die Regel, weil seine Einleitung eine wortweise
 * gesetzte Überschrift trägt. Zusammen 11,8 Fensterhöhen Bühne — unter
 * der Grenze von 12 für L3.
 */
export const kapitel: Kapiteldef[] = [
  { id: "verantwortung", titel: "Responsibility", hoehe: 2.4, marke: "Proof 1/6" },
  { id: "punkte", titel: "Four points", hoehe: 4 },
  { id: "rahmen", titel: "The framework", hoehe: 5.4 },
  { id: "nachweise", titel: "Proof" },
  { id: "abspann", titel: "Contact" },
];

export const { tAus, index } = zeitraster(kapitel);

/** Wann die Vorschrift i an die Zeichnung geheftet wird (Erzählzeit). */
export const angeheftetAb = (i: number) => tAus("rahmen", rahmenTakt(i)[0] + 0.02);
