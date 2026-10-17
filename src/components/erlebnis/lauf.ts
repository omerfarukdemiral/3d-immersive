import type Lenis from "lenis";
import { grundzustand, type Partitur, type Szenenzustand } from "./partitur";

/**
 * Gemeinsamer Zustand zwischen Scrollschleife und 3D-Szene.
 *
 * Absichtlich ein schlichtes, veränderliches Objekt und kein React-State:
 * Beide Seiten lesen und schreiben ihn sechzigmal pro Sekunde, und jeder
 * Rerender in dieser Frequenz wäre reine Verschwendung.
 *
 * Seiten-Zusätze (Partitur.zusatz) dürfen hier lesen, aber nur `anker`
 * beschreiben.
 */
export const lauf = {
  /** Erzählzeit der aktuellen Seite, siehe partitur.ts */
  T: 0,
  /** Erzählzeit, nach der die Szene spielt (bei L0/L1 fest 0). */
  szeneT: 0,
  /** Uhrzeit in Stunden (geglättet über den Seitenwechsel) */
  uhr: 6.42,
  /**
   * Uhrzeit nur für den Sonnenstand: steht, solange eine Bühne fest
   * steht, und läuft nur im Übergang zwischen zwei Kapiteln. Dreht sich
   * die Sonne beim Lesen mit, kriechen alle Schattenkanten durch die
   * Schattenkarte — das flimmert.
   */
  sonnenUhr: 6.42,
  /** Aktuelle Rotordrehzahl, schreibt die Szene */
  upm: 0,
  /** Bewegung reduziert (prefers-reduced-motion) */
  ruhig: false,
  /**
   * Weiches Scrollen (Lenis). Ohne eigenen rAF: Die Schleife in
   * Erlebnis.tsx treibt es zu Beginn jedes Bilds an und liest danach
   * scrollY — Text, Bühne und Szene sehen so im selben Bild dieselbe
   * Scrolllage. null bei reduzierter Bewegung.
   */
  lenis: null as Lenis | null,
  /** Zuletzt angemeldete Partitur — bleibt beim Seitenwechsel stehen, bis die neue da ist. */
  partitur: null as Partitur | null,
  /** Szenenzustand dieses Bilds, aus den Spuren der Partitur (Erlebnis.tsx). */
  szene: { ...grundzustand } as Szenenzustand,
  /**
   * Seitenwechsel: 0 im ersten Bild der neuen Seite, 1 nach etwa einer
   * Sekunde. Kamera, Uhr und Szenenzustand blenden in dieser Zeit von der
   * alten Stellung zur neuen — unabhängig vom Scroll.
   */
  wechsel: 1,
  /** Bildschirmposition der Bauteile (CSS-Pixel), schreibt die Szene */
  anker: {} as Record<string, { x: number; y: number; da: boolean }>,
};

/* ------------------------------------------------------------------ */
/* Anmeldung der Seite                                                 */
/* ------------------------------------------------------------------ */

/* Die aktuelle Partitur als kleiner Store: React-Teile der Bühne
   (Kapitelschiene, HUD-Gerüst, Zusatz im Canvas) rendern neu, wenn eine
   andere Seite sich anmeldet — sonst nie. Abgemeldet wird nicht: Beim
   Wechsel zwischen zwei Erlebnis-Seiten löst die neue die alte ab, und wer die
   Erlebnis-Seiten verlässt, verlässt auch das Layout samt Bühne. */
let aktuell: Partitur | null = null;
const hoerer = new Set<() => void>();

export const buehne = {
  setzen(p: Partitur) {
    if (aktuell === p) return;
    aktuell = p;
    lauf.partitur = p;
    hoerer.forEach((f) => f());
  },
  lesen: () => aktuell,
  leer: () => null,
  abonnieren(f: () => void) {
    hoerer.add(f);
    return () => {
      hoerer.delete(f);
    };
  },
};
