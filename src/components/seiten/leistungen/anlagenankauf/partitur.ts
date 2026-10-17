import { stellung, type Partitur } from "@/components/erlebnis/partitur";
import Lasten from "./Lasten";
import { ablauf, index, kapitel, schrittBei, tAus } from "./takte";

/**
 * Partitur „Fünf Schritte" · L3.
 *
 * Die Seite misst den Ablauf eines Verkaufs: Schritt 1/5 bis 5/5, daneben
 * die Dauer des Schritts aus `ablauf[].dauer`. Eine Gesamtdauer zeigt sie
 * bewusst nicht — die Summe der Spannen läse sich wie eine Zusage, die
 * Seite nennt sie aber „Richtwerte zur Orientierung".
 *
 * An der Anlage hängen die Lasten des Betreibers (`uebergaben`) als
 * Etiketten auf der Seite „Sie". In dem Schritt, in dem sie übergehen
 * (Vertrag, Übernahme), wechseln sie in Signalfarbe auf die Seite „Wir".
 * Im letzten Bild hängt nichts mehr an der Anlage.
 */

/* Text steht links, die Anlage rechts daneben: positiver versatz. Die
   Kamera sieht die Anlage von Süden (+z), fast von der Seite — so liegt
   der Rotor schmal im Bild und lässt links und rechts vom Turm Platz für
   die Etiketten. Die Sonne steht vormittags im Südosten, die Seite der
   Anlage zur Kamera ist hell. In den Schritten steht die Anlage näher
   zur Mitte: Rechts brauchen die „Wir"-Schilder Platz vor der
   Kapitelschiene (wird es trotzdem eng, rücken sie in Lasten.tsx näher
   an den Turm). Die Kamera steht dort so weit zurück, dass die obere
   Rotorspitze unter der Kopfleiste bleibt. */
const breit = { versatz: 0.2, hoch: 0.2, weite: 1.15 };
const nah = { versatz: 0.13, hoch: 0.24, weite: 1.25 };

export const partitur: Partitur = {
  id: "/services/acquisition",
  name: "Acquisition",
  bewegung: "L3",
  kapitel,
  /* Vom Vormittag in den Nachmittag: Die Schritte dauern Wochen, nicht
     Stunden — der Himmel zeigt nur, dass Zeit vergeht, und das HUD misst
     Schritte statt Uhrzeit. */
  himmel: {
    quelle: "spur",
    uhr: [
      [0, 9.5],
      [index("schritte"), 10.5],
      [index("abgabe"), 15],
      [index("abspann"), 16.5],
    ],
  },
  kamera: [
    // Auftakt: die ganze Anlage, ruhig, leicht von unten
    stellung(tAus("ankauf", 0), [150, 16, 230], [0, 46, 0], breit),
    stellung(tAus("ankauf", 1), [120, 20, 196], [0, 44, 0], breit),
    // Schritte: näher, der Turm füllt die Höhe — Platz für die Etiketten
    stellung(tAus("schritte", 0), [56, 34, 186], [0, 38, 0], nah),
    stellung(tAus("schritte", 1), [33, 38, 186], [0, 38, 0], nah),
    // Abgabe: zurück auf Abstand, die Anlage steht frei
    stellung(tAus("abgabe", 0), [190, 34, 260], [0, 46, 0], breit),
    stellung(tAus("abgabe", 1), [220, 40, 300], [0, 48, 0], breit),
    stellung(index("daten"), [240, 60, 260], [0, 45, 0], breit),
    stellung(index("abspann"), [520, 120, 560], [0, 50, 0], {
      versatz: 0.12,
      hoch: 0.24,
    }),
  ],
  hud: (T) => {
    const s = schrittBei(T);
    return {
      etikett: "Step",
      wert: `${s + 1}/${ablauf.length}`,
      notiz: `${ablauf[s].dauer} · Estimates for orientation`,
    };
  },
  zusatz: Lasten,
};
