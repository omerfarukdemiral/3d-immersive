import {
  stellung,
  type Fokus,
  type HudWert,
  type Partitur,
  type Punkt,
  type Stellung,
} from "@/components/erlebnis/partitur";
import { felder, nachweise, punktTakt, rahmenEinleitung, rahmenTakt } from "./inhalt";
import { index, kapitel, tAus } from "./raster";
import Vorschriften from "./Vorschriften";

/**
 * Partitur „Die Zeichnung", L3.
 *
 * Die Anlage wird zur Linienzeichnung — die einzige Ansicht, die es auf
 * der Startseite nicht gibt. Eine Zeichnung ist das, woran Vorschriften
 * hängen: Im Auftakt löst sich der Körper in Kanten auf, der Rotor kommt
 * zum Stehen. Die vier Punkte zeigen je auf ihr Bauteil (Gondel, Turmfuß,
 * Triebstrang, ganze Anlage), im Rahmen werden sechs Vorschriften an die
 * Zeichnung geheftet, von oben nach unten und zuletzt an den Standort.
 *
 * HUD: „Nachweis n/6" zählt die Dokumente, die die Punkte ansprechen, in
 * der Reihenfolge der Karten im Datenblatt — die Zahl im HUD und die
 * Nummer der Karte meinen dasselbe Dokument.
 *
 * Tageszeit fest 13:00: Mittagslicht ist am kühlsten und hellsten, auf
 * hellem Grund liest sich eine Zeichnung aus dunklen Kanten am besten.
 */

/* Halt einer Kamerastellung über einen Takt: kurz nach seinem Beginn
   angekommen, bis kurz vor seinem Ende stehen; die Fahrt liegt zwischen
   zwei Takten. */
function halt(
  id: string,
  [a, b]: [number, number],
  pos: number[],
  blick: number[],
  extra: Partial<Omit<Stellung, "pos" | "blick">> = {},
): Punkt<Stellung>[] {
  const o = { versatz: 0.2, ...extra };
  return [
    stellung(tAus(id, a + 0.03), pos, blick, o),
    stellung(tAus(id, Math.min(b, 0.995) - 0.02), pos, blick, o),
  ];
}

/* Hochformat: Text unten, und er ist hier lang (Prüfsatz, Vorschrift).
   Eine Nahaufnahme von Gondel oder Turm schickte den Turm der Zeichnung
   senkrecht mitten durch den Textblock. Mobil zeigt jede Stellung, deren
   Bild nach unten Turm hätte, deshalb die ganze Anlage klein im oberen
   Bild: Abstand auf rund 300 m (nach dem Hochformat-Zuschlag der Szene),
   Bild so weit gehoben, dass der Turmfuß bei etwa 52 % der Höhe endet —
   über der Marke des Textblocks. Das Bauteil zeigt dann der Fokus samt
   Leitlinie, nicht die Nähe. */
const HOCH_ABSTAND = 183;
const HOCH_FUSS = 0.52;
const HOCH_PX_JE_M = 4.5 / 844;
function ganzeAnlage(pos: number[], blick: number[]) {
  const abstand = Math.hypot(pos[0] - blick[0], pos[1] - blick[1], pos[2] - blick[2]);
  return {
    weite: HOCH_ABSTAND / abstand,
    hoch: blick[1] * HOCH_PX_JE_M - (HOCH_FUSS - 0.5),
  };
}
/* Nahaufnahme: Stellung für das Querformat, im Hochformat die ganze Anlage. */
function nah(
  id: string,
  takt: [number, number],
  pos: number[],
  blick: number[],
  extra: Partial<Omit<Stellung, "pos" | "blick">> = {},
) {
  return halt(id, takt, pos, blick, { ...extra, ...ganzeAnlage(pos, blick) });
}

const kamera: Punkt<Stellung>[] = [
  /* Auftakt: die ganze Anlage, noch als Körper, Rotor dreht. */
  stellung(tAus("verantwortung", 0), [150, 36, 160], [0, 44, 0], { versatz: 0.2 }),
  stellung(tAus("verantwortung", 1), [128, 44, 132], [0, 46, 0], { versatz: 0.2 }),

  /* Vier Punkte */
  // Arbeiten in der Höhe: nah an der Gondel, von oben auf den Arbeitsplatz
  ...nah("punkte", punktTakt(0), [46, 76, 64], [0, 58, 0], { fov: 34 }),
  // Elektrische Anlagen: Turmfuß, dort stehen Umrichter und Schaltanlage
  ...halt("punkte", punktTakt(1), [26, 9, 34], [0, 6, 0], { hoch: 0.24, weite: 1.3 }),
  // Versicherungsschutz: schräg von vorn oben in die geöffnete Gondel,
  // auf den Triebstrang. Näher (wie in der Anatomie der Startseite)
  // zerfällt die Zeichnung in einzelne Kanten ohne Zusammenhang.
  ...nah("punkte", punktTakt(2), [22, 69, 32], [0, 60.6, 0], { fov: 34 }),
  // Dokumentation: zurück auf die ganze Anlage — die Historie gilt allem
  ...halt("punkte", punktTakt(3), [118, 40, 138], [0, 44, 0]),

  /* Der Rahmen: Einleitung von weiter weg, dann Bauteil für Bauteil. */
  ...halt("rahmen", rahmenEinleitung, [140, 50, 150], [0, 44, 0]),
  // DIN EN 50308 — Gondel
  ...nah("rahmen", rahmenTakt(0), [30, 70, 44], [0, 60, 0], { fov: 34 }),
  // DGUV Regel 112-198/199 — Turm
  // (Weniger Versatz: Der Stift sitzt auf halber Höhe, dort steht rechts
  // die Sprungliste; bei 1280 px reichte sein Kasten sonst hinein.)
  ...nah("rahmen", rahmenTakt(1), [38, 40, 52], [0, 34, 0], { versatz: 0.1 }),
  // DGUV Vorschrift 3 — Turmfuß
  ...halt("rahmen", rahmenTakt(2), [26, 5, 22], [0, 4, 0], { hoch: 0.24, weite: 1.3 }),
  // Weiterbetriebsgutachten — Turm und Fundament
  ...halt("rahmen", rahmenTakt(3), [52, 16, 62], [0, 12, 0], { hoch: 0.22, weite: 1.3 }),
  // BetrSichV — die ganze Anlage im Rahmen
  ...halt("rahmen", rahmenTakt(4), [176, 58, 186], [0, 46, 0], { hoch: 0.2 }),
  // § 16b BImSchG — von oben auf den Standort
  // (Weniger Versatz als sonst: Die Standortgrenze ist breit und liefe
  // mit ihren Stiften sonst in die Sprungliste am rechten Rand.)
  ...halt("rahmen", rahmenTakt(5), [150, 250, 290], [0, 6, 0], { versatz: 0.06, hoch: 0.06, weite: 1.3, dreh: 30 }),

  /* Datenblatt: Die Kamera bleibt über dem Standort und rückt leicht ab. */
  stellung(index("nachweise") + 0.15, [170, 270, 330], [0, 8, 0], { versatz: 0.2, hoch: 0.06, weite: 1.3, dreh: 30 }),
  /* Abspann: Im Hochformat füllen Tür, CTA und Kontakt die ganze Breite
     und wandern beim Scrollen über das Bild — es gibt keine Stelle, an
     der die Anlage frei stünde. Sie wird dort darum nach oben aus dem
     Bild gehoben; es bleibt das Raster des Bodens. */
  stellung(index("abspann"), [420, 120, 480], [0, 50, 0], { versatz: 0.12, hoch: 0.62 }),
];

/* Fokus: Bauteil glimmt, Leitlinie vom Takt zum Anker. */
const fuerPunkt = (i: number, id: string): Fokus => {
  const [a, b] = punktTakt(i);
  return { id, von: tAus("punkte", a + 0.04), bis: tAus("punkte", Math.min(b, 0.98) - 0.01) };
};
const fokus: Fokus[] = [
  fuerPunkt(0, "gondel"),
  fuerPunkt(1, "fuss"),
  fuerPunkt(2, "getriebe"),
  ...[0, 1, 2, 3, 4, 5].map((i) => {
    const [a, b] = rahmenTakt(i);
    return {
      id: `standards-r${i + 1}`,
      von: tAus("rahmen", a + 0.03),
      bis: tAus("rahmen", Math.min(b, 0.98) - 0.01),
    };
  }),
];

/* HUD: Nachweis n/6. Vorab gebaut, weil der Formatierer in jedem Bild
   läuft — er wählt nur noch aus. Die Notiz nennt das Dokument, solange
   der Text von ihm spricht (die vier Punkte); im Datenblatt liegen alle
   sechs nebeneinander, dort genügt die Zahl. */
const ohneNotiz: HudWert[] = nachweise.map((_, i) => ({
  etikett: "Proof",
  wert: `${i + 1}/${nachweise.length}`,
}));
const mitNotiz: HudWert[] = nachweise.map((n, i) => ({
  ...ohneNotiz[i],
  notiz: n.titel,
}));

/* Ab wann das HUD welche Zahl zeigt: Jeder Punkt hebt sie auf seinen
   (letzten) Nachweis; beim ersten Punkt steht erst das Rettungskonzept —
   der Kern seines Prüfsatzes, er soll lesbar stehen —, erst nach gut der
   Hälfte des Takts die Qualifikation. Das Datenblatt zeigt alle sechs. */
const [p0a, p0b] = punktTakt(0);
const stufen: [number, number][] = [
  [tAus("punkte", p0a + (p0b - p0a) * 0.6), 2],
  ...felder.slice(1).map(
    (f, i): [number, number] => [tAus("punkte", punktTakt(i + 1)[0]), f.nachweise.at(-1)!],
  ),
  [index("nachweise"), nachweise.length],
];

function nachweisBei(T: number) {
  let n = 1;
  for (const [ab, wert] of stufen) if (T >= ab) n = wert;
  return n;
}

export const partitur: Partitur = {
  id: "/company/standards",
  name: "Standards",
  bewegung: "L3",
  kapitel,
  himmel: { quelle: "fest", uhr: 13 },
  kamera,
  spuren: {
    /* Der Körper löst sich während des Auftakts in Kanten auf, der Rotor
       läuft aus und arretiert — eine Zeichnung dreht sich nicht. */
    linien: [
      [tAus("verantwortung", 0.12), 0],
      [tAus("verantwortung", 0.7), 1],
    ],
    drehzahl: [
      [tAus("verantwortung", 0.3), 9],
      [tAus("verantwortung", 0.95), 0],
    ],
    parken: [
      [tAus("verantwortung", 0.6), 0],
      [tAus("verantwortung", 1), 1],
    ],
    /* Versicherungsschutz: Hülle auf, der Triebstrang liegt frei. */
    huelle: [
      [tAus("punkte", punktTakt(1)[1]), 1],
      [tAus("punkte", punktTakt(2)[0] + 0.03), 0.12],
      [tAus("punkte", punktTakt(2)[1] - 0.02), 0.12],
      [tAus("punkte", punktTakt(3)[0] + 0.03), 1],
    ],
  },
  fokus,
  hud: (T, k) => {
    const n = nachweisBei(T) - 1;
    return k.kapitel === 1 ? mitNotiz[n] : ohneNotiz[n];
  },
  zusatz: Vorschriften,
};
