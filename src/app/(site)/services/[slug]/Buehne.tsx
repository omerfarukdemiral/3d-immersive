"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import type { Partitur } from "@/components/erlebnis/partitur";
import { partitur as ankauf } from "@/components/seiten/leistungen/anlagenankauf";
import { partitur as monitoring } from "@/components/seiten/leistungen/monitoring";
import { partitur as planung } from "@/components/seiten/leistungen/planung-repowering";
import { partitur as service } from "@/components/seiten/leistungen/service-wartung";

/* Eine Partitur je Leistung, einmal auf Modulebene: Die Bühne erkennt
   einen Seitenwechsel an der Identität des Objekts — neu gebaut bei
   jedem Rendern, sähe sie bei jedem Rendern eine neue Seite. */
const partituren = new Map<string, Partitur>([
  ["acquisition", ankauf],
  ["maintenance", service],
  ["monitoring", monitoring],
  ["planning-repowering", planung],
]);

/** Meldet die Partitur der Leistung `slug` an der Bühne an. */
export default function Buehne({ slug }: { slug: string }) {
  const partitur = partituren.get(slug);
  return partitur ? <Anmeldung partitur={partitur} /> : null;
}
