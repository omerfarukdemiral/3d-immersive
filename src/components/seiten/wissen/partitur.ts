import {
  stellung,
  zeitraster,
  type HudWert,
  type Partitur,
  type Punkt,
  type Stellung,
} from "@/components/erlebnis/partitur";
import { klemm } from "@/components/erlebnis/zeitachse";
import { artikel, type Artikel } from "@/content/wissen";
import DifferenzBeitrag from "./Differenz";
import FlaecheBeitrag from "./Flaeche";
import {
  beitragEnde,
  beitragKapitel,
  beitragT,
  wissenKapitel,
  wissenRaster,
} from "./takte";
import WegegabelBeitrag from "./Wegegabel";
import Wegweiser from "./Wegweiser";

/**
 * Partituren von /insights (L2) und den drei Beiträgen (L1) —
 * „Lesemodus".
 *
 * Jeder Beitrag hat ein eigenes, eingefrorenes Bild zu seinem Thema:
 *
 *   Post-EEG     zwanzig volle Förderjahre, dann gabelt sich der Weg in
 *                Weiterbetrieb · Verkauf · Repowering · Rückbau
 *   § 16b        alte und neue Anlage übereinander, nur die Differenz rot
 *                (dasselbe Bild wie Schritt 4 auf der Planungsseite)
 *   Rückbau      nur das Fundament, die Fläche drumherum frei
 *
 * /insights führt an diesen drei Bildern vorbei: Jeder Beitrag ist ein
 * Takt, und die Szene zeigt im Vorbeigehen, wo sein Beitrag stehen bleibt.
 */

/* Text links → Anlage rechts. Im Hochformat steht der Text unten; die
   Szene rückt nach oben und etwas zurück. */
const V = 0.2;

type Bild = {
  pos: number[];
  blick: number[];
  hoch?: number;
  weite?: number;
  fov?: number;
  /** Eigener seitlicher Versatz, wenn das Bild breiter ist als üblich. */
  versatz?: number;
};

const st = (t: number, b: Bild, versatz = b.versatz ?? V): Punkt<Stellung> =>
  stellung(t, b.pos, b.blick, {
    versatz,
    hoch: b.hoch ?? 0.22,
    weite: b.weite ?? 1.1,
    fov: b.fov ?? 36,
  });

/* ------------------------------------------------------------------ */
/* Die drei Bilder                                                     */
/* ------------------------------------------------------------------ */

/** Post-EEG: von Süden über die Jahresleiste, die Anlage am Gabelpunkt, dahinter die Wege. */
const bildPostEeg: Bild = {
  pos: [0, 100, 330],
  blick: [0, 14, -70],
  hoch: 0.26,
  weite: 1.2,
  /* Die Wege fächern breit auf: etwas weniger zur Seite, sonst läuft der
     äußere unter die Kapitelschiene. */
  versatz: 0.12,
};
/** § 16b: alte und neue Klasse übereinander, ganz im Bild (wie Planung, Schritt 4). */
const bildRepowering: Bild = { pos: [330, 60, 330], blick: [0, 86, 0], hoch: 0.2, weite: 1.2 };
/** Rückbau: schräg von oben auf Fundament, Kranstellfläche und Zuwegung. */
const bildRueckbau: Bild = {
  pos: [114, 60, 138],
  blick: [20, 0, 25],
  hoch: 0.24,
  weite: 1.15,
  /* Von Südosten: Die Kranstellfläche liegt vor dem Fundament, die
     Zuwegung läuft nach rechts unten aus dem Bild — nichts gerät unter
     die Kapitelschiene. */
  versatz: 0.16,
};

/* ------------------------------------------------------------------ */
/* /insights                                                           */
/* ------------------------------------------------------------------ */

const { tAus, index } = wissenRaster;

/** Auftakt im Abendlicht: die Anlage von Südwesten, ruhig. */
const bildAuftakt: Bild = { pos: [196, 24, 214], blick: [0, 50, 0], hoch: 0.2, weite: 1.05 };
/** Abspann: weit zurück, die Anlage steht wieder. */
const bildAbspann: Bild = { pos: [520, 120, 560], blick: [0, 50, 0], hoch: 0.24, weite: 1 };

const bilderWege = [bildPostEeg, bildRepowering, bildRueckbau];

/* Je Beitrag: Fahrt vom vorigen Bild im Übergang der Takte, dann Halt. */
const fahrten: Punkt<Stellung>[] = bilderWege.flatMap((b, i) => [
  st(beitragT(i) - 0.02, i === 0 ? bildAuftakt : bilderWege[i - 1]),
  st(beitragT(i) + 0.04, b),
  st(beitragEnde(i) - 0.02, b),
]);

/* HUD „BEITRAG 1/3 · GRUNDLAGEN · 6 MIN." — einmal gebaut, der
   Formatierer läuft in jedem Bild. */
const beitragHud: HudWert[] = artikel.map((a, i) => ({
  etikett: "Article",
  wert: `${i + 1}/${artikel.length}`,
  notiz: `${a.kicker} · ${a.readingMinutes} min`,
}));

function beitragBei(T: number) {
  let b = 0;
  for (let i = 1; i < artikel.length; i++) if (T >= beitragT(i) - 0.01) b = i;
  return b;
}

export const wissenPartitur: Partitur = {
  id: "/insights",
  name: "Insights",
  bewegung: "L2",
  kapitel: wissenKapitel,
  /* Abendlicht (Konzept): 18:20 → 19:20, das Licht wird wärmer, aber es
     wird nicht Nacht — gelesen wird bei Tinte auf hellem Himmel. */
  himmel: {
    quelle: "spur",
    uhr: [
      [0, 18 + 20 / 60],
      [index("abspann"), 19 + 20 / 60],
    ],
  },
  kamera: [
    st(0, bildAuftakt),
    st(tAus("wege", 0.2), bildAuftakt),
    ...fahrten,
    st(index("abspann"), bildAbspann, 0.12),
  ],
  spuren: {
    drehzahl: 7,
    /* Beitrag 2: die neue Klasse als Umriss über der alten. */
    geist: [
      [beitragT(1) - 0.03, 0],
      [beitragT(1) + 0.03, 1],
      [beitragEnde(1) - 0.02, 1],
      [beitragEnde(1) + 0.03, 0],
    ],
    /* Beitrag 3: die Anlage geht, das Fundament bleibt; zum Abspann
       steht sie wieder. */
    anlage: [
      [beitragT(2) - 0.05, 1],
      [beitragT(2) + 0.01, 0],
      [index("abspann") - 0.3, 0],
      [index("abspann") - 0.05, 1],
    ],
  },
  hud: (T) => beitragHud[beitragBei(T)],
  zusatz: Wegweiser,
};

/* ------------------------------------------------------------------ */
/* Beiträge (L1)                                                       */
/* ------------------------------------------------------------------ */

/**
 * Lesefortschritt: „ABSCHNITT 2/4 · 38 %". Abschnitt zählt ab dem ersten
 * Abschnitt des Textes; der Anteil läuft über alle Abschnitte (vor dem
 * ersten 0 %, ab den Fragen 100 %).
 */
function lesefortschritt(n: number) {
  const werte = Array.from({ length: n }, (_, i) => `${i + 1}/${n}`);
  return (T: number, k: { kapitel: number }): HudWert => ({
    etikett: "Section",
    wert: werte[Math.min(n, Math.max(1, k.kapitel)) - 1],
    notiz: `${Math.round(klemm((T - 1) / n) * 100)}%`,
  });
}

type Bildwahl = {
  bild: Bild;
  uhr: number;
  spuren?: Partitur["spuren"];
  zusatz?: Partitur["zusatz"];
};

/** Bild und Tageszeit je Beitrag. */
const bildwahl: Record<string, Bildwahl> = {
  /* Später Nachmittag: Die Förderzeit ist vorbei, der Tag noch nicht. */
  "post-eeg": { bild: bildPostEeg, uhr: 17.4, zusatz: WegegabelBeitrag },
  /* Mittag: klares Licht, damit der helle Umriss der neuen Anlage trägt. */
  "repowering-guide": {
    bild: bildRepowering,
    uhr: 12.6,
    spuren: { geist: 1 },
    zusatz: DifferenzBeitrag,
  },
  /* Vormittag: Die Fläche ist wiederhergestellt, nur das Fundament steht. */
  "decommissioning-costs": {
    bild: bildRueckbau,
    uhr: 10.2,
    spuren: { anlage: 0 },
    zusatz: FlaecheBeitrag,
  },
};

function beitragPartitur(a: Artikel): Partitur {
  const w = bildwahl[a.slug] ?? { bild: bildAuftakt, uhr: 11 };
  const kapitel = beitragKapitel(a);
  const { index: i } = zeitraster(kapitel);
  return {
    id: `/insights/${a.slug}`,
    name: "Insights",
    bewegung: "L1",
    kapitel,
    himmel: { quelle: "fest", uhr: w.uhr },
    /* L1: Es gilt nur die erste Stellung. Die zweite hält nur fest, dass
       das Bild bis zum Abspann dasselbe bleibt. */
    kamera: [st(0, w.bild), st(i("abspann"), w.bild)],
    spuren: w.spuren,
    hud: lesefortschritt(a.sections.length),
    zusatz: w.zusatz,
  };
}

/**
 * Eine Partitur je Beitrag, einmal auf Modulebene gebaut: Die Bühne
 * erkennt einen Seitenwechsel an der Identität des Objekts.
 */
export const beitragsPartituren = new Map<string, Partitur>(
  artikel.map((a) => [a.slug, beitragPartitur(a)]),
);
