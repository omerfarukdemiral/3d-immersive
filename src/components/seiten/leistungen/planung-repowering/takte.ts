import { zeitraster, type Kapiteldef } from "@/components/erlebnis/partitur";
import { leistungBySlug } from "@/content/leistungen";

/**
 * Zeitraster von „Der Standort": Kapitel und Takte. Eigene Datei, weil
 * Partitur (Server und Client), Text (Kapitel.tsx) und Lageplan
 * (Standortplan.tsx) dasselbe Raster lesen — und der Lageplan selbst Teil
 * der Partitur ist.
 */

export const planung = leistungBySlug("planning-repowering")!;
export const schritte = planung.ablauf!;

/* Reihenfolge = Reihenfolge der Abschnitte im HTML (Kapitel.tsx). */
export const kapitel: Kapiteldef[] = [
  /* Auftakt und Leistungsumfang: zwei Takte → 1 + 0,6 × 2 ≈ 2,2. */
  { id: "standort", titel: "The site", hoehe: 2.3, marke: "Hub height 60 m" },
  /* Einleitung + sechs Schritte = sieben Takte → 1 + 0,6 × 7 ≈ 5,2; dazu
     etwas Luft, weil der vierte Takt fast doppelt so lang ist. */
  { id: "verfahren", titel: "Six steps", hoehe: 5.6, marke: "Step 1/6" },
  { id: "daten", titel: "Data sheet" },
  { id: "abspann", titel: "Contact" },
];
export const { tAus, index } = zeitraster(kapitel);

/**
 * Takte im Kapitel „verfahren": Einleitung, dann ein Takt je Schritt.
 * Der vierte (§ 16b) ist länger — er ist das Bild der Seite, und sein
 * Titel soll den größten Teil des Takts voll stehen, nicht nur zwischen
 * Ein- und Abblenden (je FADE ≈ 0,045 in Erlebnis.tsx) aufblitzen.
 * Kapitel.tsx schreibt sie als data-takt, Standortplan.tsx blendet die
 * Bodenzeichnungen im selben Raster.
 */
export const einleitungTakt: [number, number] = [0, 0.11];
export const schrittTakte: [number, number][] = [
  [0.125, 0.24],
  [0.255, 0.37],
  [0.385, 0.5],
  [0.515, 0.735],
  [0.75, 0.865],
  [0.88, 1],
];

/** Beginn eines Schritts in Erzählzeit. */
export const schrittT = (i: number) => tAus("verfahren", schrittTakte[i][0]);
/** Ende eines Schritts in Erzählzeit. */
export const schrittEnde = (i: number) => tAus("verfahren", schrittTakte[i][1]);

