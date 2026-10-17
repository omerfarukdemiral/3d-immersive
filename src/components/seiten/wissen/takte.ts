import { zeitraster, type Kapiteldef } from "@/components/erlebnis/partitur";
import { artikel, type Artikel } from "@/content/wissen";

/**
 * Zeitraster von /insights und den Beiträgen. Eigene Datei, weil Partitur
 * (Server und Client), Text (page.tsx, Beitrag.tsx) und die Zusätze im
 * Canvas (Wegegabel, Differenz) dasselbe Raster lesen — und die Zusätze
 * selbst Teil der Partitur sind.
 */

/* ------------------------------------------------------------------ */
/* /insights — drei Beiträge, drei Wege (L2)                           */
/* ------------------------------------------------------------------ */

/* Reihenfolge = Reihenfolge der Abschnitte im HTML. Auftakt und drei
   Beiträge sind vier Takte → 1 + 0,6 × 4 = 3,4. */
export const wissenKapitel: Kapiteldef[] = [
  { id: "wege", titel: "Articles", hoehe: 3.4, marke: `Article 1/${artikel.length}` },
  { id: "abspann", titel: "Contact" },
];
export const wissenRaster = zeitraster(wissenKapitel);

/** Auftakt und je ein Takt pro Beitrag, 0–1 der festen Strecke „wege". */
export const auftaktTakt: [number, number] = [0, 0.22];
export const beitragTakte: [number, number][] = [
  [0.25, 0.47],
  [0.5, 0.72],
  [0.75, 1],
];

/** Beginn und Ende des Takts von Beitrag `i` in Erzählzeit. */
export const beitragT = (i: number) =>
  wissenRaster.tAus("wege", beitragTakte[i][0]);
export const beitragEnde = (i: number) =>
  wissenRaster.tAus("wege", beitragTakte[i][1]);

/* ------------------------------------------------------------------ */
/* Beiträge — Lesemodus (L1)                                           */
/* ------------------------------------------------------------------ */

/** Anker der Abschnitte (#abschnitt-0 …). */
export const abschnittId = (i: number) => `abschnitt-${i}`;

/**
 * Kapitel eines Beitrags: Auftakt als kurze feste Bühne (das eingefrorene
 * Bild der Szene steht einen Moment frei neben dem Titel), dann jeder
 * Abschnitt fließend — so wird die Kapitelschiene rechts zur
 * „Inhalt"-Liste. Danach Fragen bzw. weitere Beiträge, dann der Abspann.
 */
export function beitragKapitel(a: Artikel): Kapiteldef[] {
  return [
    /* Ein Takt, der stehen bleibt: Minimum der Faustregel. */
    { id: "beitrag", titel: a.kicker, hoehe: 1.6, marke: a.kicker },
    ...a.sections.map((s, i) => ({ id: abschnittId(i), titel: s.h })),
    { id: "fragen", titel: a.faq ? "FAQ" : "More articles" },
    { id: "abspann", titel: "Contact" },
  ];
}

/**
 * Nur Darstellung: „§ 16b" darf nicht zwischen „§" und Nummer umbrechen.
 * Ersetzt das Leerzeichen nach § durch ein geschütztes; der Text selbst
 * (Inhalt, Metadaten) bleibt unverändert.
 */
export const paragraf = (text: string) => text.replace(/§ /g, "§ ");
