import type { Metadata } from "next";
import { kennzahlen } from "@/content/site";
import {
  Abschnitt,
  Abspann,
  Auftakt,
  Datenblatt,
  Kapitel,
  Liste,
  Marke,
  Tabelle,
  Weiter,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import Buehne from "./Buehne";
import css from "./seite.module.css";
import {
  ausgangslagen,
  bereiche,
  bereicheKopf,
  einsatz,
  einsatzKopf,
  kopf,
  lagenKopf,
  schluss,
  standorte,
  vermittlung,
  zahlenKopf,
} from "./inhalt";
import { partitur } from "./partitur";
import { takt, takteDeutschland, takteEinsatz, takteLagen } from "./raster";

export const metadata: Metadata = {
  title: "References: wind turbines in operation, service and planning",
  description:
    "Turbines under monitoring, in our own portfolio, in service and in planning: a look at the projects of Musterwerk Energie GmbH & Co. KG.",
  alternates: { canonical: "/references" },
};

/**
 * Referenzen — „Deutschlandweit".
 *
 * Kernstück der Beweisführung: Statt
 * Projektdossiers mit Anlagennamen stehen hier die Kennzahlen, das
 * Einsatzgebiet und die vier Ausgangslagen, in denen Betreiber anrufen.
 * Die Szene zeigt das Land, nie einen Standort (Einsatzkarte.tsx).
 *
 * Bühne: eine Behauptung je Takt. Datenblatt: die Ausgangslagen in voller
 * Länge und die vier Arbeitsweisen — dort liest man vergleichend, nicht
 * im Takt.
 */
export default function ReferenzenPage() {
  const nr = (i: number) => String(i + 1).padStart(2, "0");
  return (
    <>
      <Buehne />

      {/* 01 — Deutschland ------------------------------------------- */}
      <Kapitel partitur={partitur} id="deutschland">
        <Auftakt
          partitur={partitur}
          kapitel="deutschland"
          takt={takt(takteDeutschland.auftakt)}
          titel={kopf.titel}
          lead={kopf.lead}
        />
        <div data-takt={takt(takteDeutschland.kopf)} className="e-block">
          <h2 className="e-titel e-titel-l">{zahlenKopf.titel}</h2>
          <p className="e-text">{zahlenKopf.text}</p>
        </div>
        {kennzahlen.map((z, i) => (
          <div
            key={z.label}
            data-takt={takt(takteDeutschland.zahlen[i])}
            className="e-block"
          >
            <p className="e-etikett">
              <span className="tnum">{nr(i)}</span> / 04
            </p>
            <Zeilen
              className="e-riesig tnum"
              text={String(z.value)}
              zahl={z.value}
              kante
            />
            <p className="e-titel e-titel-m">{z.label}</p>
            {/* Der Eigenbestand verlinkt auf diese Seite selbst. */}
            {z.href !== "/references" ? (
              <Weiter href={z.href}>View</Weiter>
            ) : null}
          </div>
        ))}
      </Kapitel>

      {/* 02 — Einsatz ----------------------------------------------- */}
      <Kapitel partitur={partitur} id="einsatz">
        <div data-takt={takt(takteEinsatz.kopf)} className="e-block">
          <Marke partitur={partitur} id="einsatz">
            Service area
          </Marke>
          <Zeilen
            as="h2"
            className="e-titel e-titel-xl"
            text={einsatzKopf.titel}
          />
          <p className="e-text e-lead">{einsatzKopf.lead}</p>
          <p className="e-text e-klein">{einsatzKopf.karte}</p>
        </div>
        {einsatz.map((e) => (
          <div
            key={e.id}
            data-takt={takt(takteEinsatz[e.id])}
            className="e-block"
          >
            <h3 className="e-titel e-titel-l">{e.titel}</h3>
            <p className="e-text">{e.text}</p>
          </div>
        ))}
        <div data-takt={takt(takteEinsatz.standorte)} className="e-block">
          <p className="e-titel e-titel-m">{standorte}</p>
        </div>
      </Kapitel>

      {/* 03 — Ausgangslagen ----------------------------------------- */}
      <Kapitel partitur={partitur} id="lagen" seite="rechts">
        <div
          data-takt={takt(takteLagen.kopf)}
          className={`e-block ${css.lagen}`}
        >
          <Marke partitur={partitur} id="lagen">
            Scenarios
          </Marke>
          <h2 className="e-titel e-titel-l">{lagenKopf.titel}</h2>
          <p className="e-text">{lagenKopf.lead}</p>
        </div>
        <div
          data-takt={takt(takteLagen.liste)}
          className={`e-block ${css.lagen}`}
        >
          <ol className="e-schritte">
            {ausgangslagen.map((a, i) => (
              <li key={a.titel} data-takt={`${takteLagen.titel[i]} 1`}>
                <span className="tnum">{nr(i)}</span>
                {a.titel}
              </li>
            ))}
          </ol>
        </div>
      </Kapitel>

      {/* 04 — Datenblatt -------------------------------------------- */}
      <Datenblatt partitur={partitur} id="daten" etikett="Data sheet">
        <Abschnitt titel={lagenKopf.titel} etikett="Scenarios">
          {ausgangslagen.map((a, i) => (
            <Tabelle
              key={a.titel}
              nr={nr(i)}
              titel={a.titel}
              zeilen={[
                { schluessel: "Situation", wert: a.lage },
                { schluessel: "Approach", wert: a.vorgehen },
                { schluessel: "Outcome", wert: a.messbar },
              ]}
            />
          ))}
          <p className="e-text">{vermittlung}</p>
        </Abschnitt>
        <Abschnitt titel={bereicheKopf}>
          <Liste
            punkte={bereiche.map((b) => ({
              titel: b.titel,
              text: (
                <>
                  <p>{b.text}</p>
                  <Weiter href={b.href}>{b.titel}</Weiter>
                </>
              ),
            }))}
          />
        </Abschnitt>
      </Datenblatt>

      <Abspann
        partitur={partitur}
        pfad="/references"
        titel={schluss.titel}
        lead={schluss.lead}
      />
    </>
  );
}
