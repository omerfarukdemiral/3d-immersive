import Link from "next/link";
import { Marke, Tuer, Zeilen } from "@/components/erlebnis/bausteine";
import { naechsteStation } from "@/components/erlebnis/rundgang";
import { company, legalNav } from "@/content/site";
import { abspann } from "./texte";
import { partitur } from "./partitur";

/**
 * Abspann dieser Seite — Aufbau und Klassen wie der gemeinsame Baustein
 * `Abspann`, nur mit anderen Knöpfen.
 *
 * Warum eine eigene Fassung: Der Lead sagt „Kein Formular. Rufen Sie an
 * oder schreiben Sie …". Die Knöpfe des Bausteins führen aber genau auf
 * die beiden Formularseiten (Anlage verkaufen, Service anfragen), und
 * beides passt nicht zu Kapitalpartnern. Hier sind Telefon und E-Mail die
 * Handlung. Darunter stehen nur noch die
 * übrigen Kontaktwege, damit nichts doppelt dasteht.
 *
 * Die Flotte steht dabei rechts neben dem Text (Kamera in partitur.ts).
 */
export default function Schluss() {
  const id = "abspann";
  const k = partitur.kapitel.find((x) => x.id === id)!;
  const station = naechsteStation(partitur.id);
  return (
    <section
      id={id}
      data-kapitel={id}
      className="e-schluss"
      aria-label={k.titel}
    >
      <div className="e-schluss-innen e-fliesst">
        {station ? <Tuer station={station} /> : null}
        <Marke partitur={partitur} id={id}>
          Contact
        </Marke>
        <Zeilen as="h2" className="e-titel e-titel-xl" text={abspann.titel} />
        <p className="e-text e-lead">{abspann.lead}</p>
        <div className="e-knoepfe">
          <a
            href={company.phone.href}
            className="e-knopf e-knopf-voll tnum"
            aria-label={`Phone ${company.phone.display}`}
          >
            {company.phone.display}
          </a>
          <a
            href={company.email.href}
            className="e-knopf"
            aria-label={`Email ${company.email.display}`}
          >
            {company.email.display}
          </a>
        </div>
        <dl className="e-kontakt">
          <div>
            <dt>WhatsApp</dt>
            <dd>
              <a href={company.whatsapp.href}>Send a message</a>
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
