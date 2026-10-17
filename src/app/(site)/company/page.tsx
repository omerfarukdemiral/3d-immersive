import type { Metadata } from "next";
import Link from "next/link";
import {
  Abspann,
  Auftakt,
  Datenblatt,
  Kapitel,
  Marke,
} from "@/components/erlebnis/bausteine";
import { rundgang } from "@/components/erlebnis/rundgang";
import { company } from "@/content/site";
import Buehne from "./Buehne";
import { partitur, punktTakte } from "./partitur";
import s from "./seite.module.css";

/**
 * /company — „Seit 2016".
 *
 * Bühne: Auftakt, „Unsere Wurzeln …", dann die fünf Punkte einzeln mit
 * großer Nummer. Datenblatt: „Wer wir sind" und die Türen zu den vier
 * Unterseiten, jede mit der Messgröße, die das HUD dort zeigt.
 */

export const metadata: Metadata = {
  title: "About us: engineering, experience, hands-on",
  description:
    "Since 2016 we have acquired, operated and maintained wind turbines across Germany, with our own service teams, our own planning office and more than 12 years in the industry.",
  alternates: { canonical: "/company" },
};

/** Auszeichnungen aus der bestehenden Website, unverändert übernommen. */
const merkmale = [
  "Technical know-how from operating our own turbines",
  "Our own experienced service teams, working across Germany",
  "Acquisition of used wind turbines, decommissioning coordination included",
  "Qualified project planning under § 16b (repowering) and § 2 (new projects)",
  "Clear communication, no needless overhead",
];

const unterseiten = [
  {
    href: "/company/team",
    title: "Team",
    desc: "Contacts, service teams and planning office.",
  },
  {
    href: "/company/standards",
    title: "Standards & safety",
    desc: "Certificates, insurance, occupational safety.",
  },
  {
    href: "/company/partners-investors",
    title: "Partners & investors",
    desc: "Portfolio, operating model, growth.",
  },
  {
    href: "/company/careers",
    title: "Careers",
    desc: "Open positions for service technicians.",
  },
].map((u) => ({
  ...u,
  /* Messgröße der Zielseite, aus derselben Quelle wie die Tür im Abspann. */
  messgroesse: rundgang.find((st) => st.pfad === u.href)?.messgroesse,
}));

const nr = (i: number) => String(i + 1).padStart(2, "0");

export default function UnternehmenPage() {
  return (
    <>
      <Buehne />

      {/* 01 — Seit 2016 ------------------------------------------------ */}
      <Kapitel partitur={partitur} id="seit">
        <Auftakt
          partitur={partitur}
          kapitel="seit"
          takt="0 0.48"
          titel="Engineering. Experience. Hands-on."
          lead={`Since ${company.founded} we have acquired, operated and maintained wind turbines across Germany, with our own service teams and our own planning office.`}
        />
        {/* Dieselbe Stimme wie das Zitat auf der Startseite (Menschen). */}
        <figure data-takt="0.5 1" className="e-block">
          <blockquote className="e-zitat">
            Our roots are in the field. With more than{" "}
            {company.experienceYears} years in the wind industry, we know what
            matters in operation, maintenance and project development.
          </blockquote>
          <figcaption className="e-text">
            We favor pragmatic solutions, direct communication and measures
            that actually work on the turbine.
          </figcaption>
        </figure>
      </Kapitel>

      {/* 02 — Fünf Punkte ---------------------------------------------- */}
      {/* Der Titel steht die ganze Bühne über; die Punkte lösen einander
          ab, jeder mit großer Nummer. Ein Balken darunter zeigt, wie weit
          man in der Fünferreihe ist. */}
      <Kapitel partitur={partitur} id="punkte">
        <div data-takt="0 1" className="e-block e-block-breit">
          <Marke partitur={partitur} id="punkte" />
          <h2 className="e-titel e-titel-l">
            What sets us apart.
          </h2>
          <ol className={s.punkte}>
            {merkmale.map((m, i) => (
              <li
                key={m}
                data-takt={`${punktTakte[i][0]} ${punktTakte[i][1]}`}
                className={s.punkt}
              >
                <span aria-hidden="true" className={`tnum ${s.nr}`}>
                  {nr(i)}
                </span>
                <p className={`e-titel e-titel-m ${s.satz}`}>{m}</p>
              </li>
            ))}
          </ol>
          <div className={`e-jahre ${s.fortschritt}`} aria-hidden="true">
            <div className="e-jahre-spur">
              <span
                className="e-fuellung"
                data-strecke={`${punktTakte[0][0]} ${punktTakte[4][0] + 0.04}`}
              />
            </div>
            <div className="e-jahre-skala tnum">
              {merkmale.map((m, i) => (
                <span key={m}>{nr(i)}</span>
              ))}
            </div>
          </div>
        </div>
      </Kapitel>

      {/* 03 — Wer wir sind --------------------------------------------- */}
      <Datenblatt partitur={partitur} id="wer" etikett="Who we are">
        <p className={`e-text e-lead ${s.wer}`}>
          Since {company.founded},{" "}
          {company.legalName} has acquired, operated and maintained wind
          turbines across Germany. We take responsibility for older turbines
          (post-EEG, after the feed-in tariff ends), support new-build and
          repowering projects, and bring the technical know-how to do it with
          an experienced team and our own planning office.
        </p>
        <nav aria-label="Company" className={s.tueren}>
          {unterseiten.map((u) => (
            <Link key={u.href} href={u.href} className={s.tuer}>
              {u.messgroesse ? (
                <span className={`e-etikett tnum ${s.mass}`}>
                  {u.messgroesse}
                </span>
              ) : null}
              <h2 className="e-titel e-titel-s">{u.title}</h2>
              <span className="e-text e-klein">{u.desc}</span>
              <span aria-hidden="true" className={s.pfeil}>
                →
              </span>
            </Link>
          ))}
        </nav>
      </Datenblatt>

      <Abspann
        partitur={partitur}
        pfad="/company"
        titel="Talk to us about your turbine."
        lead="For an initial assessment, we only need the turbine model, rated power, year of construction and location. We will quickly tell you whether and how we can help."
      />
    </>
  );
}
