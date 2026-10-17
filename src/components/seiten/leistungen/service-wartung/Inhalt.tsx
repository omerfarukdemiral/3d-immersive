import {
  Abschnitt,
  Abspann,
  Auftakt,
  Datenblatt,
  Fragen,
  Kapitel,
  Liste,
  Marke,
  Weiter,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import { leistungen, leistungBySlug } from "@/content/leistungen";
import { artikel } from "@/content/wissen";
import { partitur } from "./partitur";

/**
 * Text der Service-Seite „Der Aufstieg".
 *
 * Serverkomponente: Aller Text steht im HTML. Die Takte zeigen Auszüge
 * aus den Fragen in der Reihenfolge des Aufstiegs; die vollständigen
 * Antworten, der Leistungsumfang und die übrigen Leistungen stehen
 * ungekürzt im Datenblatt — nichts von der alten Seite fällt weg.
 *
 * Alle Texte aus content/leistungen.ts. Wo eine Antwort auf zwei Takte
 * verteilt ist, sind die Sätze nur getrennt, nicht umformuliert.
 */

const PFAD = "/services/maintenance";

/** Antwort zu einer Frage, über ihren Anfang gesucht. */
function antwort(
  fragen: { q: string; a: string }[],
  anfang: string,
  i: number,
) {
  const f = fragen.find((x) => x.q.startsWith(anfang)) ?? fragen[i];
  if (!f) throw new Error(`Question "${anfang}…" missing in content/leistungen.ts`);
  return f;
}

/** Text in Sätze teilen (Punkt oder Doppelpunkt mit Leerzeichen danach). */
const saetze = (text: string) =>
  (text.match(/[^.:]+[.:](?=\s|$)/g) ?? [text]).map((s) => s.trim());

export default function Inhalt() {
  const l = leistungBySlug("maintenance")!;
  const faq = l.faq!;

  const typen = antwort(faq, "Which turbine", 0);
  const stoerung = antwort(faq, "How quickly", 1);
  const behalten = antwort(faq, "Can we keep", 2);
  const kosten = antwort(faq, "What does", 3);

  /* Anlagentypen: die ersten beiden Sätze (1990er–2010er). */
  const typenAuszug = saetze(typen.a).slice(0, 2).join(" ");
  /* Störung: (a) Fernüberwachung, „Minuten statt Tage" · (b) Reaktionszeit. */
  const st = saetze(stoerung.a);
  const stoerungA = st.slice(0, 2).join(" ");
  const stoerungB = st.slice(2).join(" ");
  /* Wartung behalten: „Ja. … selten:" — dann der Kernsatz groß. */
  const be = saetze(behalten.a);
  const behaltenVorlauf = be.slice(0, -1).join(" ");
  const letzter = be[be.length - 1];
  const [kern, rest] = letzter.includes(" and comes ")
    ? letzter.split(" and comes ")
    : [letzter, ""];

  /* Datenblatt: die Kostenfrage zuerst (sie steht in keinem Takt). */
  const fragen = [kosten, ...faq.filter((f) => f !== kosten)];
  const andere = leistungen.filter((x) => x.slug !== l.slug);
  const passendeArtikel = artikel.filter(
    (a) => a.relatedService?.href === PFAD,
  );

  return (
    <>
      {/* Turmfuß · 0 m */}
      <Kapitel partitur={partitur} id="fuss">
        <Auftakt
          partitur={partitur}
          kapitel="fuss"
          takt="0 0.45"
          titel={l.title}
          lead={l.lead}
        />
        <div data-takt="0.5 1" className="e-block">
          <Marke partitur={partitur} id="fuss" angabe="Height 0 → 15 m" />
          <h2 className="e-titel e-titel-l">{typen.q}</h2>
          <p className="e-text">{typenAuszug}</p>
        </div>
      </Kapitel>

      {/* Turm · 15 → 40 m */}
      <Kapitel partitur={partitur} id="turm">
        <div data-takt="0 1" className="e-block">
          <Marke partitur={partitur} id="turm" />
          <p className="e-etikett">Scope of services</p>
          <p className="e-text e-lead">{l.intro}</p>
          <ul className="e-liste e-liste-gross">
            {l.bullets.map((b, i) => (
              <li key={b} data-takt={`${0.08 + i * 0.18} 1`}>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </Kapitel>

      {/* Gondel · 40 → 60 m, dann Blick hinaus */}
      <Kapitel partitur={partitur} id="gondel">
        <div data-takt="0 0.32" className="e-block">
          <Marke partitur={partitur} id="gondel" angabe="Height 40 → 60 m" />
          <h2 className="e-titel e-titel-l">{stoerung.q}</h2>
          <p className="e-text">{stoerungA}</p>
        </div>
        <div data-takt="0.35 0.65" className="e-block">
          <Marke partitur={partitur} id="gondel" angabe="Height 60 m" />
          <p className="e-titel e-titel-m" aria-hidden="true">
            {stoerung.q}
          </p>
          <p className="e-text">{stoerungB}</p>
        </div>
        <div data-takt="0.64 1" className="e-block">
          <Marke partitur={partitur} id="gondel" angabe="Height 60 m" />
          <p className="e-etikett">{behalten.q}</p>
          <p className="e-text">{behaltenVorlauf}</p>
          <Zeilen as="h2" className="e-titel e-titel-l" text={kern} />
          {rest ? <p className="e-text">and comes {rest}</p> : null}
        </div>
      </Kapitel>

      {/* Datenblatt: vollständige Antworten und Leistungsumfang */}
      <Datenblatt
        partitur={partitur}
        id="daten"
        etikett="Data sheet"
        titel="Frequently asked questions."
      >
        <Fragen fragen={fragen} />

        <Abschnitt titel="Scope of services">
          <p className="e-text">{l.intro}</p>
          <Liste punkte={l.bullets.map((b) => ({ titel: b }))} />
        </Abschnitt>

        {passendeArtikel.length > 0 ? (
          <Abschnitt titel="Further reading.">
            <Liste
              punkte={passendeArtikel.map((a) => ({
                titel: a.title,
                text: (
                  <>
                    {a.readingMinutes} min read{" "}
                    <Weiter href={`/insights/${a.slug}`}>Read</Weiter>
                  </>
                ),
              }))}
            />
          </Abschnitt>
        ) : null}

        {/* Wie auf der alten Seite: Titel und Lead der übrigen drei
            Leistungen, der Titel ist der Link. Eigene Liste statt
            `Liste`, weil dort der Titel kein Link sein kann. */}
        <Abschnitt titel="More services.">
          <ol className="e-nliste">
            {andere.map((o, i) => (
              <li key={o.slug}>
                <span className="tnum e-nliste-nr" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <Weiter href={`/services/${o.slug}`}>{o.title}</Weiter>
                  <p className="e-text e-klein">{o.lead}</p>
                </div>
              </li>
            ))}
          </ol>
          <Weiter href="/services">All services</Weiter>
        </Abschnitt>
      </Datenblatt>

      <Abspann
        partitur={partitur}
        pfad={PFAD}
        titel="Request service for your turbine."
        lead="Tell us the manufacturer, model and year of installation. On the first call, we'll tell you whether and how we can look after your turbine."
      />
    </>
  );
}
