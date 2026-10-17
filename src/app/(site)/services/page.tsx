import type { Metadata } from "next";
import { leistungen } from "@/content/leistungen";
import {
  Abspann,
  Auftakt,
  Kapitel,
  Marke,
  Weiter,
} from "@/components/erlebnis/bausteine";
import Buehne from "./Buehne";
import { partitur } from "./partitur";

export const metadata: Metadata = {
  title: "Services: Acquisition, Maintenance, Monitoring and Planning",
  description:
    "Four service areas for wind turbines: acquisition of older turbines, service and maintenance, remote monitoring, and planning and repowering.",
  alternates: { canonical: "/services" },
};

/* Kapitel der vier Bereiche in der Reihenfolge der Inhalte (content/
   leistungen.ts) — dieselbe Reihenfolge wie die Vierteldrehungen der
   Kamera in partitur.ts. */
const bereiche = [
  { id: "ankauf", slug: "acquisition", seite: "links" },
  { id: "service", slug: "maintenance", seite: "rechts" },
  { id: "monitoring", slug: "monitoring", seite: "links" },
  { id: "planung", slug: "planning-repowering", seite: "rechts" },
] as const;

/**
 * /services — „Vier Bereiche, vier Richtungen".
 *
 * Auftakt mit Titel und Lead, dann je Bereich eine
 * Bühne: Titel, Einleitung, Leistungspunkte und der Weg zur Detailseite.
 * Die Punkte treten im Halt nacheinander auf, während die Kamera steht;
 * die Fahrt zur nächsten Richtung liegt im Kapitelwechsel. Kein
 * Datenblatt — die Seite ist kurz.
 */
export default function LeistungenSeite() {
  return (
    <>
      <Buehne />

      <Kapitel partitur={partitur} id="auftakt">
        <Auftakt
          partitur={partitur}
          kapitel="auftakt"
          takt="0 1"
          titel="Our services for your wind turbine."
          lead="Acquisition, maintenance, monitoring and planning from a single source. We operate turbines of our own, so we know this work from our own fleet. You get one point of contact for all four areas."
        />
      </Kapitel>

      {bereiche.map((b, i) => {
        const l = leistungen.find((x) => x.slug === b.slug)!;
        return (
          <Kapitel key={b.id} partitur={partitur} id={b.id} seite={b.seite}>
            <div data-takt="0 1" className="e-block">
              <Marke partitur={partitur} id={b.id}>
                Area <span className="tnum">{String(i + 1).padStart(2, "0")}</span> / 04
              </Marke>
              <h2 className="e-titel e-titel-l">{l.title}</h2>
              <p className="e-text">{l.intro}</p>
              <ul className="e-liste">
                {l.bullets.map((p, j) => (
                  <li key={p} data-takt={`${0.08 + j * 0.12} 1`}>
                    {p}
                  </li>
                ))}
              </ul>
              <div data-takt={`${0.1 + l.bullets.length * 0.12} 1`}>
                <Weiter href={`/services/${l.slug}`}>{l.nav}</Weiter>
              </div>
            </div>
          </Kapitel>
        );
      })}

      <Abspann
        partitur={partitur}
        pfad="/services"
        titel="Talk to us about your turbine."
        lead="For an initial assessment, all we need is the turbine model, rated capacity, year of installation and location. We'll get back to you quickly on whether and how we can help."
      />
    </>
  );
}
