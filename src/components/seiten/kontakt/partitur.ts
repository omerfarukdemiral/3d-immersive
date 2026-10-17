import {
  stellung,
  type HudKontext,
  type HudWert,
  type Kapiteldef,
  type Partitur,
} from "@/components/erlebnis/partitur";
import { uhrText } from "@/components/erlebnis/zeitachse";
import { anfrageStand } from "./stand";

/**
 * Partituren der Kontaktseiten — „Jetzt" · L0.
 *
 * Die Seiten messen keine Größe der Anlage, sondern die Gegenwart: Himmel
 * und HUD folgen der echten Uhrzeit in Musterstadt. Wer nachts schreibt,
 * sieht die Nachtszene mit Befeuerung. Sonst bewegt sich nichts von
 * selbst (L0) — ein Formular füllt man nicht über einer fahrenden Szene
 * aus. Die Kamera steht deshalb in einer einzigen Stellung.
 *
 * Eine Statuszeile „Werktag · erreichbar" sieht das Konzept vor, aber
 * erst, wenn die Öffnungszeiten feststehen. Bis dahin nur die Uhrzeit.
 */

/* Text links, Anlage rechts. Die Kapitelschiene steht rechts auf halber
   Höhe; ihre Beschriftung darf weder auf Nabe und Blättern noch auf dem
   Turm liegen. Darum steht die Nabe hoch im Bild (Zielpunkt unter der
   Nabe, siehe die Stellungen) — der Rotor endet über der Schiene — und
   der Turm links neben ihrer längsten Beschriftung. `versatz` legt den
   Turm auf (0,5 + versatz) der Fensterbreite; seite.module.css hält den
   Text links davon frei (--anlage-x).
   Hochformat: Text unten, die Anlage steht klein über dem Titel. */
const blick = { fov: 34, hoch: 0.2, weite: 1.6 };
/* /contact: „Direkt erreichbar" ist die längste Beschriftung der Schiene,
   der Turm rückt auf 76,5 % der Breite. Formulare: „Anfrage" und
   „Kontakt" sind kurz, 82 % genügen. */
const blickKontakt = { ...blick, versatz: 0.265 };
const blickFormular = { ...blick, versatz: 0.32 };

/* HUD: echte Uhrzeit. Die Zeichenkette ändert sich nur einmal je
   Minute — das Objekt wird darum nur dann neu gebaut. */
let jetztText = "";
let jetztWert: HudWert = { etikett: "Now", wert: "", notiz: "Musterstadt" };
const jetzt = (k: HudKontext): HudWert => {
  const t = uhrText(k.uhr);
  if (t !== jetztText) {
    jetztText = t;
    jetztWert = { etikett: "Now", wert: t, notiz: "Musterstadt" };
  }
  return jetztWert;
};

/* Formulare (4.14): Nach dem Absenden ist Schritt 1 von 3 erreicht —
   „Rückmeldung", wie in „Was danach passiert" neben dem Formular.
   Bewusste Abweichung von 4.14: Vor dem Absenden zeigt das HUD die
   Messgröße „Jetzt" (4.13 gilt für Kontakt und Formulare) statt eines
   gedimmten „Schritt 1/3" — ein Schritt, der noch nicht erreicht ist,
   sähe im HUD wie ein Stand aus. */
const gesendet: HudWert = { etikett: "Step", wert: "1/3", notiz: "Callback" };

/* ------------------------------------------------------------------ */
/* /contact                                                            */
/* ------------------------------------------------------------------ */

const kapitelKontakt: Kapiteldef[] = [
  { id: "jetzt", titel: "Reach us directly", marke: "Now" },
  { id: "anfrage", titel: "Inquiry" },
  { id: "abspann", titel: "Next" },
];

export const partiturKontakt: Partitur = {
  id: "/contact",
  name: "Contact",
  bewegung: "L0",
  kapitel: kapitelKontakt,
  himmel: { quelle: "echt" },
  /* Von Südosten, etwas unter Nabenhöhe: Tagsüber liegt die Anlage im
     Licht, und sie steht rechts neben Titel und Telefonnummer. */
  kamera: [stellung(0, [190, 30, 290], [0, 20, 0], blickKontakt)],
  spuren: { drehzahl: 0 },
  hud: (_T, k) => jetzt(k),
};

/* ------------------------------------------------------------------ */
/* /contact/sell-your-turbine, /contact/service-request               */
/* ------------------------------------------------------------------ */

const kapitelFormular: Kapiteldef[] = [
  { id: "anfrage", titel: "Inquiry", marke: "Now" },
  { id: "abspann", titel: "Contact" },
];

const formular = (
  id: string,
  name: string,
  pos: number[],
  ziel: number[],
): Partitur => ({
  id,
  name,
  bewegung: "L0",
  kapitel: kapitelFormular,
  himmel: { quelle: "echt" },
  kamera: [stellung(0, pos, ziel, blickFormular)],
  spuren: { drehzahl: 0 },
  hud: (_T, k) => (anfrageStand.gesendet ? gesendet : jetzt(k)),
});

/* Verkaufen: die Anlage ganz, von weiter weg — es geht um die ganze
   Anlage. Service: näher und von der Rotorseite, der Blick des
   Technikers. Der Zielpunkt liegt je nach Abstand so tief, dass die
   Nabe auf beiden Seiten gleich hoch im Bild steht (~31 % von oben). */
export const partiturVerkaufen = formular(
  "/contact/sell-your-turbine",
  "Sell your turbine",
  [210, 34, 320],
  [0, 16, 0],
);
export const partiturService = formular(
  "/contact/service-request",
  "Request service",
  [250, 38, 190],
  [0, 24, 0],
);
