"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import { partiturKontakt } from "@/components/seiten/kontakt/partitur";

/** Meldet die Partitur dieser Seite an der Bühne an. */
export default function Buehne() {
  return <Anmeldung partitur={partiturKontakt} />;
}
