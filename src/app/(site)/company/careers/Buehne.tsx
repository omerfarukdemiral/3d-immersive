"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import { partitur } from "@/components/seiten/karriere/partitur";

/** Meldet die Partitur dieser Seite an der Bühne an. */
export default function Buehne() {
  return <Anmeldung partitur={partitur} />;
}
