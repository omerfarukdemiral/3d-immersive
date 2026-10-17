"use client";

import { useLayoutEffect } from "react";
import { buehne } from "../lauf";
import type { Partitur } from "../partitur";

/**
 * Meldet die Partitur einer Seite an der gemeinsamen Bühne an.
 *
 * Muss in einer Client-Datei der Seite stehen, weil eine Partitur
 * Funktionen (HUD-Formatierer) und Komponenten (Zusatz) enthalten darf —
 * die lassen sich nicht vom Server zum Client reichen. Muster:
 *
 *   // src/app/(site)/beispiel/Buehne.tsx
 *   "use client";
 *   import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
 *   import { partitur } from "./partitur";
 *   export default function Buehne() {
 *     return <Anmeldung partitur={partitur} />;
 *   }
 *
 * Layout-Effekt statt Effekt: Die Bühne soll die neue Partitur haben,
 * bevor das erste Bild der neuen Seite gemalt wird.
 */
export default function Anmeldung({ partitur }: { partitur: Partitur }) {
  useLayoutEffect(() => {
    buehne.setzen(partitur);
  }, [partitur]);
  return null;
}
