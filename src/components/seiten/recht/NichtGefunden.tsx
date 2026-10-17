import type { Metadata } from "next";
import Link from "next/link";
import {
  Datenblatt,
  Marke,
  Tuer,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import { rundgang } from "@/components/erlebnis/rundgang";
import { company, legalNav, navigation, primaryCta } from "@/content/site";
import Buehne from "./Buehne";
import { fehlerPartitur as partitur } from "./partitur";
import s from "./recht.module.css";
import { fehlerAlt, fehlerText, fehlerTitel } from "./texte";

/** Metadaten der 404. */
export const fehlerMetadata: Metadata = {
  title: "Page not found",
  description:
    "This address no longer exists on example.com. Continue to services, references or contact.",
  robots: { index: false, follow: true },
};

/**
 * 404 — „Hier steht keine Anlage."
 *
 * Die Szene zeigt nur das Fundament: Der Ort ist da, die Anlage nicht.
 * Wer hier landet, kommt meist über Tippfehler, alte Deep-Links oder
 * veraltete Lesezeichen — der Besucher ist also nicht verloren, sondern nur knapp
 * daneben. Deshalb steht hier die vollständige Navigation und nicht nur
 * ein „Zurück zur Startseite", das ihn die Suche von vorn beginnen lässt.
 *
 * Und die Telefonnummer: Wer eine Anlage verkaufen will und auf einer
 * Fehlerseite landet, soll nicht wegen einer falschen URL abspringen.
 *
 * Wird von zwei Stellen gerendert: `app/not-found.tsx` (unbekannte
 * Adressen, mit eigenem Erlebnis-Rahmen) und `app/(site)/not-found.tsx`
 * (`notFound()` in einer Erlebnis-Seite — dort steht der Rahmen schon).
 */
export default function NichtGefunden() {
  return (
    <>
      <Buehne seite="fehler" />

      <section
        id="fundament"
        data-kapitel="fundament"
        className={s.fehler}
        aria-label="Error 404"
      >
        <div className={`${s.fehlerInnen} e-fliesst`}>
          <Marke partitur={partitur} id="fundament">
            Error 404
          </Marke>
          <Zeilen
            as="h1"
            className={`e-titel e-titel-xl ${s.titel}`}
            text={fehlerTitel}
            auftakt
          />
          <p className={`e-titel e-titel-s ${s.zweit}`}>{fehlerAlt}</p>
          <p className="e-text e-lead">{fehlerText}</p>
          <div className="e-knoepfe">
            <Link href={primaryCta.href} className="e-knopf e-knopf-voll">
              {primaryCta.label}
            </Link>
            <a href={company.phone.href} className="e-knopf tnum">
              {company.phone.display}
            </a>
          </div>
          <Link href="/" className="e-weiter">
            <span>Back to home</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <Datenblatt partitur={partitur} id="bereiche" etikett="All sections">
        <nav aria-label="All sections">
          <ul className={s.bereiche}>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={s.bereich}>
                  {item.label}
                </Link>
                {"children" in item && item.children ? (
                  <ul>
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href}>{c.label}</Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <Tuer station={rundgang[0]} />
          <footer className={`e-fuss ${s.fuss}`}>
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
      </Datenblatt>
    </>
  );
}
