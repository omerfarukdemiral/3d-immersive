import Link from "next/link";
import { Marke, Tuer, Zeilen } from "@/components/erlebnis/bausteine";
import type { Partitur } from "@/components/erlebnis/partitur";
import { naechsteStation } from "@/components/erlebnis/rundgang";
import { company, legalNav } from "@/content/site";
import s from "./seite.module.css";

/**
 * Schluss der Kontaktseiten — wie der Abspann-Baustein, aber ohne seine
 * zwei Knöpfe: „Anlage verkaufen" und „Service anfragen" führten hier
 * auf die Seite selbst oder ihre Schwester. Übrig bleiben Tür, Titel,
 * Kontaktwege und Fuß.
 *
 * Ohne `titel` (auf /contact, wo die Kontaktwege schon oben stehen) ist
 * er nur Tür und Fuß über der stillen Szene.
 */
export default function Schluss({
  partitur,
  pfad,
  titel,
  lead,
}: {
  partitur: Partitur;
  pfad: string;
  titel?: string;
  lead?: React.ReactNode;
}) {
  const id = "abspann";
  const k = partitur.kapitel.find((x) => x.id === id)!;
  const station = naechsteStation(pfad);
  return (
    <section
      id={id}
      data-kapitel={id}
      className={`e-schluss ${s.schluss} ${titel ? "" : s.schlussKurz}`}
      aria-label={k.titel}
    >
      {/* Tür, Kontaktzeile und Fuß enden links der Anlage (s.frei). */}
      <div
        className={`e-schluss-innen e-fliesst ${s.frei} ${pfad === "/contact" ? s.nah : ""}`}
      >
        {station ? <Tuer station={station} /> : null}
        {titel ? (
          <>
            <Marke partitur={partitur} id={id}>
              Contact
            </Marke>
            <Zeilen as="h2" className="e-titel e-titel-xl" text={titel} />
            {lead ? <p className="e-text e-lead">{lead}</p> : null}
            <dl className="e-kontakt">
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={company.phone.href} className="tnum">
                    {company.phone.display}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={company.email.href}>{company.email.display}</a>
                </dd>
              </div>
              <div>
                <dt>WhatsApp</dt>
                <dd>
                  <a href={company.whatsapp.href}>{company.whatsapp.display}</a>
                </dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>
                  {company.address.street}, {company.address.zip}{" "}
                  {company.address.city}
                </dd>
              </div>
            </dl>
          </>
        ) : null}
        <footer className="e-fuss">
          <span>© {company.legalName}</span>
          <nav aria-label="Legal">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>
        </footer>
      </div>
    </section>
  );
}
