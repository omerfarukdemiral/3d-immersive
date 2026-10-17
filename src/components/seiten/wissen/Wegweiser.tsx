"use client";

import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";
import { Differenz } from "./Differenz";
import { Flaeche } from "./Flaeche";
import { beitragEnde, beitragT } from "./takte";
import { Wegegabel } from "./Wegegabel";

/**
 * Zusatz von /insights: Jeder der drei Beiträge zeigt im Vorbeigehen das
 * Bild, in dem sein eigener Beitrag dann stehen bleibt — die Gabel der
 * vier Wege (Post-EEG), die markierte Differenz (Repowering), die Kontur der
 * wiederhergestellten Fläche um das Fundament (Rückbau; die Anlage selbst
 * tritt dort über die Spur `anlage` zurück).
 */

/** Sichtbarkeit im Takt von Beitrag `i`: blendet kurz vor ihm ein, mit ihm aus. */
function fenster(i: number) {
  const T = lauf.szeneT;
  const ein = klemm((T - (beitragT(i) - 0.04)) / 0.06);
  const aus = klemm((T - (beitragEnde(i) - 0.02)) / 0.05);
  return ein * (1 - aus) * lauf.wechsel;
}

const postEeg = () => fenster(0);
const repowering = () => fenster(1);
const rueckbau = () => fenster(2);

export default function Wegweiser() {
  return (
    <>
      <Wegegabel sicht={postEeg} />
      <Differenz sicht={repowering} />
      <Flaeche sicht={rueckbau} />
    </>
  );
}
