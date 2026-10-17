import { kennzahlen } from "@/content/site";
import {
  stellung,
  type HudWert,
  type Partitur,
} from "@/components/erlebnis/partitur";
import { klemm } from "@/components/erlebnis/zeitachse";
import Einsatzkarte from "./Einsatzkarte";
import { ausgangslagen } from "./inhalt";
import {
  index,
  kapitel,
  tAus,
  takteDeutschland,
  takteLagen,
} from "./raster";

/**
 * Referenzen — „Deutschlandweit" (L3).
 *
 * Die Kamera verlässt die Anlage und steigt so hoch, dass ganz
 * Deutschland als Linienkarte am Boden liegt; Musterstadt liegt unter dem
 * Turm. Während der Kennzahlen färbt sich die Fläche von dort aus rot,
 * beim Einsatz laufen Ringe und zwei Linien über das Land. Für die vier
 * Ausgangslagen kehrt sie zur einen Anlage zurück — dort geht es um eine
 * Anlage, nicht um ein Land. Zum Schluss steht sie noch einmal über der
 * ganzen Karte.
 *
 * Messgröße im HUD: die Kennzahl, die gerade im Bild steht, mit
 * „Deutschland" davor — ohne Summe, weil sich die Bereiche überschneiden.
 */

/* Mitte der Karte in Weltkoordinaten (Musterstadt = Ursprung). */
const MITTE = [1005, 0, 650];

/* Querformat: Die Karte gehört in den Streifen zwischen Text-Spalte und
   Kapitelschiene — bei 1280 px Breite gut 340 px, bei 1440 gut 430. Darum
   ein weiterer Bildwinkel (48° statt 36°, das Land wird gut ein Viertel
   kleiner) und deutlich nach rechts geschoben. Der weitere Winkel statt
   einer höheren Kamera, weil der Nebel sonst den Norden verschluckte.
   Im Hochformat gleichen `weite` und `hoch` den Winkel aus: Dort soll
   das Land so groß und so tief stehen wie mit 36°. */
const VERSATZ = 0.18;

/* Aufsicht über die Karte: hoch genug für das ganze Land, schräg genug,
   dass die Anlage im Ursprung noch als Strich steht. Im Hochformat zieht
   die Bühne die Kamera ohnehin um gut das 1,6-Fache zurück — `weite`
   unter 1 hält sie diesseits des Nebels, sonst versänke der Norden
   darin; `hoch` klein, damit die Küste nicht unter der Kopfleiste liegt. */
const aufsicht = (t: number, pos: number[], versatz = VERSATZ) =>
  stellung(t, pos, MITTE, { versatz, hoch: 0.05, weite: 0.82, fov: 48 });

const zahlStart = takteDeutschland.zahlen.map(([a]) => tAus("deutschland", a));
/* Zähler läuft im ersten Fünftel eines Kennzahl-Takts hoch. */
const ZAEHLEN = (tAus("deutschland", 0.5) - tAus("deutschland", 0.35)) * 0.25;
const lagenStart = takteLagen.titel.map((a) => tAus("lagen", a));

/* Vorbelegte HUD-Werte: Der Formatierer läuft in jedem Bild und soll
   dabei keine Objekte bauen, die nicht nötig sind. */
const gebiet: HudWert = {
  etikett: "Service area",
  wert: "Germany",
  notiz: "From Musterstadt",
};
const zahlWert: HudWert = { etikett: "Germany", wert: "0" };
const lageWert: HudWert = { etikett: "Scenario", wert: "1/4" };

export const partitur: Partitur = {
  id: "/references",
  name: "References",
  bewegung: "L3",
  kapitel,
  himmel: {
    quelle: "spur",
    uhr: [
      [0, 10.5],
      [index("einsatz"), 12.5],
      [index("lagen"), 14.5],
      [index("abspann"), 16.5],
    ],
  },
  kamera: [
    /* 01 Auftakt: an der Anlage, die Karte zieht am Boden auf. */
    stellung(tAus("deutschland", 0), [150, 30, 190], [0, 46, 0], {
      versatz: 0.2,
      hoch: 0.16,
    }),
    stellung(tAus("deutschland", 0.08), [170, 60, 230], [0, 46, 0], {
      versatz: 0.2,
      hoch: 0.16,
    }),
    /* Aufstieg über Deutschland, dann Halt über den Kennzahlen. */
    aufsicht(tAus("deutschland", 0.24), [480, 6900, 5000]),
    aufsicht(tAus("deutschland", 1), [720, 7200, 4700]),
    /* 02 Einsatz: von Südosten, etwas näher. Nicht steiler — aus der
       Senkrechten flimmern die Kartenlinien gegen den Boden. */
    aufsicht(tAus("einsatz", 0.06), [1500, 6400, 4600]),
    aufsicht(tAus("einsatz", 1), [1650, 6300, 4700]),
    /* 03 Ausgangslagen: zurück an die eine Anlage, Text rechts. Leicht
       von oben, damit der Horizont über dem Text liegt und die Karte als
       ruhiger Grund dahinter. */
    stellung(tAus("lagen", 0.06), [-170, 120, 160], [0, 40, 0], {
      versatz: -0.2,
      hoch: 0.2,
    }),
    stellung(tAus("lagen", 1), [-215, 132, 95], [0, 42, 0], {
      versatz: -0.2,
      hoch: 0.2,
    }),
    /* Datenblatt: ruhiger Blick aus der Ferne. */
    stellung(index("daten") + 0.15, [380, 160, 620], [0, 60, 0], {
      versatz: 0.12,
    }),
    /* Abspann: noch einmal das ganze Land. */
    aufsicht(index("abspann") + 0.2, [900, 8200, 5600]),
  ],
  /* Weiter Nebel, sonst verschwindet die Karte (gut 3 × 4,5 km) im Dunst. */
  nebel: [5000, 21000],
  spuren: {
    /* An der Anlage tritt die Karte ganz zurück: Aus Bodennähe wären
       ihre Grenzen nur lose graue Striche quer über das Raster, ohne
       das Land, zu dem sie gehören. */
    /* Im Aufstieg tritt sie kurz zurück: Auf halbem Weg füllte sie das
       ganze Bild und liefe unter Kopfleiste und Kapitelschiene durch.
       Sie zieht erst wieder auf, wenn das Land in seinem Rahmen liegt. */
    karte: [
      [0, 0.5],
      [tAus("deutschland", 0.08), 0.5],
      [tAus("deutschland", 0.13), 0.12],
      [tAus("deutschland", 0.22), 1],
      [tAus("einsatz", 0.97), 1],
      [tAus("lagen", 0.05), 0],
      [index("abspann"), 0],
      [index("abspann") + 0.15, 1],
    ],
    raster: [
      [0, 1],
      [tAus("deutschland", 0.15), 0.08],
      [tAus("einsatz", 0.97), 0.08],
      [tAus("lagen", 0.06), 0.7],
      [index("daten") + 0.2, 0.7],
      [index("abspann"), 0.08],
    ],
  },
  hud: (T) => {
    /* Kennzahlen: die gerade sichtbare Zahl, mit Zähler beim Eintritt. */
    if (T >= zahlStart[0] && T < index("einsatz")) {
      let i = 0;
      while (i < 3 && T >= zahlStart[i + 1]) i++;
      const z = kennzahlen[i];
      zahlWert.wert = String(
        Math.round(z.value * klemm((T - zahlStart[i]) / ZAEHLEN)),
      );
      zahlWert.notiz = z.label;
      return zahlWert;
    }
    /* Ausgangslagen: welche der vier gerade steht. */
    if (T >= lagenStart[0] && T < index("daten")) {
      let i = 0;
      while (i < 3 && T >= lagenStart[i + 1]) i++;
      lageWert.wert = `${i + 1}/4`;
      lageWert.notiz = ausgangslagen[i].titel;
      return lageWert;
    }
    return gebiet;
  },
  zusatz: Einsatzkarte,
};
