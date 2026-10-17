import type { Metadata } from "next";
import Link from "next/link";
import {
  Abschnitt,
  Abspann,
  Auftakt,
  Datenblatt,
  Kapitel,
  Liste,
  Tabelle,
} from "@/components/erlebnis/bausteine";
import { company } from "@/content/site";
import Buehne from "./Buehne";
import { partitur, takt } from "./partitur";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Our own service teams, our own planning office, short lines of communication: roles, qualifications and contacts at Musterwerk Energy.",
  alternates: { canonical: "/company/team" },
};

/**
 * Team — „Von unten nach oben".
 *
 * Porträtfotos und Namen der Techniker stehen bewusst nicht hier: Sie
 * müssten vom Kunden kommen und jeder Mitarbeitende müsste der
 * Veröffentlichung zustimmen. Die Seite beantwortet stattdessen die
 * Frage, die ein Betreiber tatsächlich stellt — wer kommt, mit welcher
 * Qualifikation, und wen erreiche ich dazwischen. Genannt ist nur, wer
 * ohnehin öffentlich im Handelsregister und im Impressum steht.
 *
 * Die Bühne stellt jede Rolle an den Ort, an dem sie arbeitet; die
 * Qualifikationen, die vier Grundsätze und die Unternehmensangaben
 * stehen im Datenblatt.
 */

const prinzipien = [
  {
    titel: "Our own service teams",
    text: "We don't hand service jobs to subcontractors. We plan and confirm appointments ourselves, and the response time for your turbine is written into the service contract.",
  },
  {
    titel: "Manufacturer-independent",
    text: "We are not tied to any turbine manufacturer. For operators of older turbines, that often matters most once the original manufacturer no longer supports the model.",
  },
  {
    titel: "The same contacts",
    text: "You have dedicated contacts who know your turbine and its history. You explain your case once.",
  },
  {
    titel: "Field experience",
    text: `More than ${company.experienceYears} years in the wind industry, across operation, maintenance and project development. We know the turbine models we service from our own work inside the tower.`,
  },
];

/**
 * Rollen statt Personen, in der Reihenfolge der Bühne (von unten nach
 * oben). Beschrieben ist, welche Qualifikation hinter der jeweiligen
 * Arbeit steht — nicht, wie viele Menschen sie ausüben. Eine
 * Mitarbeiterzahl wäre eine Angabe, die nur das Unternehmen belegen kann,
 * und sie ändert sich schneller als die Website.
 */
const rollen = [
  {
    takt: "planung",
    rolle: "Planning & project development",
    qualifikation:
      "Permitting under BImSchG (Federal Immission Control Act) · technical design · grid planning",
    text: "Responsible for everything before commissioning: site assessment, economics, permitting and grid connection, for new builds as well as repowering under § 16b BImSchG.",
  },
  {
    takt: "monitoring",
    rolle: "Operations management & monitoring",
    qualifikation: "Operating data analysis · commercial administration",
    text: "This is where the data from every turbine we look after comes in. The team decides whether an alert can be cleared remotely or needs a site visit, and prepares your operating report. It also handles the grid operator, the direct marketer and the insurer.",
  },
  {
    takt: "elektro",
    teil: "fuss",
    rolle: "Qualified electrician",
    qualifikation:
      "Qualified under DGUV Regulation 3 (electrical safety) · medium-voltage work",
    text: "Converter, switchgear, transformer station: live electrical work is reserved for qualified electricians. That includes the periodic inspections of electrical equipment, documented with an inspection report and date.",
  },
  {
    takt: "service",
    teil: "gondel",
    rolle: "Service technician",
    qualifikation:
      "Technical training · fitness for work at height (G 41) · fall-protection PPE training",
    text: "They drive to the turbine, climb the tower and carry out maintenance and troubleshooting. The work happens 60 to 140 meters up, so alongside technical skills, regularly certified fitness for work at height and rescue drills count.",
  },
] as const;

const ANZAHL = rollen.length + 1;

export default function TeamSeite() {
  return (
    <>
      <Buehne />

      {/* Feste Bühne: fünf Rollen, jede dort, wo sie arbeitet. */}
      <Kapitel partitur={partitur} id="rollen">
        <Auftakt
          partitur={partitur}
          kapitel="rollen"
          takt={takt("auftakt")}
          titel="Our team."
          lead="Our own service teams, our own planning office and a managing director you can reach directly. Across Germany and independent of any manufacturer."
        />

        {rollen.map((r, i) => (
          <div
            key={r.rolle}
            data-takt={takt(r.takt)}
            data-teil={"teil" in r ? r.teil : undefined}
            className="e-block"
          >
            <p className="e-etikett tnum">
              Role {i + 1}/{ANZAHL}
            </p>
            <h2 className="e-titel e-titel-l">{r.rolle}</h2>
            {r.takt === "service" ? (
              /* Die Nabenhöhe wächst mit der Anlage (data-mass: 60 ×
                 Maßstab) — die Zahl bleibt während des ganzen Wachsens
                 stehen. Nur Bild: Der Satz darunter nennt die Spanne. */
              <dl className="e-mass tnum" aria-hidden="true">
                <div>
                  <dt>Hub height</dt>
                  <dd>
                    <span data-mass="60">60</span> m
                  </dd>
                </div>
              </dl>
            ) : null}
            <p className="e-text">{r.text}</p>
          </div>
        ))}

        <div data-takt={takt("leitung")} className="e-block">
          <p className="e-etikett tnum">
            Role {ANZAHL}/{ANZAHL}
          </p>
          <h2 className="e-titel e-titel-l">Management</h2>
          <p className="e-text">
            Our managing director is {company.managingDirector}. He handles
            conversations about acquiring a turbine or investing with us
            personally.
          </p>
        </div>
      </Kapitel>

      {/* Datenblatt: Grundsätze, Qualifikationen, Angaben. */}
      <Datenblatt
        partitur={partitur}
        id="arbeitsweise"
        etikett="Data sheet"
        titel="How we work."
      >
        <p className="e-text e-lead">
          Four principles shape how a service job runs with us and what you
          can expect from us.
        </p>
        <Liste punkte={prinzipien} />

        <Abschnitt titel="Roles and qualifications.">
          <p className="e-text">
            Four roles work together on every turbine we look after. We are a
            small company with clearly assigned responsibilities.
          </p>
        </Abschnitt>
        <Tabelle
          nr="01"
          titel="Qualification"
          zeilen={[...rollen].reverse().map((r) => ({
            schluessel: r.rolle,
            wert: r.qualifikation,
          }))}
        />
        <Tabelle
          nr="02"
          titel="Management"
          zeilen={[
            { schluessel: "Managing director", wert: company.managingDirector },
            {
              schluessel: "General partner",
              wert: company.generalPartner,
            },
            { schluessel: "Commercial register", wert: company.tradeRegister },
          ]}
        />
        <p className="e-text e-klein">
          Full company details are in the{" "}
          <Link href="/imprint" className="e-signal">
            imprint
          </Link>
          .
        </p>

      </Datenblatt>

      <Abspann
        partitur={partitur}
        pfad="/company/team"
        titel="Talk to us directly."
        lead="Reach our team in Musterstadt directly by phone, email or WhatsApp."
      />
    </>
  );
}
