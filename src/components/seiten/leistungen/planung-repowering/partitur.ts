import {
  stellung,
  type Partitur,
  type Punkt,
  type Stellung,
} from "@/components/erlebnis/partitur";
import Standortplan from "./Standortplan";
import {
  kapitel,
  planung,
  schritte,
  schrittEnde,
  schrittT,
  schrittTakte,
  tAus,
  index,
} from "./takte";

/**
 * /services/planning-repowering — „Der Standort" (L3).
 *
 * Die Kamera schaut von oben auf das Gelände, und das Maßraster am Boden
 * wird zum Lageplan: Jeder der sechs Verfahrensschritte zeichnet etwas
 * auf den Boden (Standortplan.tsx). Der vierte Schritt ist der Moment der
 * Seite — alte und neue Anlage stehen übereinander, und nur die
 * Veränderung ist rot (§ 16b). Im sechsten wächst die Anlage auf die
 * 120-m-Klasse.
 *
 * Messgröße: Verfahrensschritt 1/6 und Nabenhöhe der Modellanlage. Eine
 * Dauer gibt es bewusst nicht — die Content-Datei begründet, warum
 * (Genehmigungsdauer schwankt um Jahre).
 */

/* ------------------------------------------------------------------ */
/* Kamera                                                              */
/* ------------------------------------------------------------------ */

/* Text links → Anlage nach rechts (versatz positiv). Im Hochformat steht
   der Text unten; die Draufsichten brauchen dort mehr Abstand. */
const V = 0.2;

type Blick = {
  pos: number[];
  blick: number[];
  hoch?: number;
  weite?: number;
  fov?: number;
  versatz?: number;
};

/** Bild je Schritt. Draufsichten für den Lageplan, Seitenansicht für die Anlage. */
const bilder: Blick[] = [
  /* 1 Standortbewertung: senkrecht von oben, alle Abstandsringe im Bild.
     Weiter rechts als die übrigen Bilder, damit der äußere Ring vor der
     Textspalte endet und die Siedlung nicht am Rand anstößt. */
  { pos: [170, 1180, 640], blick: [-20, 0, -30], hoch: 0.2, weite: 1.25, versatz: 0.27 },
  /* 2 Wirtschaftlichkeit: Bestand und Repowering nebeneinander */
  { pos: [250, 70, 300], blick: [-40, 52, 0], hoch: 0.2, weite: 1.2 },
  /* 3 Vorplanung: näher von oben, Zuwegung und Kranstellfläche */
  { pos: [150, 330, 300], blick: [-10, 0, 30], hoch: 0.2, weite: 1.2 },
  /* 4 Genehmigung: alte und neue Klasse übereinander, ganz im Bild */
  { pos: [330, 60, 330], blick: [0, 86, 0], hoch: 0.18, weite: 1.15 },
  /* 5 Ausführungsplanung: hinter der Anlage, die Leitung läuft zum Horizont */
  /* Blick etwas tiefer: Turmfuß und Kranstellfläche über dem HUD-Band. */
  { pos: [-170, 140, 260], blick: [380, -70, -520], hoch: 0.24, weite: 1.1 },
  /* 6 Bau und Inbetriebnahme: die 120-m-Anlage in voller Größe */
  { pos: [340, 70, 350], blick: [0, 98, 0], hoch: 0.18, weite: 1.15 },
];

const st = (t: number, b: Blick, versatz = b.versatz ?? V): Punkt<Stellung> =>
  stellung(t, b.pos, b.blick, {
    versatz,
    hoch: b.hoch ?? 0.16,
    weite: b.weite ?? 1,
    fov: b.fov ?? 36,
  });

/** Einleitung des Verfahrens: hoch über dem Gelände, schräg. */
const ueberblick: Blick = { pos: [300, 300, 560], blick: [-10, 10, 0], hoch: 0.2, weite: 1.2 };

/* Die Kamera fliegt am Anfang jedes Schritts (vom Ende des vorigen Takts
   bis kurz nach Beginn des neuen) und steht danach still — lesen, dann
   weiter, wie auf der Startseite. */
const fahrten: Punkt<Stellung>[] = bilder.flatMap((b, i) => {
  const [a, e] = schrittTakte[i];
  return [
    st(tAus("verfahren", Math.max(0, a - 0.03)), i === 0 ? ueberblick : bilder[i - 1]),
    st(tAus("verfahren", a + 0.04), b),
    st(tAus("verfahren", e), b),
  ];
});

/* ------------------------------------------------------------------ */
/* Partitur                                                            */
/* ------------------------------------------------------------------ */

export const partitur: Partitur = {
  id: "/services/planning-repowering",
  name: planung.nav,
  bewegung: "L3",
  kapitel,
  /* Ein Planungstag: Vormittag bis Mittag, die Sonne wandert von Ost nach
     Süd — Schatten und Licht bewegen sich mit, ohne dass es Abend wird. */
  himmel: { quelle: "spur", uhr: [[0, 9.4], [index("daten"), 13]] },
  kamera: [
    /* Auftakt: tief am Turmfuß, die Anlage im Gelände — weit genug
       zurück, dass die Rotorspitze unter der Kopfleiste bleibt. */
    st(tAus("standort", 0), { pos: [114, 6, 166], blick: [0, 34, 0], hoch: 0.16 }),
    st(tAus("standort", 0.4), { pos: [128, 14, 180], blick: [0, 36, 0], hoch: 0.16 }),
    /* Leistungsumfang: die Kamera hebt sich, das Raster wird zum Plan */
    st(tAus("standort", 0.52), { pos: [170, 120, 260], blick: [0, 24, 0], hoch: 0.18, weite: 1.1 }),
    st(tAus("standort", 1), { pos: [190, 150, 290], blick: [0, 20, 0], hoch: 0.18, weite: 1.1 }),
    st(tAus("verfahren", 0.02), ueberblick),
    ...fahrten,
    /* Datenblatt: die neue Anlage steht, ruhig von Süden */
    st(index("daten"), { pos: [380, 120, 420], blick: [0, 92, 0], hoch: 0.2 }, 0.18),
    /* Abspann: weit zurück nach Süden — hinter der Anlage zeichnen sich
       die Planungsprojekte ab (Flotte.tsx; vier liegen im Nordosten, die
       beiden im Westen bleiben außerhalb des Bilds, hinter dem Text). */
    st(index("abspann"), { pos: [-200, 300, 1300], blick: [400, 40, -400], hoch: 0.24 }, 0.12),
  ],
  spuren: {
    drehzahl: [
      [0, 9],
      [schrittT(5), 9],
      [schrittEnde(5), 8],
    ],
    /* § 16b: Die neue Klasse steht als Umriss über der alten — im
       vierten Schritt, und im sechsten wächst die Anlage in ihn hinein. */
    geist: [
      [tAus("verfahren", schrittTakte[3][0] - 0.02), 0],
      [tAus("verfahren", schrittTakte[3][0] + 0.04), 1],
      [tAus("verfahren", schrittTakte[3][1]), 1],
      [tAus("verfahren", schrittTakte[3][1] + 0.03), 0],
      [tAus("verfahren", schrittTakte[5][0] - 0.02), 0],
      [tAus("verfahren", schrittTakte[5][0] + 0.01), 1],
      [tAus("verfahren", 0.95), 1],
      [tAus("verfahren", 1), 0],
    ],
    massstab: [
      [tAus("verfahren", schrittTakte[5][0] + 0.01), 1],
      [tAus("verfahren", 0.97), 2],
    ],
    planung: [
      [index("abspann") - 0.4, 0],
      [index("abspann"), 1],
    ],
    flotte: 0,
  },
  /* Netzanschluss: Leitlinie vom Turmfuß (Umrichter, Schaltanlage) zum Text */
  fokus: [{ id: "fuss", von: schrittT(4) + 0.03, bis: schrittEnde(4) }],
  hud: (T, k) => {
    const s = schrittBei(T);
    return {
      etikett: "Step",
      wert: `${s + 1}/6`,
      notiz: `${schritte[s].step} · Hub height ${Math.round(60 * k.szene.massstab)} m`,
    };
  },
  /* Draufsichten aus bis zu 1 km Höhe: Nebel weiter weg, sonst verschwindet
     der Lageplan im Dunst. */
  nebel: [900, 6400],
  zusatz: Standortplan,
};

/** Aktueller Verfahrensschritt (0–5); vor dem ersten Schritt gilt der erste. */
function schrittBei(T: number) {
  let s = 0;
  for (let i = 1; i < 6; i++) if (T >= schrittT(i) - 0.005) s = i;
  return s;
}
