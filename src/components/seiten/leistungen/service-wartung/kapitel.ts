import {
  zeitraster,
  type Kapiteldef,
  type Punkt,
} from "@/components/erlebnis/partitur";
import { klemm, zahl } from "@/components/erlebnis/zeitachse";

/**
 * Kapitel und Höhenverlauf der Service-Seite „Der Aufstieg".
 *
 * Eigene Datei, weil zwei Seiten davon lesen: die Partitur (Kamera, HUD)
 * und der Zusatz im Canvas (Messband am Turm). Läge der Verlauf in der
 * Partitur, müsste der Zusatz die Partitur importieren, die ihn selbst
 * importiert — ein Kreis über die Client-Grenze.
 *
 * Der Aufstieg ist auf drei feste Bühnen verteilt statt auf eine lange:
 * So zeigt die Kapitelschiene, wo am Turm man gerade ist (Fuß, Turm,
 * Gondel), und die Kamera fliegt zwischen den Abschnitten ein Stück
 * weiter hinauf, wie auf der Startseite.
 */
export const kapitel: Kapiteldef[] = [
  /* Zwei Takte: Auftakt am Boden, dann Anlagentypen (0 → 15 m). */
  { id: "fuss", titel: "Tower base", hoehe: 2.4, marke: "Height 0 m" },
  /* Ein Takt mit vier Punkten nacheinander (15 → 40 m). */
  { id: "turm", titel: "Tower", hoehe: 2.6, marke: "Height 15 m" },
  /* Drei Takte: Störung (a), Reaktionszeit (b), Blick hinaus (60 m). */
  { id: "gondel", titel: "Nacelle", hoehe: 3.6, marke: "Height 40 m" },
  { id: "daten", titel: "Data sheet" },
  { id: "abspann", titel: "Contact" },
];

export const raster = zeitraster(kapitel);
const { tAus } = raster;

/**
 * Höhe über Grund in Metern — die Messgröße des HUD und die Höhe des
 * Messbands am Turm. Stützpunkte wie im Konzept: 0 m im Auftakt,
 * 15 m nach den Anlagentypen, 40 m nach den vier Leistungen, 60 m
 * (Nabenhöhe des Modells) nach der Frage zur Störung. Zwischen zwei
 * Punkten weich; die Kamera fährt mit denselben Stützpunkten.
 */
const hoehe: Punkt<number>[] = [
  [tAus("fuss", 0.45), 0],
  [tAus("fuss", 1), 15],
  [tAus("turm", 1), 40],
  [tAus("gondel", 0.62), 60],
];

/** Nabenhöhe des Modells: Ende des Aufstiegs und Höchstwert des HUD. */
export const NABENHOEHE = 60;

/** Höhe zur Erzählzeit T, auf 0–60 m begrenzt. */
export const hoeheBei = (T: number) => klemm(zahl(hoehe, T), 0, NABENHOEHE);
