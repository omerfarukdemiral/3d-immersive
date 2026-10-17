"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import { beitragsPartituren } from "@/components/seiten/wissen/partitur";

/**
 * Meldet die Partitur des Beitrags `slug` an. Die Partituren liegen
 * einmal gebaut auf Modulebene (partitur.ts) — neu gebaut bei jedem
 * Rendern, sähe die Bühne bei jedem Rendern eine neue Seite.
 */
export default function Buehne({ slug }: { slug: string }) {
  const partitur = beitragsPartituren.get(slug);
  return partitur ? <Anmeldung partitur={partitur} /> : null;
}
