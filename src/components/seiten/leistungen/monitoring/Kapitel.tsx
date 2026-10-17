import Link from "next/link";
import {
  Abschnitt,
  Abspann,
  Auftakt,
  Datenblatt,
  Fragen,
  Kapitel as FesteBuehne,
  Liste,
  Marke,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import { leistungen, leistungBySlug } from "@/content/leistungen";
import { partitur } from "./partitur";
import stil from "./seite.module.css";

/**
 * Text der Monitoring-Seite: „Eine Nacht".
 *
 * Serverkomponente — aller Text steht im HTML. Die Antworten der Fragen
 * werden nicht gekürzt, sondern Satz für Satz auf die Takte verteilt;
 * vollständig stehen sie noch einmal im Datenblatt.
 */

const PFAD = "/services/monitoring";

/** Antwort in Sätze zerlegen — Wortlaut bleibt unverändert. */
const saetze = (text: string) => text.split(/(?<=[.!?])\s+/);

export default function Kapitel() {
  const l = leistungBySlug("monitoring")!;
  const faq = l.faq!;
  /* Über den Anfang der Frage gesucht; fehlt er, gilt die Reihenfolge in
     content/leistungen.ts. */
  const frage = (anfang: string, i: number) =>
    faq.find((f) => f.q.startsWith(anfang)) ?? faq[i];

  const nacht = frage("What happens", 1);
  const altanlage = frage("Is it worth", 3);
  const technik = frage("Do we need", 0);
  const daten = frage("Can I see", 2);

  const [meldung, quittiert, planung] = saetze(nacht.a);
  const [altKurz, altRisiko, altIndikatoren] = saetze(altanlage.a);
  const [technikKurz, ...technikRest] = saetze(technik.a);
  const datenSaetze = saetze(daten.a);
  const zitat = datenSaetze[datenSaetze.length - 1];

  const andere = leistungen.filter((x) => x.slug !== l.slug);

  return (
    <>
      {/* 01 — 03:10 Meldung ------------------------------------------- */}
      <FesteBuehne partitur={partitur} id="meldung">
        <Auftakt
          partitur={partitur}
          kapitel="meldung"
          takt="0 0.3"
          titel={l.title}
          lead={l.lead}
        />
        <div
          data-takt="0.33 0.64"
          data-teil="monitoring-leitstand"
          className="e-block"
        >
          <Marke partitur={partitur} id="meldung">
            Alert
          </Marke>
          <Zeilen as="h2" className="e-titel e-titel-l" text={nacht.q} />
          <p className="e-text e-lead">{meldung}</p>
          <p className={`e-etikett ${stil.ziel}`}>
            <span aria-hidden="true" className={stil.zielpunkt} />
            Remote monitoring
          </p>
        </div>
        <div data-takt="0.67 1" className="e-block">
          <p className="e-titel e-titel-m">{quittiert}</p>
          <p className={`e-etikett tnum ${stil.drehzahl}`}>
            Rotor <span data-upm>0.0</span> rpm
          </p>
        </div>
      </FesteBuehne>

      {/* 02 — 03:20 Frühindikatoren --------------------------------- */}
      <FesteBuehne partitur={partitur} id="befund">
        <div data-takt="0 0.48" data-teil="getriebe" className="e-block">
          <Marke partitur={partitur} id="befund">
            Early indicators
          </Marke>
          <h2 className="e-titel e-titel-l">{altanlage.q}</h2>
          <p className="e-text e-lead">
            {altKurz} {altRisiko}
          </p>
        </div>
        <div data-takt="0.52 1" className="e-block">
          <p className="e-text e-lead">{altIndikatoren}</p>
          <Kurven />
        </div>
      </FesteBuehne>

      {/* 03 — 05:00 Steuerung --------------------------------------- */}
      <FesteBuehne partitur={partitur} id="technik">
        <div data-takt="0 0.48" className={`e-block ${stil.daemmerung}`}>
          <Marke partitur={partitur} id="technik">
            Controls
          </Marke>
          <h2 className="e-titel e-titel-l">{technik.q}</h2>
          <p className={`e-titel e-titel-m ${stil.antwort}`}>
            {technikKurz}
          </p>
        </div>
        <div data-takt="0.52 1" data-teil="fuss" className="e-block">
          <p className="e-text e-lead">{technikRest.join(" ")}</p>
        </div>
      </FesteBuehne>

      {/* 04 — 07:00 Einsatzplanung ---------------------------------- */}
      <FesteBuehne partitur={partitur} id="morgen">
        <div data-takt="0 1" className="e-block e-block-breit">
          <Marke partitur={partitur} id="morgen">
            Dispatch planning
          </Marke>
          <h2 className="e-titel e-titel-m">{planung}</h2>
        </div>
      </FesteBuehne>

      {/* Datenblatt: Leistungsumfang, Fragen, weitere Leistungen ------ */}
      <Datenblatt
        partitur={partitur}
        id="daten"
        etikett="Data sheet"
        titel="Scope of services"
      >
        <div className="e-abschnitt">
          <p className="e-text e-lead">{l.intro}</p>
          <Liste punkte={l.bullets.map((b) => ({ titel: b }))} />
        </div>
        <Abschnitt titel="Frequently asked questions.">
          <Fragen fragen={faq} />
        </Abschnitt>
        <Abschnitt titel="More services.">
          <ul className={`e-artikel ${stil.andere}`}>
            {andere.map((o) => (
              <li key={o.slug}>
                <Link href={`/services/${o.slug}`}>
                  <p className="e-titel e-titel-s">{o.title}</p>
                  <p className="e-text e-klein">{o.lead}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Abschnitt>
        <p className="e-zitat">{zitat}</p>
      </Datenblatt>

      <Abspann
        partitur={partitur}
        pfad={PFAD}
        titel="Request monitoring for your turbine."
        lead="Tell us the manufacturer, model and controller. We'll explain how we connect your turbine to our remote monitoring."
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Frühindikatoren als laufende Kurven                                 */
/* ------------------------------------------------------------------ */

/* Eine Periode ist 200 Einheiten breit; jede Kurve wird zweimal
   hintereinander gezeichnet und um eine Periode verschoben — so läuft sie
   ohne Naht. Illustration ohne Achse und ohne Werte: Die Seite behauptet
   keine Messgröße, sie zeigt nur, dass die drei Werte laufen. */
const BREITE = 200;
const HOEHE = 40;

function pfad(f: (x: number) => number) {
  let d = "";
  for (let x = 0; x <= BREITE * 2; x += 2) {
    d += `${x === 0 ? "M" : "L"}${x},${f(x).toFixed(2)}`;
  }
  return d;
}

const TAU = Math.PI * 2;
const kurven = [
  {
    name: "Oil temperature",
    /* träge: eine lange Welle mit leichtem Nebenschwung */
    d: pfad(
      (x) =>
        HOEHE / 2 -
        Math.sin((TAU * x) / BREITE) * 9 -
        Math.sin((TAU * 3 * x) / BREITE) * 3,
    ),
    dauer: "14s",
  },
  {
    name: "Particle count",
    /* zählt: Stufen statt Kurve */
    d: pfad(
      (x) =>
        HOEHE / 2 -
        Math.round(
          Math.sin((TAU * 2 * x) / BREITE) * 2 +
            Math.sin((TAU * 5 * x) / BREITE),
        ) *
          4,
    ),
    dauer: "10s",
  },
  {
    name: "Vibration pattern",
    /* schnell: Schwingung, deren Ausschlag langsam an- und abschwillt */
    d: pfad(
      (x) =>
        HOEHE / 2 -
        Math.sin((TAU * 16 * x) / BREITE) *
          (4 + 9 * (0.5 + 0.5 * Math.sin((TAU * x) / BREITE))),
    ),
    dauer: "7s",
  },
];

function Kurven() {
  return (
    <ul className={stil.kurven} aria-label="Early indicators">
      {kurven.map((k) => (
        <li key={k.name} className={stil.kurve}>
          <span className="e-etikett">{k.name}</span>
          <span className={stil.spur} aria-hidden="true">
            <svg
              className={stil.welle}
              viewBox={`0 0 ${BREITE * 2} ${HOEHE}`}
              preserveAspectRatio="none"
              style={{ animationDuration: k.dauer }}
            >
              <path d={k.d} vectorEffect="non-scaling-stroke" />
            </svg>
          </span>
        </li>
      ))}
    </ul>
  );
}
