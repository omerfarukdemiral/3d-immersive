"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import { partitur } from "./partitur";

/** Meldet die Partitur dieser Seite an der Bühne an. */
export default function Buehne() {
  return <Anmeldung partitur={partitur} />;
}
