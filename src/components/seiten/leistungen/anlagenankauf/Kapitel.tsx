import {
  Abschnitt,
  Abspann,
  Auftakt,
  Datenblatt,
  Fragen,
  Kapitel,
  Liste,
  Marke,
  Tabelle,
  Weiter,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import { leistungBySlug, leistungen } from "@/content/leistungen";
import { artikel } from "@/content/wissen";
import { partitur } from "./partitur";
import { EINLEITUNG, SCHRITT_TAKTE, ablauf, uebergaben } from "./takte";

/**
 * Text der Ankauf-Seite „Fünf Schritte".
 *
 * Alles aus content/leistungen.ts und content/wissen.ts. Neu ist nur die
 * Zeile „Geht auf uns über" (im Konzept als [NEU] markiert). Was in der Bühne keinen
 * Takt bekommt — Fragen, Zeitplan als Tabelle, Hintergrund, die übrigen
 * Leistungen — steht vollständig im Datenblatt.
 */

const ankauf = leistungBySlug("acquisition")!;
const takt = ([a, b]: readonly [number, number]) => `${a} ${b}`;
const nr = (i: number) => String(i + 1).padStart(2, "0");

/* Erste Frage: Ihre Antwort trägt den Schluss der Bühne. Der letzte Satz
   wird zum großen Titel, der Rest steht davor; nichts gekürzt. */
const rueckbau = ankauf.faq![0];
const rueckbauSaetze = rueckbau.a.match(/[^.!?]+[.!?]+(?=\s|$)/g) ?? [rueckbau.a];
const rueckbauSchluss = rueckbauSaetze[rueckbauSaetze.length - 1].trim();
const rueckbauVorne = rueckbauSaetze.slice(0, -1).join(" ").replace(/\s+/g, " ").trim();

const hintergrund = artikel.filter(
  (a) => a.relatedService?.href === `/services/${ankauf.slug}`,
);
const andere = leistungen.filter((l) => l.slug !== ankauf.slug);

export default function AnkaufKapitel() {
  return (
    <>
      {/* 01 — Auftakt und Leistungsumfang ------------------------------ */}
      <Kapitel partitur={partitur} id="ankauf">
        <Auftakt
          partitur={partitur}
          kapitel="ankauf"
          takt="0 0.46"
          titel={ankauf.title}
          lead={ankauf.lead}
        />
        <div data-takt="0.5 1" className="e-block">
          <p className="e-etikett">Scope of services</p>
          <p className="e-text e-lead">{ankauf.intro}</p>
          <ol className="e-schritte">
            {ankauf.bullets.map((b, i) => (
              <li key={b} data-takt={`${0.56 + i * 0.08} 1`}>
                <span className="tnum e-signal">{nr(i)}</span> {b}
              </li>
            ))}
          </ol>
        </div>
      </Kapitel>

      {/* 02 — Fünf Schritte ------------------------------------------- */}
      <Kapitel partitur={partitur} id="schritte">
        <div data-takt={takt(EINLEITUNG)} className="e-block">
          <Marke partitur={partitur} id="schritte">
            Process
          </Marke>
          <h2 className="e-titel e-titel-l">How the acquisition works.</h2>
          <p className="e-text">
            Five steps from first contact to handover. At every step, you know
            who is responsible and what we need from you.
          </p>
        </div>
        {ablauf.map((s, i) => {
          const lasten = uebergaben
            .filter((u) => u.beiSchritt === i)
            .map((u) => u.last);
          return (
            <div key={s.step} data-takt={takt(SCHRITT_TAKTE[i])} className="e-block">
              <p className="e-etikett tnum">
                Step {nr(i)} · {s.dauer}
              </p>
              <h3 className="e-titel e-titel-l">{s.step}</h3>
              <p className="e-text">{s.text}</p>
              {lasten.length > 0 ? (
                <p className="e-uebergabe">
                  <span className="e-etikett">Passes to us</span>
                  {lasten.join(" · ")}
                </p>
              ) : null}
            </div>
          );
        })}
      </Kapitel>

      {/* 03 — Abgabe -------------------------------------------------- */}
      <Kapitel partitur={partitur} id="abgabe">
        <div data-takt="0 1" className="e-block e-block-breit">
          <Marke partitur={partitur} id="abgabe">
            Handover
          </Marke>
          <p className="e-titel e-titel-s">{rueckbau.q}</p>
          <p className="e-text e-lead">{rueckbauVorne}</p>
          <Zeilen
            as="h2"
            className="e-titel e-titel-xl"
            text={rueckbauSchluss}
          />
        </div>
      </Kapitel>

      {/* 04 — Datenblatt ---------------------------------------------- */}
      <Datenblatt
        partitur={partitur}
        id="daten"
        etikett="Data sheet"
        titel="Frequently asked questions."
      >
        <Fragen fragen={ankauf.faq!} />

        <Tabelle
          nr="01"
          titel="Timeline · Estimates"
          zeilen={ablauf.map((s, i) => ({
            schluessel: `${nr(i)} ${s.step}`,
            wert: s.dauer,
          }))}
        />
        <p className="e-fussnote">
          Durations are estimates for orientation only. We set the binding
          timeline for your turbine in our offer.
        </p>

        <Tabelle
          nr="02"
          titel="Passes to us"
          zeilen={uebergaben.map((u) => ({
            schluessel: u.last,
            wert: `${nr(u.beiSchritt)} ${ablauf[u.beiSchritt].step}`,
          }))}
        />

        {hintergrund.length > 0 ? (
          <Abschnitt titel="Further reading." etikett="Insights">
            <Liste
              punkte={hintergrund.map((a) => ({
                titel: a.title,
                text: (
                  <>
                    {a.teaser}
                    <br />
                    <Weiter href={`/insights/${a.slug}`}>
                      {a.readingMinutes} min read
                    </Weiter>
                  </>
                ),
              }))}
            />
          </Abschnitt>
        ) : null}

        <Abschnitt titel="More services." etikett="Services">
          <Liste
            punkte={andere.map((l) => ({
              titel: l.title,
              text: (
                <>
                  {l.lead}
                  <br />
                  <Weiter href={`/services/${l.slug}`}>{l.nav}</Weiter>
                </>
              ),
            }))}
          />
        </Abschnitt>
      </Datenblatt>

      {/* 05 — Abspann ------------------------------------------------- */}
      <Abspann
        partitur={partitur}
        pfad={`/services/${ankauf.slug}`}
        titel="Offer your turbine for sale."
        lead="A short call usually tells us whether an acquisition is an option. For an initial assessment, all we need is the turbine model, year of installation and location."
      />
    </>
  );
}
