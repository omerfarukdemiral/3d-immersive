import { zeitraster, type Kapiteldef } from "@/components/erlebnis/partitur";

/**
 * Kapitel und Takte der Referenzseite an einer Stelle.
 *
 * Eigene Datei, weil drei Seiten davon lesen: der Text (page.tsx setzt
 * die Takte), die Partitur (Kamera und HUD hängen an denselben Takten)
 * und die Karte im Canvas (Karte.tsx lässt ihre Bilder auf die Takte
 * fallen). Läge das Raster in partitur.ts, importierten sich Partitur
 * und Zusatz gegenseitig.
 *
 * Länge: 4,6 + 4 + 3,2 = 11,8 Fensterhöhen Bühne — knapp unter der
 * Grenze für L3 (12). Die dichten Texte stehen im Datenblatt.
 */
export const kapitel: Kapiteldef[] = [
  { id: "deutschland", titel: "Germany", hoehe: 4.6, marke: "Germany" },
  { id: "einsatz", titel: "Coverage", hoehe: 4, marke: "Nationwide" },
  { id: "lagen", titel: "Scenarios", hoehe: 3.2 },
  { id: "daten", titel: "Data sheet" },
  { id: "abspann", titel: "Contact" },
];

export const { tAus, index } = zeitraster(kapitel);

/** Takt als Paar [a, b] der festen Strecke; im HTML als „a b". */
type Takt = readonly [number, number];
export const takt = ([a, b]: Takt) => `${a} ${b}`;

/** Kapitel „deutschland": Auftakt, Kopf der Kennzahlen, vier Zahlen. */
export const takteDeutschland = {
  auftakt: [0, 0.15] as Takt,
  kopf: [0.17, 0.33] as Takt,
  zahlen: [
    [0.35, 0.5],
    [0.52, 0.67],
    [0.69, 0.84],
    [0.86, 1],
  ] as Takt[],
};

/** Kapitel „einsatz": Kopf, drei Arten der Organisation, Standorte. */
export const takteEinsatz = {
  kopf: [0, 0.18] as Takt,
  ferne: [0.2, 0.38] as Takt,
  fahrt: [0.4, 0.58] as Takt,
  teams: [0.6, 0.78] as Takt,
  standorte: [0.8, 1] as Takt,
};

/** Kapitel „lagen": Kopf, dann die vier Titel nacheinander in einer Liste. */
export const takteLagen = {
  kopf: [0, 0.3] as Takt,
  liste: [0.32, 1] as Takt,
  titel: [0.34, 0.5, 0.66, 0.82],
};
