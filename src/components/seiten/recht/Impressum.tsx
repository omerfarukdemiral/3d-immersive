import { Abspann, Tabelle } from "@/components/erlebnis/bausteine";
import { rundgang } from "@/components/erlebnis/rundgang";
import { Absatz, Kopf, Lesen, Text } from "./Blatt";
import Buehne from "./Buehne";
import { impressumPartitur as partitur } from "./partitur";
import {
  impressumAbschnitte,
  impressumDaten,
  impressumLead,
  schlussLead,
  schlussTitel,
} from "./texte";
import s from "./recht.module.css";

/**
 * Impressum — L0 auf Papier. Die Angaben
 * stehen als Schlüssel-Wert-Tabelle, die drei Haftungsabschnitte darunter.
 * Text aus texte.ts.
 *
 * Abspann: Titel wie auf der Startseite (texte.ts). Die Tür führt zurück
 * an den Anfang des Rundgangs — das Impressum liegt nicht in ihm.
 */
export default function Impressum() {
  return (
    <>
      <Buehne seite="impressum" />
      <Lesen partitur={partitur}>
        <Kopf
          partitur={partitur}
          id="angaben"
          titel="Imprint"
          lead={impressumLead}
        >
          <div className={s.anhang}>
            <Tabelle
              zeilen={impressumDaten.map((d) => ({
                schluessel: d.k,
                wert: d.v,
              }))}
            />
          </div>
        </Kopf>

        {impressumAbschnitte.map((a) => (
          <Absatz key={a.id} partitur={partitur} id={a.id} titel={a.h}>
            {a.p.map((p) => (
              <Text key={p.slice(0, 40)}>{p}</Text>
            ))}
          </Absatz>
        ))}

        <Abspann
          partitur={partitur}
          pfad="/imprint"
          weiter={rundgang[0]}
          titel={schlussTitel}
          lead={schlussLead}
        />
      </Lesen>
    </>
  );
}
