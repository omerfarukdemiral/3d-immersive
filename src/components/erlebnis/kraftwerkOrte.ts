/**
 * Die fünf Kraftwerke der Startseite (Kapitel „Netz") und die Trasse,
 * die sie verbindet. Reine Daten ohne "use client": Die Partitur
 * (Server) rechnet ihre Kamerastellungen daraus, die Szene (Client)
 * baut daraus die Geometrie.
 *
 * Maßstab 1 = 1 m. Die eine Anlage steht im Ursprung; die Kraftwerke
 * liegen westlich von ihr in einer Reihe, die Freileitung läuft auf
 * ihrer Nordseite — von der Kamera (Süden) aus also hinter ihnen, mit
 * den Masten gegen den Himmel.
 */

type KraftwerkId =
  | "kw-wind"
  | "kw-solar"
  | "kw-speicher"
  | "kw-biogas"
  | "kw-umspannwerk";

type Kraftwerk = {
  id: KraftwerkId;
  /** Mittelpunkt am Boden. */
  x: number;
  z: number;
  /** Radius des Markierungsrings. */
  r: number;
  /** Höhe des Ankers für die Leitlinie. */
  ankerY: number;
};

export const kraftwerke: readonly Kraftwerk[] = [
  /* Enger als zuerst (440 m Abstand, über 2 km Trasse): 200 m Abstand,
     kaum Versatz quer zur Reihe. Die Kamera fährt so kürzere Wege, und
     der Rückflug zur Anlage bleibt gut einen Kilometer. */
  { id: "kw-wind", x: -300, z: -220, r: 95, ankerY: 62 },
  { id: "kw-solar", x: -500, z: -290, r: 105, ankerY: 4 },
  { id: "kw-speicher", x: -700, z: -230, r: 62, ankerY: 5 },
  { id: "kw-biogas", x: -900, z: -290, r: 70, ankerY: 12 },
  { id: "kw-umspannwerk", x: -1100, z: -250, r: 85, ankerY: 18 },
];

/**
 * Verlauf der Trasse: beginnt an der einen Anlage, läuft hinter jedem
 * Kraftwerk vorbei und endet am Portal des Umspannwerks.
 *
 * `a` ist der Wert der Spur `kraftwerke` (0–5), bei dem die Leitung an
 * diesem Punkt ankommt — so wächst sie Kraftwerk für Kraftwerk mit.
 */
export const trasse: { x: number; z: number; a: number }[] = [
  { x: -60, z: -170, a: 0 },
  ...kraftwerke.map((k, i) => ({
    x: k.x + (i === 4 ? 115 : 0),
    z: k.z - (i === 4 ? 0 : 140),
    a: i + 0.5,
  })),
];

/**
 * Abstand der Masten in Metern. Mit der engeren Reihe stehen so etwa
 * zwei Maste je Kraftwerk (zwölf insgesamt statt zwanzig).
 */
export const MASTABSTAND = 115;
