import {
  stellung,
  type Kapiteldef,
  type Partitur,
} from "@/components/erlebnis/partitur";
import { klemm } from "@/components/erlebnis/zeitachse";
import {
  datenschutzAbschnitte,
  impressumAbschnitte,
  nichtTitel,
} from "./texte";

/**
 * Partituren der Rechtsseiten und der 404. Alle drei sind L0: Nichts bewegt sich von selbst, der
 * Text fließt.
 *
 * Impressum und Datenschutz haben keine Szene — es gibt nichts zu
 * messen. Die Bühne zeichnet trotzdem weiter; das Papier der Seite
 * (`.papier` in recht.module.css) deckt sie zu. Kamera und Himmel stehen
 * dahinter auf einem ruhigen Mittagsbild, damit Kopfleiste und HUD in
 * Tinte gesetzt sind und der Seitenwechsel von einer Szenenseite her
 * nicht durch die Nacht fährt.
 *
 * Die 404 zeigt die Szene: nur das Fundament, keine Anlage darauf.
 */

/** Mittag: hell, kühl, Text in Tinte (docs/04-sayfa-api.md, 4.3). */
const MITTAG = 13;

/**
 * Messgröße der Rechtsseiten: Es gibt nichts zu messen, nur zu lesen.
 * Das HUD zeigt darum nur, wie
 * weit man im Text ist — ohne Etikett, denn ein Prozentwert erklärt sich
 * selbst. Abschnittsnummern stehen schon rechts im HUD und mobil neben
 * der Uhr; doppelt gezählt sähe es dort aus wie „03/13 03/13".
 *
 * T läuft von 0 bis zur Oberkante des Abspanns (Index des letzten
 * Kapitels); dann ist die Seite zu Ende gelesen.
 */
const leseHud = (anzahl: number) => (T: number) => ({
  wert: String(Math.round(klemm(T / Math.max(1, anzahl - 1)) * 100)),
  einheit: "%",
});

/** Weit zurück, hinter dem Papier — wird nicht gesehen, nur angefahren. */
const hinterPapier = [stellung(0, [260, 70, 300], [0, 50, 0])];

/* ------------------------------------------------------------------ */
/* Impressum                                                           */
/* ------------------------------------------------------------------ */

const impressumKapitel: Kapiteldef[] = [
  { id: "angaben", titel: "Details" },
  ...impressumAbschnitte.map((a) => ({ id: a.id, titel: a.h })),
  { id: "abspann", titel: "Contact" },
];

export const impressumPartitur: Partitur = {
  id: "/imprint",
  name: "Imprint",
  bewegung: "L0",
  kapitel: impressumKapitel,
  himmel: { quelle: "fest", uhr: MITTAG },
  kamera: hinterPapier,
  spuren: { drehzahl: 0 },
  hud: leseHud(impressumKapitel.length),
};

/* ------------------------------------------------------------------ */
/* Datenschutz                                                         */
/* ------------------------------------------------------------------ */

const datenschutzKapitel: Kapiteldef[] = [
  { id: "inhalt", titel: "Contents" },
  ...datenschutzAbschnitte.map((a) => ({ id: a.id, titel: a.h })),
  /* Die Überschrift des Abschnitts selbst — kein eigenes Etikett. */
  { id: "nicht-eingesetzt", titel: nichtTitel },
  { id: "abspann", titel: "Contact" },
];

export const datenschutzPartitur: Partitur = {
  id: "/privacy",
  name: "Privacy",
  bewegung: "L0",
  kapitel: datenschutzKapitel,
  himmel: { quelle: "fest", uhr: MITTAG },
  kamera: hinterPapier,
  spuren: { drehzahl: 0 },
  hud: leseHud(datenschutzKapitel.length),
};

/* ------------------------------------------------------------------ */
/* 404                                                                 */
/* ------------------------------------------------------------------ */

const fehlerKapitel: Kapiteldef[] = [
  { id: "fundament", titel: "Error 404", marke: "Height 0 m" },
  { id: "bereiche", titel: "All sections" },
];

/*
 * Nur das Fundament: Die Anlage ist weg (`anlage: 0`), das Maßraster
 * liegt noch da. Die Kamera steht tief und nah, damit der Betonring als
 * Ort lesbar ist und nicht als Fleck in der Ebene. Text links → Fundament
 * rechts; im Hochformat steht es über dem Text.
 */
export const fehlerPartitur: Partitur = {
  id: "/404",
  name: "Page not found",
  bewegung: "L0",
  kapitel: fehlerKapitel,
  himmel: { quelle: "fest", uhr: MITTAG },
  kamera: [
    stellung(0, [26, 7, 34], [0, 1.2, 0], {
      versatz: 0.22,
      hoch: 0.3,
      weite: 1.25,
    }),
  ],
  spuren: { anlage: 0, drehzahl: 0 },
  /* Wo keine Anlage steht, ist die Höhe 0 — die Messgröße der Seite ist
     zugleich ihre Pointe. Keine erfundene Zahl: Das ist die Höhe dessen,
     was zu sehen ist. */
  hud: () => ({ etikett: "Height", wert: "0", einheit: "m" }),
};
