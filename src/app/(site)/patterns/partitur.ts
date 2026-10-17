import {
  stellung,
  zeitraster,
  type Kapiteldef,
  type Partitur,
  type Punkt,
} from "@/components/erlebnis/partitur";
import { klemm, zahl } from "@/components/erlebnis/zeitachse";
import Hoehenring from "./Hoehenring";

/**
 * Muster einer L2-Seite (nur in der Entwicklung erreichbar, /muster).
 * Zeigt jeden Teil der Partitur einmal: Kapitel mit fester Bühne,
 * Datenblatt und Abspann, Kamerafahrt, eine Spur, eigene Messgröße im
 * HUD und einen Zusatz im Canvas. Vorlage für die Seiten-Agenten —
 * siehe docs/04-sayfa-api.md.
 */

/* Reihenfolge = Reihenfolge der Abschnitte im HTML. Datenblatt und
   Abspann fließen und brauchen keine Höhe. */
const kapitel: Kapiteldef[] = [
  { id: "aufstieg", titel: "Ascent", hoehe: 4, marke: "Height 0 m" },
  { id: "daten", titel: "Data sheet" },
  { id: "abspann", titel: "Contact" },
];

const { tAus, index } = zeitraster(kapitel);

/** Höhe der Kamera über Grund, 0 → 60 m in der festen Bühne. */
const hoehe: Punkt<number>[] = [
  [tAus("aufstieg", 0.15), 2],
  [tAus("aufstieg", 0.95), 60],
];

export const partitur: Partitur = {
  id: "/patterns",
  name: "Patterns",
  bewegung: "L2",
  kapitel,
  himmel: { quelle: "fest", uhr: 10.5 },
  /* Am Turm hinauf: Blick knapp über Augenhöhe der Kamera, damit der
     Turm als Wand neben dem Text steht. Text links → Anlage rechts. */
  kamera: [
    stellung(tAus("aufstieg", 0), [62, 3, 74], [0, 14, 0], { versatz: 0.2 }),
    stellung(tAus("aufstieg", 0.15), [54, 4, 64], [0, 10, 0], { versatz: 0.2 }),
    stellung(tAus("aufstieg", 0.95), [46, 64, 54], [0, 60, 0], { versatz: 0.2 }),
    /* Datenblatt: zurück auf Abstand, die Szene hält still. */
    stellung(index("daten"), [180, 60, 160], [0, 45, 0], { versatz: 0.2 }),
    stellung(index("abspann"), [520, 120, 560], [0, 50, 0], {
      versatz: 0.12,
      hoch: 0.24,
    }),
  ],
  spuren: {
    /* Für den Aufstieg steht der Rotor (Arbeiten in der Gondel). */
    drehzahl: [
      [tAus("aufstieg", 0.1), 8],
      [tAus("aufstieg", 0.3), 0],
      [index("daten"), 0],
      [index("abspann"), 9],
    ],
  },
  hud: (T) => ({
    etikett: "Height",
    wert: String(Math.round(klemm(zahl(hoehe, T), 0, 60))),
    einheit: "m",
    notiz: "Hub height of this turbine",
  }),
  zusatz: Hoehenring,
};
