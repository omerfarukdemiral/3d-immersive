import {
  stellung,
  zeitraster,
  type Kapiteldef,
  type Partitur,
  type Punkt,
  type Stellung,
} from "@/components/erlebnis/partitur";
import { zahl } from "@/components/erlebnis/zeitachse";

/**
 * Partitur von /services: „Vier Bereiche, vier Richtungen" (L2).
 *
 * Die Seite misst die Blickrichtung. Die Kamera umrundet die eine Anlage
 * in vier Vierteln; jeder Bereich sieht sie aus seiner eigenen Richtung,
 * mit eigener Höhe und eigenem Abstand — damit die vier Bereiche nicht wie
 * vier gleiche Folien wirken, sondern wie ein Gang um dieselbe Anlage.
 * Im Kapitel steht die Kamera (sie driftet nur leicht), beim Kapitelwechsel
 * fährt sie die nächste Vierteldrehung.
 */

/* Ein Kapitel je Richtung statt einer langen Bühne: So stehen die vier
   Bereiche einzeln in der Kapitelschiene, und der Wechsel der Richtung
   fällt genau in den Kapitelwechsel. 1,6 Höhen je Bühne (ein Takt mit
   gestaffelten Punkten) — zusammen 8 Fensterhöhen, die Obergrenze für L2. */
const kapitel: Kapiteldef[] = [
  { id: "auftakt", titel: "Services", hoehe: 1.6, marke: "View 000°" },
  { id: "ankauf", titel: "Acquisition", hoehe: 1.6, marke: "View 000°" },
  { id: "service", titel: "Maintenance", hoehe: 1.6, marke: "View 090°" },
  { id: "monitoring", titel: "Monitoring", hoehe: 1.6, marke: "View 180°" },
  { id: "planung", titel: "Planning", hoehe: 1.6, marke: "View 270°" },
  { id: "abspann", titel: "Contact" },
];

const { tAus, index } = zeitraster(kapitel);

/**
 * Ort auf dem Umlauf: `grad` ist die Blickrichtung der Seite (000°–270°),
 * gezählt vom ersten Blick aus, nicht die Kompassrichtung. 000° liegt
 * schräg vor dem Rotor im Südosten — um 13 Uhr steht die Sonne im Süden,
 * so beginnt die Seite mit der Anlage im vollen Licht. Mit wachsendem
 * Winkel wandert die Kamera über Süden nach Westen, Norden und Osten.
 */
function umlauf(grad: number, abstand: number, hoehe: number): number[] {
  const w = ((45 - grad) * Math.PI) / 180;
  return [
    Math.round(Math.sin(w) * abstand),
    hoehe,
    Math.round(Math.cos(w) * abstand),
  ];
}

/* Hochformat: Text unten, Anlage oben. Die Kamera zieht etwas weiter
   zurück, damit Rotor und Turm über dem Textblock ganz im Bild bleiben. */
const hochformat = { hoch: 0.24, weite: 1.35 };

/** Halt in einem Kapitel: Anfang und Ende der festen Strecke, leichte Drift. */
const halt = (
  id: string,
  von: number[],
  bis: number[],
  blick: number[],
  versatz: number,
  extra: Partial<Omit<Stellung, "pos" | "blick" | "versatz">> = {},
): Punkt<Stellung>[] => [
  stellung(tAus(id, 0), von, blick, { versatz, ...hochformat, ...extra }),
  stellung(tAus(id, 1), bis, blick, { versatz, ...hochformat, ...extra }),
];

const kamera: Punkt<Stellung>[] = [
  /* Auftakt: aus der Ferne vor dem Rotor, die ganze Anlage neben dem
     Titel. Die Fahrt in den ersten Blick beginnt erst im Kapitelwechsel. */
  ...halt("auftakt", umlauf(-28, 290, 22), umlauf(-20, 270, 26), [0, 52, 0], 0.2),
  /* 000° Ankauf: schräg vor dem Rotor, auf Augenhöhe, die ganze Anlage —
     wer verkauft, sieht sie als Ganzes. Text links. */
  ...halt("ankauf", umlauf(-4, 205, 30), umlauf(4, 196, 34), [0, 48, 0], 0.22),
  /* 090° Service: seitlich und hoch an der Gondel — dort wird gearbeitet.
     Text rechts. Abstand und Versatz so, dass der drehende Rotorkreis
     (Radius = Blattlänge) auch bei 1280 px links vor dem Textblock
     endet; näher heran liefe ein Blatt bei jeder Umdrehung durch die
     Punkte. */
  ...halt("service", umlauf(84, 150, 80), umlauf(94, 144, 84), [0, 56, 0], -0.32),
  /* 180° Monitoring: von hinten und von oben, weit weg — der Blick des
     Leitstands, der die Anlage aus der Ferne sieht. Text links. */
  ...halt("monitoring", umlauf(174, 270, 128), umlauf(184, 262, 136), [0, 42, 0], 0.22),
  /* 270° Planung: steile Aufsicht wie auf einen Lageplan — Planung
     beginnt bei der Fläche, nicht bei der Maschine. Text rechts. */
  ...halt("planung", umlauf(264, 140, 228), umlauf(272, 132, 236), [4, 16, 0], -0.26),
  /* Abspann: zurück auf Abstand, wieder vor dem Rotor — der Kreis ist
     geschlossen. Im Hochformat steht die Frage „Passt das zu Ihrer
     Situation?" in der Bildmitte; die Anlage rückt deshalb höher und
     kleiner ins obere Viertel, zwischen Kopfzeile und Weiter-Leiste —
     über Marke und Titel. */
  stellung(index("abspann"), umlauf(-14, 420, 70), [0, 50, 0], {
    versatz: 0.12,
    hoch: 0.41,
    weite: 1.8,
  }),
];

/**
 * Blickrichtung im HUD. Stützpunkte zu denselben Zeiten wie die Kamera,
 * mit derselben weichen Kurve (zahl) — die Gradzahl läuft also genau mit
 * der Fahrt. Im Halt zeigt sie den runden Wert des Bereichs.
 */
const blick: Punkt<number>[] = [
  [tAus("auftakt", 1), 0],
  [index("ankauf"), 0],
  [tAus("ankauf", 1), 0],
  [index("service"), 90],
  [tAus("service", 1), 90],
  [index("monitoring"), 180],
  [tAus("monitoring", 1), 180],
  [index("planung"), 270],
  [tAus("planung", 1), 270],
  /* Zurück vor den Rotor: weiter auf 360°, damit die Zahl nicht rückwärts
     über alle Richtungen läuft; angezeigt wird 000°. */
  [index("abspann"), 360],
];

export const partitur: Partitur = {
  id: "/services",
  name: "Services",
  bewegung: "L2",
  kapitel,
  /* Mittagslicht: hell und kühl, die Sonne im Süden. */
  himmel: { quelle: "fest", uhr: 13 },
  kamera,
  hud: (T) => {
    const grad = Math.round(zahl(blick, T)) % 360;
    return { etikett: "View", wert: `${String(grad).padStart(3, "0")}°` };
  },
};
