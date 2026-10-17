import {
  stellung,
  zeitraster,
  type Kapiteldef,
  type Partitur,
  type Punkt,
} from "@/components/erlebnis/partitur";
import { uhrText, zahl } from "@/components/erlebnis/zeitachse";

/**
 * Partitur „Karriere" — „Ein Tag oben" · L2.
 *
 * Der Tag der Startseite, diesmal aus Sicht eines Technikers: morgens
 * am Turmfuß, dann der Aufstieg, oben allein in der Gondel — und am
 * Ende kippt der Himmel in die Nacht, weil Störungseinsätze selten dann
 * kommen, wenn es passt. Das HUD misst zwei Dinge zugleich: Uhrzeit und
 * Höhe (Notiz „Beispieltag").
 *
 * L2: wenige Stationen — Boden, Turm, Gondel, Nacht. Takte stehen hier
 * und in Inhalt.tsx im selben Raster (`takte`).
 */

const kapitel: Kapiteldef[] = [
  /* Fünf Takte: 1 + 0,6 × 5 = 4 Fensterhöhen. */
  { id: "tag", titel: "A day up top", hoehe: 4, marke: "07:30 · 0 m" },
  { id: "stellen", titel: "Open positions" },
  { id: "abspann", titel: "Contact" },
];

const { tAus, index } = zeitraster(kapitel);
const q = (x: number) => tAus("tag", x);

/** Sichtbarkeit der Takte in der festen Strecke (0–1), aus 4.11. */
const takte = {
  auftakt: [0, 0.15],
  warum: [0.17, 0.35],
  aufstieg: [0.37, 0.55],
  gondel: [0.57, 0.75],
  stoerung: [0.77, 1],
} as const;

type Taktname = keyof typeof takte;
export const takt = (n: Taktname) => `${takte[n][0]} ${takte[n][1]}`;

/* ------------------------------------------------------------------ */
/* Uhr und Höhe                                                        */
/* ------------------------------------------------------------------ */

/**
 * Beispieltag: 07:30 am Turmfuß, gegen 10 Uhr oben. Im Störungstakt
 * springt die Uhr in den Abend und die Nacht — der Himmel wird schnell
 * dunkel, die Befeuerung geht an. Danach läuft sie über Mitternacht in
 * den nächsten Vormittag (über 24 = nächster Tag), damit Datenblatt und
 * Abspann wieder bei Tageslicht stehen und die Anlage weiß ist.
 */
const uhr: Punkt<number>[] = [
  [q(0), 7.5],
  [q(takte.warum[1]), 8],
  [q(takte.aufstieg[0]), 8.25],
  [q(takte.aufstieg[1]), 9.75],
  [q(takte.gondel[1]), 10.25],
  [q(takte.stoerung[0] + 0.02), 19],
  [q(takte.stoerung[0] + 0.1), 21.75],
  [q(1), 22.5],
  [index("stellen"), 34],
  [index("abspann"), 35],
];

/**
 * Höhe des Technikers in m: Die Modellanlage hat ~60 m Nabenhöhe
 * (Illustration, keine Angabe über eine bestimmte Anlage). Unten bis
 * zum Aufstieg, oben bis zum Ende des Tages, danach wieder am Boden.
 */
const hoehe: Punkt<number>[] = [
  [q(takte.aufstieg[0] + 0.01), 0],
  [q(takte.aufstieg[1] - 0.01), 60],
  [q(1), 60],
  /* Erst wieder am Boden, dann läuft die Uhr über Mitternacht — sonst
     stünde im Übergang „04:15 · 30 m", nachts auf halber Höhe. */
  [q(1) + (index("stellen") - q(1)) * 0.1, 0],
];

/** Mobile Kopfleiste aktiv? Gleiche Grenze wie in erlebnis.css (767 px).
    Die Abfrage entsteht erst im Browser; der Server ruft `hud` nie auf. */
let mobilAbfrage: MediaQueryList | null = null;
const kopfleisteMobil = () => {
  if (typeof window === "undefined") return false;
  mobilAbfrage ??= window.matchMedia("(max-width: 767px)");
  return mobilAbfrage.matches;
};

/* ------------------------------------------------------------------ */
/* Kamera                                                              */
/* ------------------------------------------------------------------ */

/* Text links → Anlage rechts. Im Hochformat steht der Text unten, die
   Anlage rückt nach oben. */
const links = { versatz: 0.2, hoch: 0.24, weite: 1.2 };
/* Nah an der Gondel: im Hochformat höher und weiter weg, damit kein
   Blatt hinter dem großen Zitat steht. */
const nah = { versatz: 0.24, hoch: 0.3, weite: 1.25 };

export const partitur: Partitur = {
  id: "/company/careers",
  name: "Careers",
  bewegung: "L2",
  kapitel,
  himmel: { quelle: "spur", uhr },
  kamera: [
    /* 1 — Boden: die ganze Anlage im Morgenlicht (Auftakt, Warum hier). */
    stellung(q(0), [150, 12, 175], [0, 46, 0], links),
    stellung(q(takte.warum[1]), [132, 10, 160], [0, 44, 0], links),

    /* 2 — Turm: vom Fuß den Turm hinauf, die Kamera steigt mit. */
    stellung(q(takte.aufstieg[0]), [30, 3, 44], [0, 24, 0], links),
    stellung(q(takte.aufstieg[1]), [62, 50, 86], [0, 52, 0], links),

    /* 3 — Gondel: nah, der Rotor steht fest. */
    stellung(q(takte.gondel[0]), [46, 65, 62], [0, 61, 0], nah),
    stellung(q(takte.gondel[1]), [50, 66, 66], [0, 61, 0], nah),

    /* 4 — Nacht: etwas zurück, die Anlage steht dunkel, oben die
       Befeuerung. */
    stellung(q(takte.stoerung[0] + 0.04), [96, 46, 124], [0, 54, 0], links),
    stellung(q(1), [104, 44, 134], [0, 54, 0], links),

    /* Datenblatt: weiter Blick, die Anlage ruhig hinter dem Papier. */
    stellung(index("stellen"), [260, 70, 300], [0, 50, 0], links),
    /* Abspann: weit zurück und erhöht, die Flotte steht auf. */
    stellung(index("abspann"), [720, 230, 800], [0, 40, -180], {
      versatz: 0.12,
      hoch: 0.24,
    }),
  ],
  spuren: {
    /* Für den Aufstieg wird der Rotor angehalten und in Y-Stellung
       festgesetzt; er bleibt stehen, solange der Techniker oben ist —
       auch im Störungstakt: Eine Störung ist eine stehende Anlage. */
    drehzahl: [
      [q(takte.warum[1]), 9],
      [q(takte.aufstieg[0] + 0.04), 0],
      [q(1), 0],
      [index("stellen"), 9],
    ],
    parken: [
      [q(takte.aufstieg[0] + 0.03), 0],
      [q(takte.aufstieg[0] + 0.08), 1],
      [q(1), 1],
      [index("stellen"), 0],
    ],
    flotte: [
      [index("abspann") - 0.3, 0],
      [index("abspann"), 1],
    ],
  },
  fokus: [
    { id: "turm", von: q(takte.aufstieg[0] + 0.02), bis: q(takte.aufstieg[1]) },
    { id: "gondel", von: q(takte.gondel[0] + 0.02), bis: q(takte.gondel[1]) },
  ],
  hud: (T, k) => {
    const uhrzeit = uhrText(k.uhr);
    /* Mobil steht nur „Wert Einheit" in der Kopfleiste, neben Logo,
       Kapitelzahl und Knopf. Bei 390 px ist dort Platz für eine Uhrzeit,
       nicht für „10:02 · 60 m": Der Wert bräche um oder schöbe den Knopf
       über den Rand. Die Uhr ist dort die wichtigere Hälfte (der Tag);
       Uhrzeit und Höhe zusammen nennt mobil die Marke im Auftakt. */
    if (kopfleisteMobil()) return { wert: uhrzeit };
    return {
      etikett: "Time · Height",
      /* Ziffernleerzeichen: zweistellig aufgefüllt, damit der Wert beim
         Wechsel 0 → 60 nicht breiter wird. */
      wert: `${uhrzeit}\u202F·\u202F${String(
        Math.round(zahl(hoehe, T)),
      ).padStart(2, "\u2007")}`,
      einheit: "m",
      notiz: "Sample day",
    };
  },
};
