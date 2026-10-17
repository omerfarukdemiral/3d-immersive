import Link from "next/link";
import { Abspann } from "@/components/erlebnis/bausteine";
import { rundgang } from "@/components/erlebnis/rundgang";
import { company } from "@/content/site";
import { Absatz, Kopf, Lesen, Text, kapitelNr } from "./Blatt";
import Buehne from "./Buehne";
import Sprung from "./Sprung";
import { datenschutzPartitur as partitur } from "./partitur";
import s from "./recht.module.css";
import {
  datenschutzAbschnitte,
  datenschutzLead,
  nichtEingesetzt,
  nichtEinleitung,
  nichtSchluss,
  nichtTitel,
  schlussLead,
  schlussTitel,
} from "./texte";

/**
 * Datenschutzerklärung — L0 auf Papier.
 *
 * Statt eines festen Inhaltsverzeichnisses ist jeder Abschnitt ein
 * Kapitel: Auf breiten Fenstern führt die
 * Kapitelschiene rechts durch die Abschnitte, das HUD zählt sie mit.
 * Das Verzeichnis im Kopf bleibt trotzdem — mobil gibt es keine Schiene.
 */
export default function Datenschutz() {
  const letzter = datenschutzAbschnitte.length - 1;
  return (
    <>
      <Buehne seite="datenschutz" />
      <Lesen partitur={partitur}>
        <Kopf
          partitur={partitur}
          id="inhalt"
          titel="Privacy Policy"
          lead={datenschutzLead}
        >
          <nav aria-label="Contents" className={s.anhang}>
            <p className="e-etikett">Contents</p>
            <ol className={s.verzeichnis}>
              {datenschutzAbschnitte.map((a) => (
                <li key={a.id}>
                  <Sprung ziel={a.id}>
                    <span
                      className={`e-etikett tnum ${s.nr}`}
                      aria-hidden="true"
                    >
                      {kapitelNr(partitur, a.id)}
                    </span>
                    <span>{a.h}</span>
                  </Sprung>
                </li>
              ))}
            </ol>
          </nav>
        </Kopf>

        {datenschutzAbschnitte.map((a, i) => (
          <Absatz key={a.id} partitur={partitur} id={a.id} titel={a.h}>
            {a.inhalt.map((p) => (
              <Text key={p.slice(0, 40)}>{p}</Text>
            ))}
            {/* Der Schlusssatz der alten Seite stand unter dem letzten
              Abschnitt — er bleibt dort. */}
            {i === letzter ? (
              <p className={`e-text ${s.text} ${s.nachsatz}`}>
                For privacy questions, write to{" "}
                <a href={company.email.href}>{company.email.display}</a>. You
                can find our company details in the{" "}
                <Link href="/imprint">imprint</Link>.
              </p>
            ) : null}
          </Absatz>
        ))}

        <Absatz partitur={partitur} id="nicht-eingesetzt" titel={nichtTitel}>
          <Text>{nichtEinleitung}</Text>
          <ul className="e-liste">
            {nichtEingesetzt.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <Text>{nichtSchluss}</Text>
        </Absatz>

        <Abspann
          partitur={partitur}
          pfad="/privacy"
          weiter={rundgang[0]}
          titel={schlussTitel}
          lead={schlussLead}
        />
      </Lesen>
    </>
  );
}
