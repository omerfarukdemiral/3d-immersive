import type { Metadata } from "next";
import Link from "next/link";
import {
  Abspann,
  Auftakt,
  Datenblatt,
  Kapitel,
  Marke,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import Buehne from "./Buehne";
import {
  abspann,
  felder,
  kopf,
  nachweise,
  nachweiseKopf,
  punkteKopf,
  punktTakt,
  rahmenEinleitung,
  rahmenKopf,
  rahmenTakt,
  rechtsrahmen,
  taktText,
} from "./inhalt";
import { partitur } from "./partitur";
import stil from "./seite.module.css";

export const metadata: Metadata = {
  title: "Standards, safety and insurance",
  description:
    "Occupational safety, insurance coverage and service team qualifications at Musterwerk Energy, with a checklist for operators and documents you can request.",
  alternates: { canonical: "/company/standards" },
};

/** Bauteil, auf das ein Punkt zeigt (Anker der Leitlinie, Bühnen-API 7.2). */
const punktTeil = ["gondel", "fuss", "getriebe", undefined] as const;

/**
 * Standards — „Die Zeichnung".
 *
 * Bühne: Auftakt, vier Punkte (je mit dem Satz, auf den es ankommt, groß
 * gesetzt), dann der Rechtsrahmen Vorschrift für Vorschrift an der
 * Linienzeichnung. Datenblatt: die sechs Nachweise als Karten zum
 * Anfordern. Aller Text steht hier im HTML; Szene und HUD kommen aus
 * partitur.ts.
 */
export default function StandardsSeite() {
  return (
    <>
      <Buehne />

      <Kapitel partitur={partitur} id="verantwortung">
        <Auftakt
          partitur={partitur}
          kapitel="verantwortung"
          takt="0 0.42"
          titel={kopf.titel}
          lead={kopf.lead}
        />
        <div data-takt="0.48 1" className="e-block">
          <h2 className="e-titel e-titel-l">{punkteKopf.titel}</h2>
          <p className="e-text e-lead">{punkteKopf.lead}</p>
        </div>
      </Kapitel>

      <Kapitel partitur={partitur} id="punkte">
        {felder.map((f, i) => (
          <div
            key={f.titel}
            data-takt={taktText(punktTakt(i))}
            data-teil={punktTeil[i]}
            className="e-block"
          >
            <Marke partitur={partitur} id="punkte" angabe={`${i + 1}/4`} />
            <h3 className="e-titel e-titel-m">{f.titel}</h3>
            <p className="e-text">{f.text}</p>
            <p className={stil.pruefen}>{f.pruefen}</p>
          </div>
        ))}
      </Kapitel>

      <Kapitel partitur={partitur} id="rahmen">
        <div data-takt={taktText(rahmenEinleitung)} className="e-block">
          <Marke partitur={partitur} id="rahmen">
            The framework
          </Marke>
          <Zeilen as="h2" className="e-titel e-titel-l" text={rahmenKopf.titel} />
          <p className="e-text e-lead">{rahmenKopf.lead}</p>
        </div>
        {rechtsrahmen.map((r, i) => (
          <div
            key={r.norm}
            data-takt={taktText(rahmenTakt(i))}
            data-teil={`standards-r${i + 1}`}
            className="e-block"
          >
            <Marke partitur={partitur} id="rahmen" angabe={`${i + 1}/6`} />
            <h3 className="e-titel e-titel-m">{r.norm}</h3>
            <p className="e-text">{r.text}</p>
          </div>
        ))}
      </Kapitel>

      <Datenblatt
        partitur={partitur}
        id="nachweise"
        etikett="Proof"
        titel={nachweiseKopf.titel}
      >
        <p className="e-text e-lead">{nachweiseKopf.lead}</p>
        <ol className={stil.karten}>
          {nachweise.map((n, i) => (
            <li key={n.schluessel} className={stil.karte}>
              <span className={`tnum ${stil.karteNr}`} aria-hidden="true">
                {String(i + 1).padStart(2, "0")} / 06
              </span>
              <h3 className="e-titel e-titel-s">{n.titel}</h3>
              <p className="e-text e-klein">{n.text}</p>
              <Link
                href={`/contact?nachweis=${n.schluessel}#anfrage`}
                className={stil.anfordern}
                aria-label={`Request ${n.titel.toLowerCase()}`}
              >
                <span>Request</span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="e-text">{nachweiseKopf.schluss}</p>
      </Datenblatt>

      <Abspann
        partitur={partitur}
        pfad="/company/standards"
        titel={abspann.titel}
        lead={abspann.lead}
      />
    </>
  );
}
