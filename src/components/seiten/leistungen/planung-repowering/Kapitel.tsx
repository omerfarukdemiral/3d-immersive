import {
  Abschnitt,
  Abspann,
  Auftakt,
  Datenblatt,
  Fragen,
  Kapitel as Buehnenkapitel,
  Marke,
  Tabelle,
  Weiter,
} from "@/components/erlebnis/bausteine";
import { leistungen } from "@/content/leistungen";
import { artikel } from "@/content/wissen";
import { partitur } from "./partitur";
import { einleitungTakt, planung, schritte, schrittTakte } from "./takte";
import s from "./seite.module.css";

/**
 * Text von /services/planning-repowering — „Der Standort" (L3).
 * Alle Texte aus
 * content/leistungen.ts und content/wissen.ts; neu sind nur die
 * Etiketten „Schritt" und die Legenden zum Bild.
 *
 * Schnittstelle: Die gemeinsame Route `(site)/services/[slug]` meldet die
 * Partitur an, setzt Metadaten und JSON-LD und rendert diese Komponente.
 *
 * Gliederung: Auftakt mit Leistungsumfang, dann die sechs Schritte des
 * Verfahrens als Takte (der Lageplan am Boden folgt ihnen), Datenblatt
 * mit Fragen, Hintergrund und den übrigen Leistungen, Abspann.
 */

const pfad = `/services/${planung.slug}`;
const takt = ([a, b]: [number, number]) => `${a} ${b}`;
const nr = (i: number) => String(i + 1).padStart(2, "0");

/** Text bis zum ersten Punkt und der Rest — für den § 16b-Satz im vierten Schritt. */
function saetze(text: string): [string, string] {
  const i = text.indexOf(". ");
  return i < 0 ? [text, ""] : [text.slice(0, i + 1), text.slice(i + 2)];
}

export default function Kapitel() {
  const andere = leistungen.filter((l) => l.slug !== planung.slug);
  const hintergrund = artikel.filter((a) => a.relatedService?.href === pfad);
  const fragen = (planung.faq ?? []).filter((f) => !f.a.startsWith("TODO"));
  const [antrag, paragraph] = saetze(schritte[3].text);

  return (
    <>
      {/* 01 — Der Standort ------------------------------------------- */}
      <Buehnenkapitel partitur={partitur} id="standort">
        <Auftakt
          partitur={partitur}
          kapitel="standort"
          takt="0 0.44"
          titel={planung.title}
          lead={planung.lead}
        />
        <div data-takt="0.47 1" className="e-block">
          <h2 className="e-etikett">Scope of services</h2>
          <p className="e-text">{planung.intro}</p>
          <ul className="e-liste e-liste-gross">
            {planung.bullets.map((b, i) => (
              <li key={b} data-takt={`${0.52 + i * 0.08} 1`}>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </Buehnenkapitel>

      {/* 02 — Sechs Schritte ----------------------------------------- */}
      <Buehnenkapitel partitur={partitur} id="verfahren">
        <div data-takt={takt(einleitungTakt)} className="e-block">
          <Marke partitur={partitur} id="verfahren" angabe="Steps 1–6">
            {planung.nav}
          </Marke>
          <h2 className="e-titel e-titel-l">How a project runs.</h2>
          <p className="e-text">
            Six steps from site assessment to commissioning. How long it takes
            depends on the permitting authority, the required expert reports
            and any objections.
          </p>
        </div>

        {schritte.map((schritt, i) => {
          const kopf = (
            <p className="e-etikett">
              Step <span className="tnum">{nr(i)} / 06</span>
            </p>
          );

          /* 4 — Genehmigung: das Bild der Seite. Alte und neue Anlage
             stehen übereinander, nur die Veränderung ist rot. */
          if (i === 3)
            return (
              <div key={schritt.step} data-takt={takt(schrittTakte[i])} className="e-block">
                {kopf}
                {/* Bewusst ohne Wort-für-Wort-Auftritt: Ein- und Abgang der
                    Wörter (je ~0,12 Kapitellänge) passen nicht in einen
                    Takt — der Titel stünde kaum voll und ginge vor seinem
                    eigenen Text. Der Moment gehört hier dem Bild. */}
                <h3 className="e-titel e-titel-l">{schritt.step}</h3>
                <p className="e-text">{antrag}</p>
                <p className={`e-text ${s.paragraph}`}>{paragraph}</p>
                <ul className={s.legende} aria-hidden="true">
                  <li>
                    <span className={s.bestand} />
                    Existing
                  </li>
                  <li>
                    <span className={s.veraenderung} />
                    Change
                  </li>
                </ul>
              </div>
            );

          return (
            <div
              key={schritt.step}
              data-takt={takt(schrittTakte[i])}
              className="e-block"
              /* 5 — Netzanschluss: Leitlinie vom Turmfuß (fokus in der Partitur) */
              data-teil={i === 4 ? "fuss" : undefined}
            >
              {kopf}
              <h3 className="e-titel e-titel-l">{schritt.step}</h3>
              <p className="e-text">{schritt.text}</p>

              {/* 2 — Wirtschaftlichkeit: die beiden Säulen im Bild */}
              {i === 1 ? (
                <ul className={s.legende} aria-hidden="true">
                  <li>
                    <span className={s.bestand} />
                    Existing
                  </li>
                  <li>
                    <span className={s.veraenderung} />
                    Repowering
                  </li>
                </ul>
              ) : null}

              {/* 6 — Bau: Die Maße zählen mit, während die Anlage wächst
                  (data-mass × massstab), und bleiben stehen, bis sie
                  die 120-m-Klasse erreicht hat. */}
              {i === 5 ? (
                <dl className="e-mass tnum" aria-hidden="true">
                  <div>
                    <dt>Hub height</dt>
                    <dd>
                      <span data-mass="60">60</span> m
                    </dd>
                  </div>
                  <div>
                    <dt>Rotor diameter</dt>
                    <dd>
                      <span data-mass="60">60</span> m
                    </dd>
                  </div>
                </dl>
              ) : null}
            </div>
          );
        })}
      </Buehnenkapitel>

      {/* 03 — Datenblatt --------------------------------------------- */}
      <Datenblatt
        partitur={partitur}
        id="daten"
        etikett="Data sheet"
        titel="Frequently asked questions."
      >
        {fragen.length > 0 ? <Fragen fragen={fragen} /> : null}

        {hintergrund.length > 0 ? (
          <Abschnitt titel="Further reading." etikett="Background">
            {hintergrund.map((a) => (
              <div key={a.slug} className={s.beitrag}>
                <p className="e-etikett">
                  <span className="tnum">{a.readingMinutes}</span> min read
                </p>
                <p className="e-text">{a.teaser}</p>
                <Weiter href={`/insights/${a.slug}`}>{a.title}</Weiter>
              </div>
            ))}
          </Abschnitt>
        ) : null}

        <Abschnitt titel="More services." etikett="Services">
          <Tabelle
            zeilen={andere.map((o) => ({
              schluessel: o.nav,
              wert: (
                <>
                  {o.lead}
                  <br />
                  <Weiter href={`/services/${o.slug}`}>{o.title}</Weiter>
                </>
              ),
            }))}
          />
        </Abschnitt>
      </Datenblatt>

      {/* 04 — Abspann: Tür zu Referenzen ------------------------------ */}
      <Abspann
        partitur={partitur}
        pfad={pfad}
        titel="Get your site or repowering project assessed."
        lead="Tell us the location, the existing turbines and what you have in mind. We'll tell you which steps lie ahead and what a site assessment involves."
      />
    </>
  );
}
