import {
  stellung,
  zeitraster,
  type Kapiteldef,
  type Partitur,
  type Punkt,
  type Stellung,
} from "@/components/erlebnis/partitur";
import { kraftwerke as orte } from "@/components/erlebnis/kraftwerkOrte";

/**
 * Partitur der Startseite: eine Anlage, ein Tag.
 *
 * Alles, was sich beim Scrollen bewegt, hängt an der Erzählzeit T.
 * Ganzzahliger Teil = Kapitel, Rest = Weg durch das Kapitel. Daraus folgen
 * Uhrzeit, Himmel, Kamera und Anlage. Wer die Choreografie der Startseite
 * ändern will, ändert nur diese Datei.
 */

/** Höhe in Viewport-Höhen, Uhrzeit in Stunden (über 24 = nächster Tag). */
export const kapitel = [
  { id: "prolog", titel: "Opening", hoehe: 2.4, uhr: 6 + 25 / 60 },
  { id: "anatomie", titel: "Inside the turbine", hoehe: 5.2, uhr: 13 },
  /* Vier Blicke auf einem Bogen von rund 95° um die Anlage statt vier
     Vierteldrehungen: kürzere Wege, kürzeres Kapitel. */
  { id: "leistungen", titel: "Services", hoehe: 4.6, uhr: 15 + 20 / 60 },
  /* Kraftwerke im späten Nachmittagslicht (warm, aber noch nicht ganz
     orange). Lang genug für eine nahe Kamera: rund anderthalb
     Bildschirmhöhen je Kraftwerk. Danach fliegt die Kamera gut einen
     Kilometer zurück zur Anlage — dafür die lange Luft. */
  { id: "netz", titel: "Power plants", hoehe: 8.5, uhr: 17 + 40 / 60, luft: 3 },
  { id: "ablauf", titel: "Acquisition", hoehe: 3, uhr: 18.5 },
  { id: "nacht", titel: "Monitoring", hoehe: 3, uhr: 27 + 10 / 60, luft: 2.2 },
  { id: "repowering", titel: "Repowering", hoehe: 3.4, uhr: 30 + 20 / 60, luft: 2 },
  /* 07:00 statt 10:00: Der Abspann steht noch im warmen Morgenlicht. */
  { id: "schluss", titel: "Contact", hoehe: 1.6, uhr: 31 },
] as const satisfies readonly Kapiteldef[];

export type KapitelId = (typeof kapitel)[number]["id"];

const raster = zeitraster([...kapitel]);
const kapitelIndex = (id: KapitelId) => raster.index(id);
const tAus = (id: KapitelId, q: number) => raster.tAus(id, q);

/* ------------------------------------------------------------------ */
/* Kamera                                                              */
/* ------------------------------------------------------------------ */

/* Kurzform wie bisher: Kapitel und Ort statt rohem T. */
const st = (
  id: KapitelId,
  q: number,
  pos: number[],
  blick: number[],
  fov = 36,
  versatz = 0,
  hochformat: { hoch?: number; weite?: number; dreh?: number } = {},
): Punkt<Stellung> =>
  stellung(tAus(id, q), pos, blick, { fov, versatz, ...hochformat });

/* Ablauf im Hochformat: Überschrift und Zeitleiste füllen fast den ganzen
   Bildschirm. Die Anlage rückt klein in den Streifen unter der Kopfleiste.
   Genau von der Seite wäre sie dort nur ein Stäbchen; um 32° zur
   Rotorfront geschwenkt zeigt der Rotor sein Kreuz. Etwas weiter weg und
   weniger gehoben, damit die Blattspitze nicht an die Kopfleiste stößt. */
const ablaufHoch = { hoch: 0.3, weite: 1.75, dreh: 32 };

/* Planung (270°) im Hochformat: Die Aufsicht rückt ins obere Bild, der
   Turm steht über dem Textblock statt mitten hinter den Aufzählungen. */
const planungHoch = { hoch: 0.22, weite: 1.2 };

/* Netz: fünf Takte, einer je Kraftwerk (Text in Kapitelfolge.tsx). */
export const netzTakte = [
  [0.16, 0.32],
  [0.34, 0.5],
  [0.52, 0.67],
  [0.69, 0.84],
  [0.86, 1],
] as const;
/* Die Kamera fährt wie ein Zug die Leitung entlang: ein Stützpunkt je
   Kraftwerk in der Mitte seines Takts, dazwischen kein Halt. Immer aus
   Süd-Südwest — um 17:40 steht die Sonne im Westsüdwesten, schräg
   hinter der Kamera, und die Kraftwerke bekommen warmes Seitenlicht.
   Auf einer geraden Schiene (NETZ_Z): Folgte die Kamera dem Versatz der
   Kraftwerke quer zur Reihe (±35 m), führe sie bei jedem Kraftwerk vor
   und zurück — der Boden schaukelte im Bild auf und ab.
   Nah (gut 250 m statt 460 m): Ein Kraftwerk füllt das halbe Bild. */
const NETZ_Z = -255;
const netzKamera = orte.map((k, i) => {
  const [s, e] = netzTakte[i];
  const ziel = [k.x, i === 0 ? 38 : 4, NETZ_Z];
  /* Am Umspannwerk wendet die Kamera — dort steht sie länger. */
  const q = i === orte.length - 1 ? s + 0.04 : (s + e) / 2;
  return st("netz", q, [k.x - 80, 95, NETZ_Z + 240], ziel, 36, -0.27);
});
const netzEnde = netzKamera[netzKamera.length - 1][1];

/**
 * Regel für alle Halte: Entweder steht die Kamera ganz (zwei gleiche
 * Stützpunkte), oder sie driftet in die Richtung, in die sie danach
 * weiterfährt. Driftet sie beim Lesen zurück, kehrt die Kurve an jedem
 * Halt die Richtung um — die Anlage pendelt sichtbar hin und her.
 */
const kamera: Punkt<Stellung>[] = [
  st("prolog", 0, [190, 18, 150], [0, 50, 0], 34, 0.2),
  st("prolog", 1, [150, 28, 105], [0, 52, 0], 34, 0.2),

  /* Anatomie: Die Fahrt zum nächsten Bauteil nimmt den größten Teil
     des Takts ein (rund 0,15 T), der Halt ist kurz. */
  /* Einleitung: weiter weg und weiter rechts, damit kein Blatt bis in
     die Überschrift reicht — der Rotor dreht hier noch. */
  st("anatomie", 0, [74, 76, 72], [0, 60, 0], 34, 0.25),
  // Blätter
  st("anatomie", 0.15, [70, 80, 66], [6, 66, 0], 34, 0.16),
  st("anatomie", 0.2, [70, 80, 66], [6, 66, 0], 34, 0.16),
  // Nabe
  st("anatomie", 0.36, [17, 63.5, 13], [3, 60.4, 0], 34, 0.16),
  st("anatomie", 0.4, [17, 63.5, 13], [3, 60.4, 0], 34, 0.16),
  // Getriebe und Generator etwas weiter rechts: Auf flachen Fenstern
  // stieße das Gehäuse sonst an die rote Zeile der Messwerte.
  // Seitlicher als zuerst ([-9, 65.5, 13]): Von der Nabe her schwenkte
  // der Blick sonst um 80° auf 15 m Abstand — der schnellste Schwenk
  // der Seite.
  st("anatomie", 0.56, [-9, 66, 16], [0.4, 60.6, 0], 34, 0.21),
  st("anatomie", 0.6, [-9, 66, 16], [0.4, 60.6, 0], 34, 0.21),
  // Generator
  st("anatomie", 0.73, [-14, 64.5, 10], [-1.9, 60.6, 0], 34, 0.21),
  st("anatomie", 0.78, [-14, 64.5, 10], [-1.9, 60.6, 0], 34, 0.21),
  // Turm: rückwärts aus der Gondel heraus, in derselben Richtung, aus
  // der die Kamera auf den Generator schaut — dann hinunter zum
  // Turmfuß, ohne um die Anlage herumzufahren. Vorher lag der Turmblick
  // auf der anderen Seite (Rotorseite), und der Blick drehte beim
  // Verlassen der Gondel in 100 px um bis zu 50°.
  st("anatomie", 0.87, [-40, 72, 38], [-2, 50, 0], 35, 0.18),
  st("anatomie", 0.95, [-55, 12, 95], [0, 20, 0], 36, 0.16),
  st("anatomie", 1, [-55, 12, 95], [0, 20, 0], 36, 0.16),

  /* Leistungen: vier Bereiche, vier Blicke auf einem Bogen um die
     Anlage (100° → 70° → 35° → 10° von der Rotorachse), jeder mit
     eigener Höhe. An jedem Blick steht die Kamera kurz, dazwischen
     fährt sie ohne Umweg weiter. Der Bogen beginnt auf der Seite, auf
     der die Anatomie endet (Turmfuß, 120°) — andersherum führe die
     Kamera erst an der Anlage vorbei und dann zurück. Um 15:20 steht die
     Sonne im Südwesten, also im Rücken der ersten Blicke. Der letzte
     Blick (Planung) schaut von oben auf den Standort. */
  // 000° Ankauf: Augenhöhe, ganze Anlage
  st("leistungen", 0.22, [-30, 40, 195], [0, 46, 0], 36, 0.22),
  st("leistungen", 0.26, [-30, 40, 195], [0, 46, 0], 36, 0.22),
  // 035° Service: seitlich und hoch an der Gondel — dort wird gearbeitet
  st("leistungen", 0.45, [51, 78, 141], [0, 54, 0], 36, 0.22),
  st("leistungen", 0.48, [51, 78, 141], [0, 54, 0], 36, 0.22),
  // 070° Monitoring: weiter weg, leicht von oben, schräg vor dem Rotor
  st("leistungen", 0.67, [164, 95, 115], [0, 44, 0], 36, 0.22),
  st("leistungen", 0.7, [164, 95, 115], [0, 44, 0], 36, 0.22),
  // 095° Planung: steile Aufsicht wie auf einen Lageplan — Planung
  // beginnt bei der Fläche, nicht bei der Maschine.
  st("leistungen", 0.88, [118, 190, 21], [4, 18, -10], 36, 0.22, planungHoch),
  st("leistungen", 1, [118, 190, 21], [4, 18, -10], 36, 0.22, planungHoch),

  /* Netz: Auftakt hinter der Anlage, Blick nach Westen die Trasse
     entlang — noch steht dort nichts. Text rechts, Bild links. */
  st("netz", 0, [-150, 120, 200], [-260, 34, -230], 36, -0.27),
  ...netzKamera,
  [tAus("netz", 1), netzEnde],
  /* Rückflug: Die Kamera bleibt stehen und dreht sich nach Osten,
     dann fliegt sie vorwärts an der Reihe entlang zur Anlage. Jede
     Achse läuft dabei nur in eine Richtung — ein Bogen erst hinauf und
     wieder hinab ließ die Kraftwerke im Bild hin und her rutschen. */
  st("netz", 1.12, [-1180, 95, -15], [-560, 30, -240], 36, 0),

  /* Ablauf steht ganz: Die Kamera kommt von Westen (Umspannwerk) und
     fliegt danach weiter nach Osten zur Nacht. */
  st("ablauf", 0, [20, 7, 258], [0, 51, 0], 36, 0.3, ablaufHoch),
  st("ablauf", 1, [20, 7, 258], [0, 51, 0], 36, 0.3, ablaufHoch),

  /* Nacht driftet nach +x, genau wie die Fahrt davor (von Westen) und
     danach (Repowering) — sonst pendelte die Anlage beim Lesen. */
  st("nacht", 0, [70, 74, 90], [0, 59, 0], 34, 0.18),
  st("nacht", 1, [95, 68, 96], [0, 60, 0], 34, 0.18),

  /* Repowering: Die Kamera steht von Anfang an so weit weg, dass der
     Geist (120-m-Klasse) ganz im Bild ist — die Anlage wächst in ihn
     hinein, statt aus dem Bild. */
  st("repowering", 0, [300, 40, 290], [0, 82, 0], 36, 0.2),
  st("repowering", 0.46, [318, 52, 312], [0, 92, 0], 36, 0.2),
  st("repowering", 1, [350, 80, 340], [0, 102, 0], 36, 0.2),

  /* Abspann: Die Kamera zieht sich weit zurück, die Flotte steht im
     Morgenlicht noch einmal auf — und die eine Anlage mitten darin. */
  st("schluss", 0, [760, 150, 820], [0, 56, -180], 34, 0.12, { hoch: 0.24, weite: 1 }),
];

/* ------------------------------------------------------------------ */
/* Anlage                                                              */
/* ------------------------------------------------------------------ */

/** Rotordrehzahl in U/min. Stillstand in „Der Service kommt zu spät". */
const drehzahl: Punkt<number>[] = [
  [0, 9],
  [tAus("anatomie", 0.1), 4],
  [tAus("anatomie", 0.2), 4],
  [tAus("anatomie", 0.26), 0],
  [tAus("anatomie", 0.82), 0],
  [tAus("anatomie", 0.9), 4],
  [tAus("leistungen", 0), 15],
  [tAus("nacht", 0), 12],
  [tAus("repowering", 0.08), 10],
  [tAus("repowering", 1), 8],
];

/** Maßstab der Anlage: Repowering ersetzt eine 60-m- durch eine 120-m-Klasse. */
const massstab: Punkt<number>[] = [
  [tAus("repowering", 0.08), 1],
  [tAus("repowering", 0.42), 2],
];

/**
 * Rotor arretiert: Für Nabe, Getriebe und Generator steht die Kamera so nah,
 * dass ein drehendes Blatt quer durch den Text liefe. Wie bei echten
 * Arbeiten im Triebstrang wird der Rotor festgesetzt — in Y-Stellung (ein
 * Blatt senkrecht nach oben), die beiden anderen zeigen schräg nach unten
 * und bleiben unter dem Textblock. 0 = frei, 1 = arretiert; der Winkel
 * hängt dabei am Scroll, damit die Stellung beim Takt sicher erreicht ist.
 */
const parken: Punkt<number>[] = [
  [tAus("anatomie", 0.2), 0],
  [tAus("anatomie", 0.27), 1],
  [tAus("anatomie", 0.82), 1],
  [tAus("anatomie", 0.88), 0],
];

/** Sichtbarkeit der Gondelhülle; im Anatomie-Kapitel wird sie durchsichtig. */
const huelle: Punkt<number>[] = [
  [tAus("anatomie", 0.44), 1],
  [tAus("anatomie", 0.5), 0.12],
  [tAus("anatomie", 0.8), 0.12],
  [tAus("anatomie", 0.86), 1],
];

/** Bauteil im Fokus, mit weichem Ein- und Ausblenden. */
const fokus = [
  { id: "rotorblaetter", von: tAus("anatomie", 0.11), bis: tAus("anatomie", 0.28) },
  { id: "nabe", von: tAus("anatomie", 0.29), bis: tAus("anatomie", 0.46) },
  { id: "getriebe", von: tAus("anatomie", 0.47), bis: tAus("anatomie", 0.64) },
  { id: "generator", von: tAus("anatomie", 0.65), bis: tAus("anatomie", 0.82) },
  { id: "turm", von: tAus("anatomie", 0.83), bis: tAus("anatomie", 0.98) },
];

/** Geisterumriss der größeren Anlage: „Der Standort kann mehr." */
const geist: Punkt<number>[] = [
  [tAus("anatomie", 0), 0],
  [tAus("repowering", 0) - 0.25, 0],
  [tAus("repowering", 0), 0.7],
  [tAus("repowering", 0.4), 0.7],
  [tAus("repowering", 0.5), 0],
];

/* ------------------------------------------------------------------ */
/* Flotte                                                              */
/* ------------------------------------------------------------------ */

/** Höhe der Flotte (0 = im Boden, 1 = steht). */
const flotte: Punkt<number>[] = [
  /* Abspann: Im Übergang Repowering → Kontakt steht sie auf. */
  [tAus("repowering", 1) + 0.04, 0],
  [kapitelIndex("schluss") - 0.04, 1],
];

/* ------------------------------------------------------------------ */
/* Kraftwerke                                                          */
/* ------------------------------------------------------------------ */

/**
 * 0–5: Kraftwerk i hebt sich, sobald der Wert i überschreitet. Den
 * roten Ring setzt der Takt im Text (netzFokus), nicht dieser Wert.
 * Auf dem Rückflug sinkt alles in umgekehrter Reihenfolge, hinter der Kamera.
 */
const kraftwerkSpur: Punkt<number>[] = [
  /* Schon im Auftakt laufen die ersten Maste von der Anlage los und der
     Windpark hebt sich — sonst stünde der Titel über leerem Boden. */
  [tAus("netz", 0.02), 0],
  /* Jedes weitere Kraftwerk steht schon, wenn die Kamera bei ihm
     ankommt: Es hebt sich kurz vor seinem Takt. */
  ...netzTakte.flatMap(([s, e], i): Punkt<number>[] => [
    ...(i === 0 ? [] : [[tAus("netz", s - 0.06), i] as Punkt<number>]),
    [tAus("netz", s), i === 0 ? 0.5 : i + 0.3],
    [tAus("netz", e - 0.05), i + 0.92],
  ]),
  /* Auf dem Rückflug sinkt jedes Kraftwerk, kurz nachdem die Kamera an
     ihm vorbei ist — hinter ihr, außer Sicht. Bei der Ankunft an der
     Anlage ist das Feld leer. */
  [tAus("netz", 1.15), 4.92],
  [kapitelIndex("ablauf") - 0.02, 0],
];

const netzFokus = orte.map((k, i) => ({
  id: k.id,
  von: tAus("netz", netzTakte[i][0] + 0.04),
  bis: tAus("netz", netzTakte[i][1]),
}));

export const partitur: Partitur = {
  id: "/",
  name: "Home",
  bewegung: "L3",
  kapitel: [...kapitel],
  kamera,
  himmel: { quelle: "kapitel" },
  spuren: {
    drehzahl,
    massstab,
    parken,
    huelle,
    geist,
    flotte,
    kraftwerke: kraftwerkSpur,
  },
  fokus: [...fokus, ...netzFokus],
  /* Kein eigener HUD-Formatierer: Die Startseite misst die Uhrzeit, und
     das ist die Grundeinstellung der Bühne. */
};
