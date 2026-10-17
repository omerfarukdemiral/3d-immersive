import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { leistungBySlug } from "@/content/leistungen";
import {
  Abspann,
  Auftakt,
  Abschnitt,
  Datenblatt,
  Fragen,
  Kapitel,
  Liste,
  Tabelle,
  Weiter,
} from "@/components/erlebnis/bausteine";
import Buehne from "./Buehne";
import { partitur } from "./partitur";

/**
 * Muster einer Erlebnis-Seite — nur für die Entwicklung. Im Produktionsbuild
 * antwortet die Adresse mit 404, und sie steht weder in der Sitemap noch
 * im Index. Texte stammen aus content/leistungen.ts (Service).
 */
export const metadata: Metadata = {
  title: "Patterns",
  robots: { index: false, follow: false },
};

export default function Muster() {
  if (process.env.NODE_ENV === "production") notFound();
  const service = leistungBySlug("maintenance")!;

  return (
    <>
      <Buehne />

      {/* Feste Bühne mit Takten (0–1 über die feste Strecke). */}
      <Kapitel partitur={partitur} id="aufstieg">
        <Auftakt
          partitur={partitur}
          kapitel="aufstieg"
          takt="0 0.2"
          titel={service.title}
          lead={service.lead}
        />
        <div data-takt="0.22 0.42" className="e-block">
          <p className="e-etikett">Service</p>
          <h2 className="e-titel e-titel-l">{service.intro}</h2>
        </div>
        <div data-takt="0.44 1" className="e-block">
          <ul className="e-liste e-liste-gross">
            {service.bullets.map((b, i) => (
              <li key={b} data-takt={`${0.46 + i * 0.1} 1`}>
                {b}
              </li>
            ))}
          </ul>
          <Weiter href="/services/maintenance">{service.nav}</Weiter>
        </div>
      </Kapitel>

      {/* Fließender Abschnitt auf Papier. */}
      <Datenblatt
        partitur={partitur}
        id="daten"
        etikett="Data sheet"
        titel="Service FAQ"
      >
        <Abschnitt titel="Questions" etikett="FAQ">
          <Fragen fragen={service.faq!} />
        </Abschnitt>
        <Tabelle
          nr="01"
          titel="Scope of service"
          zeilen={service.bullets.map((b, i) => ({
            schluessel: `Item ${i + 1}`,
            wert: b,
          }))}
        />
        <Liste punkte={service.bullets.map((b) => ({ titel: b }))} />
      </Datenblatt>

      <Abspann
        partitur={partitur}
        pfad="/services"
        titel="Talk to us about your turbine."
      />
    </>
  );
}
