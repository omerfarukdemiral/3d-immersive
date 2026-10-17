import { zeitraster, type Kapiteldef } from "@/components/erlebnis/partitur";

/**
 * Kapitel und feste Orte der Monitoring-Seite. Eigene Datei, weil sowohl
 * die Partitur als auch der Zusatz im Canvas (Leitstand.tsx) sie lesen —
 * und die Partitur den Zusatz importiert.
 */

/* Vier feste Bühnen nach dem Konzept (Takte 0–0,4 / 0,4–0,6 / 0,6–0,8 /
   0,8–1), je ein Kapitel, damit die Kapitelschiene die Nacht in Uhrzeiten
   gliedert. Höhen nach der Faustregel 1 + 0,6 × Takte: zusammen 9
   Fensterhöhen Bühne, unter der Grenze von 12 für L3. */
export const kapitel: Kapiteldef[] = [
  { id: "meldung", titel: "Alert", hoehe: 2.8, marke: "03:10" },
  { id: "befund", titel: "Early indicators", hoehe: 2.2, marke: "03:20" },
  { id: "technik", titel: "Controls", hoehe: 2.2, marke: "05:00" },
  { id: "morgen", titel: "Dispatch planning", hoehe: 1.8, marke: "07:00" },
  { id: "daten", titel: "Data sheet" },
  { id: "abspann", titel: "Contact" },
];

const { tAus, index } = zeitraster(kapitel);

/** Zeitpunkte, auf die sich Zusatz und Text beziehen (Leitstand.tsx). */
export const zeiten = {
  /** Störung: Rotor bremst, die Meldung beginnt zu laufen. */
  meldungVon: tAus("meldung", 0.34),
  /** Die Linie hat den Leitstand erreicht. */
  meldungAn: tAus("meldung", 0.5),
  /** Ab hier tritt die Linie zurück (Blick in die Gondel). */
  meldungLeiser: index("befund"),
  /** An der Steuerung ist die Linie verschwunden. */
  meldungAus: index("technik"),
};

/**
 * Leitstand am Horizont, in Welt-Metern. Er liegt hinter der Anlage, aus
 * Sicht der Nachtkamera (Südosten) etwas rechts — die Linie läuft so von
 * der Gondel in die Tiefe, weg vom Text auf der linken Seite.
 */
export const LEITSTAND: [number, number, number] = [-770, 0, -1190];

