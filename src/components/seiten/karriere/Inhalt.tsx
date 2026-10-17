import {
  Abschnitt,
  Abspann,
  Auftakt,
  Datenblatt,
  Kapitel,
  Tabelle,
  Weiter,
} from "@/components/erlebnis/bausteine";
import { company } from "@/content/site";
import { partitur, takt } from "./partitur";
import {
  abspann,
  ehrlich,
  kopf,
  stellen,
  stellenKopf,
  warum,
} from "./texte";
import s from "./seite.module.css";

/**
 * Text der Karriere-Seite (Serverkomponente), in der Reihenfolge der
 * Kapitelliste (partitur.ts).
 *
 * Bühne „Ein Tag oben": fünf Takte, je eine Aussage aus texte.ts.
 * Datenblatt: beide Stellenanzeigen vollständig als
 * Spezifikationsblock (Umfang · Einsatz · Start · Aufgaben · Mitbringen
 * · Wir stellen), dazu „Warum hier" in voller Länge, die beiden
 * ehrlichen Listen. Wer eine Anzeige liest, will sie am
 * Stück lesen und vergleichen — das geht nicht Takt für Takt.
 */

const [erwartet, erwarten] = ehrlich;

/** Bewerbungslink mit Betreff. */
const bewerbung = (titel: string) =>
  `${company.email.href}?subject=${encodeURIComponent("Application: " + titel)}`;

export default function Inhalt() {
  return (
    <>
      {/* 01 — Ein Tag oben ------------------------------------------- */}
      <Kapitel partitur={partitur} id="tag">
        <Auftakt
          partitur={partitur}
          kapitel="tag"
          takt={takt("auftakt")}
          titel={kopf.titel}
          lead={kopf.lead}
        />

        {/* Warum hier: drei kurze Gründe; die ganzen Absätze stehen im
            Datenblatt. */}
        <div data-takt={takt("warum")} className="e-block">
          <h2 className="e-titel e-titel-l">{warum.titel}</h2>
          <ul className="e-liste e-liste-gross">
            {warum.kurz.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        {/* Aufstieg: Der Turm glimmt, das HUD zählt die Höhe mit. */}
        <div data-takt={takt("aufstieg")} data-teil="turm" className="e-block">
          <p className="e-etikett">{erwartet.frage}</p>
          <h2 className="e-titel e-titel-l">{erwartet.punkte[1]}</h2>
          <ul className="e-liste">
            <li>{erwartet.punkte[0]}</li>
            <li>{erwartet.punkte[3]}</li>
          </ul>
        </div>

        {/* Gondel: der große Satz der Seite. Bewusst ohne Wort-für-Wort-
            Auftritt: Der Takt ist zu kurz, als dass der Satz danach noch
            lange genug ganz stünde — und die Enthüllung gehört dem H1. */}
        <div data-takt={takt("gondel")} data-teil="gondel" className="e-block">
          <p className="e-etikett">{erwarten.frage}</p>
          <p className={`e-zitat ${s.zitat}`}>{erwarten.punkte[3]}</p>
        </div>

        {/* Störung: Der Himmel kippt in die Nacht. */}
        <div data-takt={takt("stoerung")} className="e-block">
          <p className="e-etikett">{erwartet.frage}</p>
          <h2 className="e-titel e-titel-l">{erwartet.punkte[2]}</h2>
          <Weiter href="#stellen">{stellenKopf.titel.replace(".", "")}</Weiter>
        </div>
      </Kapitel>

      {/* 02 — Datenblatt: Stellenanzeigen ---------------------------- */}
      <Datenblatt
        partitur={partitur}
        id="stellen"
        etikett="Data sheet"
        titel={stellenKopf.titel}
      >
        <p className="e-text e-lead">{stellenKopf.lead}</p>

        {stellen.map((st) => (
          <article key={st.titel} className={s.stelle}>
            <Abschnitt titel={st.titel}>
              <p className="e-text">{st.intro}</p>
            </Abschnitt>
            <Tabelle
              zeilen={[
                ...st.eckdaten.map((e) => ({ schluessel: e.k, wert: e.v })),
                ...st.spalten.map((sp) => ({
                  schluessel: sp.kopf,
                  wert: (
                    <ul className={`e-liste ${s.punkte}`}>
                      {sp.punkte.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  ),
                })),
              ]}
            />
            <p className="e-text">
              Apply informally at{" "}
              <a href={bewerbung(st.titel)} className="e-signal">
                {company.email.display}
              </a>
              . A résumé is all we need.
            </p>
          </article>
        ))}

        <Abschnitt titel={warum.titel}>
          {warum.absaetze.map((a) => (
            <p key={a} className="e-text">
              {a}
            </p>
          ))}
        </Abschnitt>

        <div className={s.ehrlich}>
          {ehrlich.map((e) => (
            <Abschnitt key={e.frage} titel={e.frage}>
              <ul className="e-liste">
                {e.punkte.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </Abschnitt>
          ))}
        </div>
      </Datenblatt>

      {/* 03 — Abspann: Initiativbewerbung ----------------------------- */}
      <Abspann
        partitur={partitur}
        pfad="/company/careers"
        titel={abspann.titel}
        lead={
          <>
            {abspann.vor}{" "}
            <a href={company.email.href} className="e-signal">
              {company.email.display}
            </a>
            {abspann.nach}
          </>
        }
      />
    </>
  );
}
