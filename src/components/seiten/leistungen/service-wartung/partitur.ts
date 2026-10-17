import {
  stellung,
  type Partitur,
  type Punkt,
  type Stellung,
} from "@/components/erlebnis/partitur";
import { hoeheBei, kapitel, raster } from "./kapitel";
import Messband from "./Messband";

/**
 * Partitur von /services/maintenance — „Der Aufstieg" · L3.
 *
 * Service heißt: den Turm hinauf. Die Kamera steht am Fuß neben der Tür,
 * steigt dicht an der Turmwand nach oben und umrundet ihn dabei um eine
 * Vierteldrehung, damit der Turm als Wand neben dem Text steht und nicht
 * als Stab davor. Ab 15 m schaut sie leicht hinab — der Boden bleibt
 * sichtbar unten zurück. Oben tritt sie von der Gondel zurück und zeigt
 * den ganzen Weg. Das HUD zählt die Höhe mit (0 → 60 m), ein rotes
 * Messband am Turm zeichnet sie nach (Messband.tsx).
 *
 * Der Rotor steht während des Aufstiegs still und wird in Y-Stellung
 * arretiert — wie bei echten Arbeiten in der Gondel, und so kreuzt oben
 * kein Blatt den Text.
 */

const { tAus, index } = raster;

/**
 * Kameraort auf einem Kreis um die Turmachse. `winkel` in Grad von +z
 * (Süden) nach +x (Osten): positiv = vor dem Rotor, negativ = dahinter.
 * Tagsüber liegt die Südseite (z > 0) im Licht.
 */
const umKreis = (winkel: number, abstand: number, y: number) => {
  const w = (winkel * Math.PI) / 180;
  return [Math.sin(w) * abstand, y, Math.cos(w) * abstand];
};

/**
 * Blickpunkt auf Höhe `y`, aber um `seitlich` × Abstand links neben der
 * Turmachse (vom Kameraort aus gesehen). Warum: Im Hochformat ist
 * `versatz` aus und der Text liegt in voller Breite unten — ein Blick
 * genau auf die Achse stellt den Turm mitten hinter die Textblöcke.
 * Liegt der Blickpunkt neben dem Turm, steht er im Hochformat am
 * rechten Bildrand, wie eine Wand neben dem Text. Weil der seitliche
 * Abstand mit dem Kameraabstand wächst, rückt der Turm dadurch in jedem
 * Format um denselben Bildanteil nach rechts; im Querformat gleicht
 * `QUER` (versatz) das wieder aus.
 */
const neben = (winkel: number, abstand: number, y: number, seitlich = 0.3) => {
  const w = (winkel * Math.PI) / 180;
  const s = seitlich * abstand;
  return [-Math.cos(w) * s, y, Math.sin(w) * s];
};

/* Querformat: Die seitliche Verschiebung aus `neben` rückt den Turm
   schon gut ein Viertel der Breite nach rechts — `versatz` holt ihn so
   weit zurück, dass er wie zuvor rechts neben dem Text steht. */
const QUER = -0.06;

/* Hochformat: Text unten, Anlage oben und an den rechten Rand gerückt.
   Am Turm wird kaum zurückgezogen — sonst wäre die Turmwand nur noch
   ein Strich. */
const nahHoch = { hoch: 0.2, weite: 1.15 };

/** Stellung am Turm: Kamera auf dem Umkreis, Blick neben die Achse. */
const amTurm = (
  t: number,
  winkel: number,
  abstand: number,
  y: number,
  blickY: number,
  { seitlich = 0.3, ...optionen }: { seitlich?: number; hoch?: number } = {},
) =>
  stellung(
    t,
    umKreis(winkel, abstand, y),
    neben(winkel, abstand, blickY, seitlich),
    /* Mehr seitlich als der Grundwert 0,3 heißt im Querformat ebenso
       viel weiter nach rechts — `versatz` nimmt es wieder zurück. */
    { ...nahHoch, versatz: QUER - (seitlich - 0.3) * 0.9, ...optionen },
  );

const kamera: Punkt<Stellung>[] = [
  /* Turmfuß: Tür und Fundament im Bild, der Turm steigt nach rechts oben
     aus dem Bild — man ahnt, wie weit es hinaufgeht. Hier steht der
     Fuß im Hochformat noch über dem Text, der Blick bleibt auf der
     Achse. */
  stellung(tAus("fuss", 0), umKreis(40, 46, 2), [0, 13, 0], {
    versatz: 0.2,
    ...nahHoch,
  }),
  stellung(tAus("fuss", 0.45), umKreis(36, 40, 2.4), [0, 13, 0], {
    versatz: 0.2,
    ...nahHoch,
  }),
  /* Ab 15 m steht die Kamera etwas über der erreichten Höhe und schaut
     leicht hinab: Der Ring des Messbands liegt im Bild, darunter fällt
     der Turm zum Boden ab — so liest man die Höhe, statt sie nur zu
     zählen. Dicht an der Wand, eine Vierteldrehung um den Turm. */
  amTurm(tAus("fuss", 1), 14, 27, 21, 13, { seitlich: 0.33 }),
  /* 40 m: hinter der Rotorebene. Blick höher und Kamera weiter zurück
     als an der Turmwand, damit die Gondel beim Weiterfahren unter der
     Kopfleiste ins Bild kommt statt hinter ihr. */
  amTurm(tAus("turm", 1), -22, 38, 47, 45),
  /* 60 m: über der Gondel, schräg von hinten — der Ring liegt am
     Turmkopf direkt unter ihr. Flacher zur Rotorebene als zuvor und
     weiter zurück: Die Blätter der arretierten Y-Stellung spreizen sich
     so weniger zur Seite und erreichen weder den Titel links noch die
     Kapitelschiene rechts. */
  amTurm(tAus("gondel", 0.62), -16, 44, 68, 55),
  /* Oben angekommen: Die Kamera tritt von der Gondel zurück und steigt
     noch etwas höher. Unter ihr fällt der Turm 60 m tief zum Boden ab,
     das Messband reicht vom Fuß bis unter die Gondel — der ganze Weg
     auf einen Blick. */
  amTurm(tAus("gondel", 0.72), -12, 54, 80, 50),
  amTurm(tAus("gondel", 1), -8, 60, 84, 48),
  /* Datenblatt: zurück auf Abstand, die Szene hält still. */
  stellung(index("daten"), [190, 70, 210], [0, 45, 0], { versatz: 0.2 }),
  /* Abspann: weit zurück, die ganze Anlage im Vormittagslicht. */
  stellung(index("abspann"), [520, 120, 560], [0, 50, 0], {
    versatz: 0.12,
    hoch: 0.24,
  }),
];

export const partitur: Partitur = {
  id: "/services/maintenance",
  name: "Maintenance",
  bewegung: "L3",
  kapitel,
  /* Vormittag: Servicearbeit im Hellen, Sonne im Südosten. */
  himmel: { quelle: "fest", uhr: 10.5 },
  kamera,
  spuren: {
    /* Am Fuß dreht der Rotor noch; bevor es hinaufgeht, steht er. */
    drehzahl: [
      [tAus("fuss", 0.45), 8],
      [tAus("fuss", 0.9), 0],
      [index("daten") + 0.3, 0],
      [index("abspann"), 9],
    ],
    parken: [
      [tAus("fuss", 0.9), 0],
      [tAus("turm", 0.5), 1],
      [index("daten") + 0.3, 1],
      [index("abspann"), 0],
    ],
  },
  hud: (T) => ({
    etikett: "Height",
    wert: String(Math.round(hoeheBei(T))),
    einheit: "m",
    notiz: "Hub height of this turbine",
  }),
  zusatz: Messband,
};
