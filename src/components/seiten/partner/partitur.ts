import {
  stellung,
  type HudWert,
  type Partitur,
  type Punkt,
} from "@/components/erlebnis/partitur";
import {
  DATENRAUM,
  MODELL_TAKTE,
  REPOWERING,
  jahrBei,
  kapitel,
  raster,
} from "./zeit";
import Zeitband from "./Zeitband";

/**
 * Partitur von /company/partners-investors — „Die Laufzeit" · L2.
 *
 * Die Seite misst das Leben einer Anlage auf einer Achse: 20 Jahre
 * EEG-Vergütung, Weiterbetrieb bis 30, dann Repowering und eine neue
 * Laufzeit am selben Standort. Am Boden liegt dazu ein Zeitband
 * (Zeitband.tsx), das sich Jahr um Jahr rot füllt; das HUD zählt mit.
 * Beim Repowering steht der alte Rotor still, die Anlage wächst in die
 * 120-m-Klasse, das Band leert sich und das HUD springt auf Jahr 0.
 *
 * Danach der Datenraum: Die Szene tritt zurück, die sechs Mappen liegen
 * versiegelt im Text — beschrieben, nicht beziffert.
 */

const { tAus, index } = raster;

/**
 * Kameraort auf einem Kreis um die Turmachse. `winkel` in Grad von +z
 * (Süden) nach +x (Osten): positiv = vor dem Rotor. Tagsüber liegt die
 * Südseite (z > 0) im Licht.
 */
const umKreis = (winkel: number, abstand: number, y: number) => {
  const w = (winkel * Math.PI) / 180;
  return [Math.sin(w) * abstand, y, Math.cos(w) * abstand];
};

/* Text links → Anlage rechts. Im Hochformat steht der Text unten; die
   Anlage rückt nach oben und etwas weiter weg. */
const links = { fov: 34, versatz: 0.2, hoch: 0.26, weite: 1.25 };
/* Zeitband: Im Hochformat läuft es sonst seitlich aus dem schmalen
   Bild. Die Kamera schwenkt dort um die Turmachse, bis das Band schräg
   auf sie zu läuft, in die Bildmitte unter der Anlage. */
const band = { ...links, dreh: -38 };
/* 120-m-Klasse: Im Hochformat etwas weiter zurück und tiefer gesetzt,
   damit Umriss und Blattspitze der größeren Anlage unter der Kopfleiste
   bleiben — der Boden darunter ist ohnehin leer. */
const gross = { ...links, weite: 1.12, hoch: 0.08 };
/* Datenraum: Text rechts, Anlage links. Weit genug nach links, dass der
   Rotor auch bei 1280 px Breite vor der ersten Mappenspalte endet. */
const rechts = { fov: 34, versatz: -0.37, hoch: 0.26, weite: 1.25 };

const { repowering } = MODELL_TAKTE;

export const partitur: Partitur = {
  id: "/company/partners-investors",
  name: "Partners & investors",
  bewegung: "L2",
  kapitel,
  /* Klarer Vormittag, der langsam in den Nachmittag geht: Die Anlage
     soll weiß und sauber stehen, kein Dämmerlicht. Die Uhrzeit ist hier
     keine Messgröße, nur Licht. */
  himmel: {
    quelle: "spur",
    uhr: [
      [0, 10.5],
      [index("abspann"), 15],
    ],
  },
  /* Vier Stationen: Anlage im Profil (Jahr 0) → von oben aufs Zeitband
     (Laufzeit) → zurück, damit die 120-m-Klasse ins Bild passt
     (Repowering) → die andere Seite für den Datenraum. Datenblatt und
     Abspann ziehen sich nur noch zurück. */
  kamera: [
    stellung(0, umKreis(30, 190, 14), [0, 44, 0], links),
    stellung(tAus("auftakt", 1), umKreis(28, 180, 20), [0, 42, 0], links),
    stellung(tAus("modell", 0.08), umKreis(22, 235, 62), [-8, 32, 14], band),
    stellung(tAus("modell", repowering[0] - 0.04), umKreis(16, 225, 64), [-8, 32, 14], band),
    /* Der Rückzug ist fertig, wenn der Umriss der 120-m-Klasse ganz steht
       (geist 0.74 → 0.8): erst Platz schaffen, dann wachsen. */
    stellung(tAus("modell", repowering[0] + 0.06), umKreis(14, 350, 36), [0, 84, 0], gross),
    stellung(tAus("modell", 1), umKreis(10, 360, 40), [0, 86, 0], gross),
    stellung(tAus("datenraum", 0), umKreis(-34, 400, 42), [0, 84, 0], rechts),
    stellung(tAus("datenraum", 1), umKreis(-40, 410, 48), [0, 86, 0], rechts),
    stellung(index("daten"), [60, 110, 420], [0, 70, 0], { ...links, versatz: 0.14 }),
    /* Abspann: Die Kamera steht westlich außerhalb der Flotte und
       blickt nach Norden. Die Flotte (Radius bis 1500 m um den Turm)
       liegt damit ganz in der rechten Bildhälfte, links unter Titel und
       Knöpfen bleibt freies Feld. Von Süden her liegt sie im
       Nachmittagslicht. */
    stellung(index("abspann"), [-2000, 200, 900], [-1400, 40, -900], {
      fov: 34,
      versatz: 0,
      hoch: 0.3,
      weite: 1,
    }),
  ],
  spuren: {
    /* Die Anlage läuft ihre Laufzeit durch. Am Ende von Jahr 30 steht der
       alte Rotor still; nach dem Repowering dreht die größere Anlage
       langsamer wieder an. */
    drehzahl: [
      [tAus("modell", 0.7), 9],
      [tAus("modell", 0.78), 0],
      [tAus("modell", 0.92), 0],
      [tAus("modell", 1), 7],
    ],
    /* Repowering wie auf der Startseite: erst der Umriss der neuen
       Klasse, dann wächst die Anlage hinein. */
    geist: [
      [tAus("modell", 0.74), 0],
      [tAus("modell", 0.8), 1],
      [tAus("modell", 0.92), 1],
      [tAus("modell", 0.98), 0],
    ],
    massstab: [
      [tAus("modell", 0.8), 1],
      [tAus("modell", 0.92), 2],
    ],
    /* Abspann: weit zurück, die Flotte steht im Nachmittagslicht. */
    flotte: [
      [index("abspann") - 0.35, 0],
      [index("abspann") - 0.02, 1],
    ] satisfies Punkt<number>[],
  },
  hud: (T) => {
    if (T >= DATENRAUM) return hudDatenraum;
    if (T >= REPOWERING) return hudRepowering;
    return hudJahr[Math.round(jahrBei(T))];
  },
  zusatz: Zeitband,
};

/* HUD-Werte einmal gebaut: Der Formatierer läuft in jedem Bild. Das
   Betriebsjahr ist eine Illustration (Laufzeit einer Beispielanlage),
   die Phase steht als Notiz daneben. */
const hudJahr: HudWert[] = Array.from({ length: 31 }, (_, j) => ({
  etikett: "Operating year",
  wert: String(j),
  /* Jahr 20 gehört noch zur Vergütung („Bestand halten"); der
     Weiterbetrieb beginnt danach. */
  notiz: j <= 20 ? "EEG tariff" : "Continued operation",
}));
const hudRepowering: HudWert = {
  etikett: "Operating year",
  wert: "0",
  notiz: "Repowering",
};
const hudDatenraum: HudWert = { etikett: "Data room", wert: "Under NDA" };
