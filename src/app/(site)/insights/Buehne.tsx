"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import { wissenPartitur } from "@/components/seiten/wissen/partitur";

/** Meldet die Partitur von /insights an der Bühne an. */
export default function Buehne() {
  return <Anmeldung partitur={wissenPartitur} />;
}
