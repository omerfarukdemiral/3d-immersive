import Link from "next/link";
import { company, kennzahlen, primaryCta } from "@/content/site";
import { leistungen, leistungBySlug, anatomie } from "@/content/leistungen";
import {
  Abspann,
  Kapitel as BKapitel,
  Marke as BMarke,
  Weiter,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import { netzTakte, partitur, type KapitelId } from "./partitur";

/**
 * Der gesamte Text der Startseite.
 *
 * Serverseitig gerendert und vollständig im HTML: Suchmaschinen und
 * Screenreader bekommen jeden Satz, auch ohne Skript und ohne WebGL.
 * Die Bewegung kommt erst danach dazu (Erlebnis.tsx) und schreibt nur
 * Deckkraft und Verschiebung — sie entfernt nie Inhalt.
 *
 * `data-takt="a b"`: sichtbar zwischen a und b der festen Bühne (0–1).
 * Die Bausteine kommen aus components/erlebnis/bausteine; hier nur an
 * die Partitur der Startseite gebunden.
 */

function Kapitel(props: {
  id: KapitelId;
  seite?: "links" | "rechts" | "unten";
  children: React.ReactNode;
}) {
  return <BKapitel partitur={partitur} {...props} />;
}

function Marke(props: { id: KapitelId; children?: React.ReactNode }) {
  return <BMarke partitur={partitur} {...props} />;
}

/* Netz: fünf Kraftwerke an einer Leitung. Reihenfolge = Reihenfolge der
   Orte in components/erlebnis/kraftwerkOrte.ts (data-teil = Ort-ID). */
const netz = [
  {
    id: "kw-wind",
    name: "Wind farm",
    text: "Three 3 MW-class turbines on one site. Where everything we operate began.",
    leistung: "9 MW",
    kennwert: "3 turbines · 60 m hub height",
  },
  {
    id: "kw-solar",
    name: "Solar park",
    text: "Thirteen rows of module tables, tilted 25° to the south. It delivers when the wind drops at midday.",
    leistung: "9.6 MWp",
    kennwert: "39 tables · 4.2 ha",
  },
  {
    id: "kw-speicher",
    name: "Battery storage",
    text: "Twenty-four containers. They absorb peaks from wind and sun and release them in the evening.",
    leistung: "20 MW / 40 MWh",
    kennwert: "24 containers · 2 h duration",
  },
  {
    id: "kw-biogas",
    name: "Biogas plant",
    text: "Three digesters, one combined heat and power unit. Baseload that doesn't depend on the weather.",
    leistung: "1.5 MWe",
    kennwert: "3 digesters · 8,000 full-load hours",
  },
  {
    id: "kw-umspannwerk",
    name: "Substation",
    text: "All lines meet here and are stepped up to high voltage.",
    leistung: "110 / 20 kV",
    kennwert: "3 transformers · 63 MVA",
  },
];

/* Anatomie: kurze Einleitung, dann fünf gleich lange Takte. Die Kamera
   (partitur.ts) fährt den größten Teil jedes Takts langsam zum nächsten
   Bauteil und steht nur kurz — keine harten Sprünge in die Gondel. */
const teilTakte = ["0.11 0.28", "0.29 0.46", "0.47 0.64", "0.65 0.82", "0.83 1"];

/* Leistungen: vier Bereiche, vier Blicke auf einem Bogen um die Anlage
   (Kamerastellungen in partitur.ts). Auf der Startseite nur Titel und
   Leitsatz — die Aufzählungen stehen auf den Leistungsseiten. */
const bereichTakte = ["0.14 0.35", "0.36 0.57", "0.58 0.79", "0.8 1"];
const blicke = ["000", "035", "070", "095"];

export default function Kapitelfolge() {
  const ankauf = leistungBySlug("acquisition")!;
  const monitoring = leistungBySlug("monitoring")!;
  const planung = leistungBySlug("planning-repowering")!;
  const nachtFrage = monitoring.faq![1];
  const altanlageFrage = monitoring.faq![3];
  const paragraph = planung.faq![0];
  const eigenbestand = kennzahlen.find((k) => k.href === "/references")!;

  return (
    <>
      {/* 01 — Morgengrauen ------------------------------------------- */}
      <Kapitel id="prolog">
        <div data-takt="0 0.62" className="e-block e-block-breit">
          <Marke id="prolog">Musterstadt</Marke>
          <Zeilen
            as="h1"
            className="e-titel e-titel-xl"
            text="Acquisition, service and repowering for existing wind turbines."
            auftakt
          />
          <p className="e-text e-lead">
            Since {company.founded}, we have been buying, maintaining and
            operating wind turbines across Germany. We run our own service
            crews, round-the-clock remote monitoring and a planning office
            for repowering.
          </p>
          <div className="e-knoepfe">
            <Link href={primaryCta.href} className="e-knopf e-knopf-voll">
              {primaryCta.label}
            </Link>
            <Link href="/contact/service-request" className="e-knopf">
              Request service
            </Link>
          </div>
        </div>
        <div data-takt="0.64 1" className="e-block">
          <p className="e-etikett">One turbine. One day.</p>
          <p className="e-titel e-titel-l">
            Acquisition, service, monitoring and planning under one roof.
          </p>
          <p className="e-text">
            We operate {eigenbestand.value} turbines ourselves, so we know the
            business from the owner&apos;s side. On this page, you follow one
            turbine through one day.
          </p>
        </div>
        <p
          data-takt="0 0.2"
          className="e-etikett e-hinweis"
          aria-hidden="true"
        >
          Scroll <span className="e-hinweis-strich" />
        </p>
      </Kapitel>

      {/* 02 — Anatomie ------------------------------------------------ */}
      <Kapitel id="anatomie">
        <div data-takt="0 0.1" className="e-block">
          <Marke id="anatomie">Anatomy</Marke>
          <h2 className="e-titel e-titel-l">
            Early warning signs in five components.
          </h2>
          <p className="e-text">
            The turbine controller logs operating data around the clock. In
            these five components, the readings often flag damage weeks before
            a failure.
          </p>
        </div>
        {anatomie.map((t, i) => (
          <div
            key={t.id}
            data-takt={teilTakte[i]}
            className="e-block e-teil"
            data-teil={t.id}
          >
            <p className="e-etikett">
              Component{" "}
              <span className="tnum">{String(i + 1).padStart(2, "0")}</span> /
              05
            </p>
            <h3 className="e-titel e-titel-l">{t.name}</h3>
            <p className="e-text">{t.text}</p>
            <dl className="e-spez">
              <div>
                <dt>Reading</dt>
                <dd>{t.messwert}</dd>
              </div>
              <div>
                <dt>Early sign of</dt>
                <dd className="e-signal">{t.fehler}</dd>
              </div>
            </dl>
          </div>
        ))}
      </Kapitel>

      {/* 03 — Leistungen ---------------------------------------------- */}
      <Kapitel id="leistungen">
        <div data-takt="0 0.13" className="e-block">
          <Marke id="leistungen">Services</Marke>
          <h2 className="e-titel e-titel-l">
            Four areas. One point of contact.
          </h2>
          <p className="e-text">
            Book each service on its own or as a package.
          </p>
        </div>
        {leistungen.map((l, i) => (
          <div
            key={l.slug}
            data-takt={bereichTakte[i]}
            className="e-block"
          >
            <p className="e-etikett e-etikett-zeile">
              <span>
                Area{" "}
                <span className="tnum">{String(i + 1).padStart(2, "0")}</span>{" "}
                / 04
              </span>
              <span aria-hidden="true" className="e-strich" />
              <span className="tnum">Heading {blicke[i]}°</span>
            </p>
            <h3 className="e-titel e-titel-l">{l.title}</h3>
            <p className="e-text e-lead">{l.lead}</p>
            <Weiter href={`/services/${l.slug}`}>{l.nav}</Weiter>
          </div>
        ))}
      </Kapitel>

      {/* 04 — Netz ------------------------------------------------------ */}
      {/* Text rechts: Die Kamera fährt nach Westen, die Kraftwerke kommen
          von links ins Bild und heben sich dort aus dem Boden. */}
      <Kapitel id="netz" seite="rechts">
        <div data-takt="0 0.14" className="e-block">
          <Marke id="netz">Grid</Marke>
          <Zeilen as="h2" className="e-titel e-titel-l" text="Five power plants. One line." />
          <p className="e-text">
            Wind, sun, storage, biogas and the substation that feeds them
            into the grid. Scroll along the line.
          </p>
        </div>
        {netz.map((k, i) => (
          <div
            key={k.id}
            data-takt={netzTakte[i].join(" ")}
            className="e-block e-teil"
            data-teil={k.id}
          >
            <p className="e-etikett">
              Power plant{" "}
              <span className="tnum">{String(i + 1).padStart(2, "0")}</span> /
              05
            </p>
            <h3 className="e-titel e-titel-l">{k.name}</h3>
            <p className="e-text">{k.text}</p>
            <dl className="e-spez">
              <div>
                <dt>Output</dt>
                <dd className="tnum">{k.leistung}</dd>
              </div>
              <div>
                <dt>Setup</dt>
                <dd className="e-signal">{k.kennwert}</dd>
              </div>
            </dl>
          </div>
        ))}
      </Kapitel>

      {/* 05 — Ablauf -------------------------------------------------- */}
      <Kapitel id="ablauf" seite="unten">
        <div data-takt="0 1" className="e-block e-block-voll">
          <Marke id="ablauf">{ankauf.title}</Marke>
          <h2 className="e-titel e-titel-m e-schmal">{ankauf.lead}</h2>
          <div className="e-zeitleiste">
            <span className="e-zeitleiste-linie" aria-hidden="true">
              <span className="e-fuellung" data-strecke="0.14 0.86" />
            </span>
            <ol>
              {ankauf.ablauf!.map((s, i) => (
                <li key={s.step} data-takt={`${0.14 + i * 0.16} 1`}>
                  <p className="e-etikett tnum">
                    {String(i + 1).padStart(2, "0")} · {s.dauer}
                  </p>
                  <h3 className="e-titel e-titel-s">{s.step}</h3>
                  <p className="e-text e-klein">{s.text}</p>
                  {ankauf.uebergaben!.some((u) => u.beiSchritt === i) ? (
                    <p className="e-uebergabe">
                      <span className="e-etikett">Transfers to us</span>
                      {ankauf
                        .uebergaben!.filter((u) => u.beiSchritt === i)
                        .map((u) => u.last)
                        .join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
          <p className="e-fussnote">
            Timings are guidelines. The binding schedule is part of our
            offer.
          </p>
        </div>
      </Kapitel>

      {/* 06 — Nacht --------------------------------------------------- */}
      <Kapitel id="nacht">
        <div data-takt="0 0.48" className="e-block">
          <Marke id="nacht">{monitoring.title}</Marke>
          <Zeilen as="h2" className="e-titel e-titel-l" text={nachtFrage.q} />
          <p className="e-text">{nachtFrage.a}</p>
        </div>
        <div data-takt="0.5 1" className="e-block">
          <ul className="e-liste e-liste-gross">
            {monitoring.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <h3 className="e-titel e-titel-s">{altanlageFrage.q}</h3>
          <p className="e-text">{altanlageFrage.a}</p>
          <Weiter href="/services/monitoring">{monitoring.nav}</Weiter>
        </div>
      </Kapitel>

      {/* 07 — Repowering ---------------------------------------------- */}
      <Kapitel id="repowering">
        {/* Der Titel bleibt stehen, solange die Anlage wächst (massstab in
            partitur.ts: 0,08 → 0,42) — Maße und Anlage sind gleichzeitig
            zu sehen, und am Ende steht „120 m" neben der großen Anlage. */}
        <div data-takt="0 0.5" className="e-block">
          <Marke id="repowering">{planung.title}</Marke>
          <h2 className="e-titel e-titel-l">{planung.lead}</h2>
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
        </div>
        <div data-takt="0.52 0.76" className="e-block">
          <p className="e-etikett">§ 16b BImSchG</p>
          <h3 className="e-titel e-titel-m">{paragraph.q}</h3>
          <p className="e-text">{paragraph.a}</p>
        </div>
        <div data-takt="0.78 1" className="e-block">
          <p className="e-etikett">From first idea to first power</p>
          <ol className="e-schritte">
            {planung.ablauf!.map((s, i) => (
              <li key={s.step}>
                <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
                {s.step}
              </li>
            ))}
          </ol>
          <Weiter href="/services/planning-repowering">{planung.nav}</Weiter>
        </div>
      </Kapitel>

      {/* 08 — Kontakt ------------------------------------------------- */}
      {/* Die Tür zur nächsten Seite fehlt hier noch bewusst: Solange die
          Unterseiten in der alten Gestaltung stehen, führte sie aus dem
          Tag heraus in einen Bruch. */}
      <Abspann
        partitur={partitur}
        id="schluss"
        pfad="/"
        weiter={false}
        titel="Talk to us about your turbine."
        lead="For a first assessment, we need the turbine model, rated output, year of construction and location. We'll get back to you with a concrete answer."
      />
    </>
  );
}
