"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import { partitur } from "./partitur";

/** Meldet die Partitur der Startseite an der Bühne an (siehe Anmeldung.tsx). */
export default function Buehne() {
  return <Anmeldung partitur={partitur} />;
}
