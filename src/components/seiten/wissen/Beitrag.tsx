import Link from "next/link";
import {
  Abschnitt,
  Abspann,
  Datenblatt,
  Fragen,
  Kapitel,
  Marke,
  Weiter,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import type { Partitur } from "@/components/erlebnis/partitur";
import { artikel, type Artikel } from "@/content/wissen";
import { abschnittId, paragraf } from "./takte";
import s from "./seite.module.css";

/**
 * Text eines Beitrags im Lesemodus (L1).
 *
 * Die Szene steht eingefroren und blass hinter dem Text; der Text läuft
 * normal. Aufbau:
 *
 *   Auftakt     Marke (Kicker · Wissen), Titel, Teaser, Lesezeit
 *   Abschnitte  je ein fließender Abschnitt — die Kapitelschiene rechts
 *               ist damit die „Inhalt"-Liste, Anker
 *               #abschnitt-0 …
 *   Datenblatt  Häufige Fragen (falls vorhanden) und weitere Beiträge
 *   Abspann     „Ihre Situation?" mit dem Satz und dem Link zur Leistung
 *               des Beitrags
 */
export default function Beitrag({
  a,
  partitur,
}: {
  a: Artikel;
  partitur: Partitur;
}) {
  const weitere = artikel.filter((x) => x.slug !== a.slug);

  const weitereListe = (
    <ul className={s.weitere}>
      {weitere.map((w) => (
        <li key={w.slug}>
          <Link href={`/insights/${w.slug}`} className={s.weiterKarte}>
            <span className="e-etikett tnum">
              {w.readingMinutes} min read
            </span>
            <h3 className="e-titel e-titel-s">{paragraf(w.title)}</h3>
            <span aria-hidden="true" className={s.pfeil}>
              →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* 01 — Auftakt ------------------------------------------------- */}
      <Kapitel partitur={partitur} id="beitrag">
        <div data-takt="0 1" className="e-block e-block-breit">
          <Marke partitur={partitur} id="beitrag">
            <Link href="/insights" className={s.zurueck}>
              {partitur.name}
            </Link>
          </Marke>
          <Zeilen
            as="h1"
            className={`e-titel e-titel-l ${s.titel}`}
            text={paragraf(a.title)}
            auftakt
          />
          <p className="e-text e-lead">{paragraf(a.teaser)}</p>
          <p className={`e-etikett tnum ${s.lesezeit}`}>
            {a.readingMinutes} min read
          </p>
        </div>
      </Kapitel>

      {/* 02 … — Abschnitte ------------------------------------------- */}
      {a.sections.map((sec, i) => (
        <section
          key={sec.h}
          id={abschnittId(i)}
          data-kapitel={abschnittId(i)}
          className={[
            s.abschnitt,
            i === 0 ? s.erster : "",
            i === a.sections.length - 1 ? s.letzter : "",
          ].join(" ")}
          aria-labelledby={`${abschnittId(i)}-titel`}
        >
          <div className={`e-fliesst ${s.spalte}`}>
            <Marke partitur={partitur} id={abschnittId(i)} />
            <h2
              id={`${abschnittId(i)}-titel`}
              className={`e-titel e-titel-m ${s.h2}`}
            >
              {paragraf(sec.h)}
            </h2>
            {sec.p.map((para) => (
              <p key={para.slice(0, 40)} className={s.absatz}>
                {paragraf(para)}
              </p>
            ))}
            {sec.list ? (
              <ul className={`e-liste ${s.liste}`}>
                {sec.list.map((li) => (
                  <li key={li}>{paragraf(li)}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      {/* Fragen und weitere Beiträge --------------------------------- */}
      {/* Rahmen nur für den weichen Auslauf des Papiers (seite.module.css). */}
      <div className={s.datenblattRahmen}>
        {a.faq ? (
          <Datenblatt
            partitur={partitur}
            id="fragen"
            etikett="Data sheet"
            titel="Frequently asked questions"
          >
            <Fragen fragen={a.faq} />
            <Abschnitt titel="More articles">{weitereListe}</Abschnitt>
          </Datenblatt>
        ) : (
          <Datenblatt
            partitur={partitur}
            id="fragen"
            etikett="Data sheet"
            titel="More articles"
          >
            {weitereListe}
          </Datenblatt>
        )}
      </div>

      <Abspann
        partitur={partitur}
        pfad={`/insights/${a.slug}`}
        titel="Get your turbine assessed."
        lead={
          a.relatedService ? (
            <>
              We look at your turbine and tell you which option makes
              economic sense in your case.
              <span className={s.leistung}>
                <Weiter href={a.relatedService.href}>
                  {a.relatedService.label}
                </Weiter>
              </span>
            </>
          ) : undefined
        }
      />
    </>
  );
}
