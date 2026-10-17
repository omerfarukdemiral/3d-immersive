import {
  stellung,
  zeitraster,
  type Partitur,
  type Punkt,
  type Stellung,
} from "@/components/erlebnis/partitur";
import { uhrText } from "@/components/erlebnis/zeitachse";
import Leitstand from "./Leitstand";
import { kapitel } from "./raster";

/**
 * Partitur von /services/monitoring: „Eine Nacht" (L3).
 *
 * Die Seite misst die Uhrzeit einer Beispielnacht, 03:10 → 07:00 — die
 * Fortsetzung des Nachtkapitels der Startseite. Erzählt wird die Antwort
 * auf „Was passiert, wenn nachts um drei eine Störung kommt?": Die Anlage
 * bleibt stehen, die Meldung läuft als rote Linie zum Leitstand am
 * Horizont, die Anlage läuft wieder an. Danach der Blick in den
 * Triebstrang (Frühindikatoren), an den Turmfuß (Steuerung, keine neue
 * Technik) und um 07:00 in den Morgen — Einsatzplanung des Tages.
 */

const { tAus, index } = zeitraster(kapitel);

/* ------------------------------------------------------------------ */
/* Kamera                                                              */
/* ------------------------------------------------------------------ */

/* Text links, Anlage rechts: versatz positiv. */
const V = 0.2;

const kamera: Punkt<Stellung>[] = [
  /* 03:10 — wie das Nachtkapitel der Startseite: schräg von vorn, die
     Befeuerung über der Gondel. */
  stellung(tAus("meldung", 0), [95, 72, 85], [0, 58, 0], { fov: 34, versatz: V }),
  stellung(tAus("meldung", 0.3), [100, 74, 92], [0, 58, 0], { fov: 34, versatz: V }),
  /* Die Meldung läuft: Die Kamera tritt zurück und hebt den Blick, bis
     Gondel und Leitstand am Horizont zusammen im Bild stehen. */
  stellung(tAus("meldung", 0.5), [200, 105, 220], [-40, 40, -60], {
    fov: 34,
    versatz: V,
    hoch: 0.1,
    weite: 1.2,
    dreh: -12,
  }),
  stellung(tAus("meldung", 1), [214, 110, 232], [-40, 40, -60], {
    fov: 34,
    versatz: V,
    hoch: 0.1,
    weite: 1.2,
    dreh: -12,
  }),
  /* 03:20 — in die Gondel: Hülle offen, das Getriebe glimmt. Blick wie
     „Getriebe" in der Anatomie der Startseite, nur weiter zurück — nachts
     stünde die Befeuerung sonst als große rote Scheibe im Bild. Der Rotor
     ist arretiert (Spur `parken`), sonst liefe ein Blatt durch den Text. */
  stellung(tAus("befund", 0), [-17, 68, 24], [0.4, 60.4, 0], { fov: 34, versatz: 0.22 }),
  stellung(tAus("befund", 1), [-19, 68, 26], [0.4, 60.4, 0], { fov: 34, versatz: 0.22 }),
  /* 05:00 — hinunter an den Turmfuß: Dort sitzt die Steuerung, an die
     wir uns anbinden. Die Dämmerung beginnt. */
  stellung(tAus("technik", 0), [24, 7, 34], [0, 9, 0], { fov: 36, versatz: V }),
  stellung(tAus("technik", 1), [28, 8, 38], [0, 10, 0], { fov: 36, versatz: V }),
  /* 07:00 — weit zurück in den Morgen, die Sonne im Osten (rechts). */
  stellung(tAus("morgen", 0), [250, 46, 290], [0, 52, 0], { fov: 34, versatz: V }),
  stellung(tAus("morgen", 1), [270, 52, 310], [0, 54, 0], { fov: 34, versatz: V }),
  /* Datenblatt und Abspann: auf Abstand, die Anlage ruhig im Morgen. */
  stellung(index("daten"), [380, 90, 420], [0, 50, 0], { fov: 34, versatz: 0.16, hoch: 0.24 }),
  stellung(index("abspann"), [520, 120, 560], [0, 50, 0], { fov: 34, versatz: 0.12, hoch: 0.24 }),
];

/* ------------------------------------------------------------------ */
/* Uhr und Anlage                                                      */
/* ------------------------------------------------------------------ */

/**
 * Uhrzeit der Beispielnacht (Stunden). Im Halt der Meldung läuft sie
 * zehn Minuten, im Befund bis 05:00, an der Steuerung bis 06:30; im
 * Übergang zum Morgen springt sie auf 07:00. Ab 05:30 schaltet die Bühne
 * von Nacht- auf Tagschrift, um 07:00 ist der Himmel hell.
 */
const uhr: Punkt<number>[] = [
  [tAus("meldung", 0.12), 3 + 10 / 60],
  [tAus("meldung", 1), 3 + 20 / 60],
  [tAus("befund", 0.1), 3 + 24 / 60],
  [tAus("befund", 1), 5],
  [tAus("technik", 0.1), 5 + 4 / 60],
  [tAus("technik", 1), 6.5],
  [tAus("morgen", 0.1), 7],
];

/**
 * Rotordrehzahl: Die Störung hält die Anlage an, quittiert aus der Ferne
 * läuft sie wieder an. Für den Blick in den Triebstrang steht sie noch
 * einmal still (arretiert), an der Steuerung dreht sie wieder.
 */
const drehzahl: Punkt<number>[] = [
  [tAus("meldung", 0.24), 9],
  [tAus("meldung", 0.4), 0],
  [tAus("meldung", 0.68), 0],
  [tAus("meldung", 0.86), 10],
  [index("befund") - 0.22, 10],
  [index("befund") - 0.06, 0],
  [tAus("befund", 1), 0],
  [tAus("technik", 0.2), 9],
];

/**
 * Rotor in Y-Stellung arretiert, solange die Kamera an der Gondel steht
 * (wie in der Anatomie der Startseite): Die beiden unteren Blätter
 * bleiben unter dem Textblock.
 */
const parken: Punkt<number>[] = [
  [index("befund") - 0.2, 0],
  [index("befund") - 0.04, 1],
  [tAus("befund", 1), 1],
  [tAus("befund", 1) + 0.12, 0],
];

/** Gondelhülle: Im Befund durchsichtig, damit der Triebstrang zu sehen ist. */
const huelle: Punkt<number>[] = [
  [index("befund") - 0.2, 1],
  [tAus("befund", 0.04), 0.12],
  [tAus("befund", 1), 0.12],
  [index("technik") - 0.05, 1],
];

export const partitur: Partitur = {
  id: "/services/monitoring",
  name: "Monitoring",
  bewegung: "L3",
  kapitel,
  himmel: { quelle: "spur", uhr },
  kamera,
  spuren: { drehzahl, parken, huelle },
  fokus: [
    /* Die Meldung: Leitlinie vom Leitstand am Horizont zum Text. */
    { id: "monitoring-leitstand", von: tAus("meldung", 0.42), bis: tAus("meldung", 0.64) },
    /* Altanlage: Der Triebstrang ist das Risiko — das Getriebe glimmt. */
    { id: "getriebe", von: tAus("befund", 0.06), bis: tAus("befund", 0.46) },
    /* Keine neue Technik: Die Steuerung sitzt unten im Turm. */
    { id: "fuss", von: tAus("technik", 0.52), bis: tAus("technik", 0.98) },
  ],
  /* Der Leitstand liegt gut anderthalb Kilometer entfernt: Nebel weiter
     hinaus, sonst verschwindet der Horizont im Dunst. */
  nebel: [900, 7000],
  hud: (_T, k) => ({ etikett: "Time", wert: uhrText(k.uhr), notiz: "Example night" }),
  zusatz: Leitstand,
};
