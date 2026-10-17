import {
  stellung,
  zeitraster,
  type Kapiteldef,
  type Partitur,
  type Punkt,
} from "@/components/erlebnis/partitur";
import { company } from "@/content/site";

/**
 * Partitur „/company" — „Seit 2016".
 *
 * L2: Morgenlicht, die Anlage läuft ruhig, die Kamera gleitet langsam in
 * eine Richtung um sie herum — keine Bauteile, keine Sprünge. Die Seite
 * erzählt keine Technik, sondern eine Haltung; die Szene soll nur atmen.
 * Erst im Abspann zieht sich die Kamera zurück und die Flotte steht auf:
 * aus der einen Anlage wird das, was seit 2016 gewachsen ist.
 */

const kapitel: Kapiteldef[] = [
  /* Auftakt und „Unsere Wurzeln …": zwei Takte. */
  {
    id: "seit",
    titel: `Since ${company.founded}`,
    hoehe: 2.4,
    marke: `Since ${company.founded}`,
  },
  /* Fünf Punkte, jeder ein Takt, der Titel steht die ganze Zeit:
     1 + 0,6 × 5 = 4, etwas mehr, damit jeder Punkt gut eine halbe
     Fensterhöhe Scroll bekommt. */
  {
    id: "punkte",
    titel: "What sets us apart",
    hoehe: 4.4,
    marke: `${company.experienceYears}+ years`,
  },
  { id: "wer", titel: "Who we are" },
  { id: "abspann", titel: "Contact" },
];

const { tAus, index } = zeitraster(kapitel);

/** Zeitpunkte der fünf Punkte in der Bühne „punkte" (0–1 der festen Strecke). */
export const punktTakte: [number, number][] = [
  [0.1, 0.28],
  [0.28, 0.46],
  [0.46, 0.64],
  [0.64, 0.82],
  [0.82, 1],
];

/* Text links → Anlage rechts (versatz +). Im Hochformat steht der Text
   unten; die Anlage rückt nach oben und etwas weiter weg, damit die
   Blattspitzen nicht hinter die Kopfleiste und der Turmfuß nicht hinter
   den Text geraten. */
const hochformat = { hoch: 0.24, weite: 1.05 };
const versatz = 0.2;

/* Einmal gebaut: Der Formatierer läuft in jedem Bild. */
const hudWert = {
  etikett: "Since",
  wert: String(company.founded),
  notiz: `${company.experienceYears}+ years of experience`,
};

export const partitur: Partitur = {
  id: "/company",
  name: "Company",
  bewegung: "L2",
  kapitel,
  /* Ein Morgen, der langsam heller wird: 07:40 → 09:30. Nicht 06:25 wie
     der Prolog der Startseite — dort färbt das tiefe Licht die Anlage
     warm; hier soll sie klar und weiß stehen. */
  himmel: {
    quelle: "spur",
    uhr: [
      [0, 7 + 40 / 60],
      [index("abspann"), 9.5],
    ],
  },
  /* Eine Fahrt, ein Drehsinn: von Südost (Morgensonne im Rücken der
     Kamera) gegen den Uhrzeigersinn nach Süden, dabei langsam höher. Im
     Halt jeder Bühne gleitet die Kamera nur wenig — die Bewegung soll man
     eher spüren als sehen. */
  kamera: [
    stellung(0, [205, 18, 132], [0, 50, 0], { fov: 34, versatz, ...hochformat }),
    stellung(tAus("seit", 1), [182, 26, 165], [0, 52, 0], { fov: 34, versatz, ...hochformat }),
    stellung(tAus("punkte", 0), [168, 30, 180], [0, 52, 0], { fov: 34, versatz, ...hochformat }),
    stellung(tAus("punkte", 1), [118, 42, 214], [0, 54, 0], { fov: 34, versatz, ...hochformat }),
    /* Datenblatt: weiter weg und höher, die Anlage steht klein hinter
       dem Papier. */
    stellung(index("wer"), [70, 70, 330], [0, 52, 0], { fov: 34, versatz: 0.14, ...hochformat }),
    /* Abspann: weit zurück, die Flotte im Morgenlicht — und die eine
       Anlage mitten darin. */
    stellung(index("abspann"), [720, 160, 800], [0, 56, -160], {
      fov: 34,
      versatz: 0.12,
      hoch: 0.24,
      weite: 1,
    }),
  ],
  spuren: {
    /* Ruhiger Lauf statt Stillstand: Die Anlage arbeitet. */
    drehzahl: 8,
    flotte: [
      [index("abspann") - 0.35, 0],
      [index("abspann") - 0.02, 1],
    ] satisfies Punkt<number>[],
  },
  /* Messgröße der Seite: „SEIT 2016 · 12+ JAHRE ERFAHRUNG". Keine
     Zählung, kein Verlauf — beides stünde für Werte, die es nicht gibt. */
  hud: () => hudWert,
};
