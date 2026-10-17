"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import {
  datenschutzPartitur,
  fehlerPartitur,
  impressumPartitur,
} from "./partitur";

/* Feste Objekte auf Modulebene: Die Bühne erkennt einen Seitenwechsel
   an der Identität der Partitur, sie darf nicht pro Rendern neu entstehen. */
const partituren = {
  impressum: impressumPartitur,
  datenschutz: datenschutzPartitur,
  fehler: fehlerPartitur,
} as const;

/** Meldet die Partitur einer Rechtsseite (oder der 404) an der Bühne an. */
export default function Buehne({ seite }: { seite: keyof typeof partituren }) {
  return <Anmeldung partitur={partituren[seite]} />;
}
