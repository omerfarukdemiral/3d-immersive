import { Fragment } from "react";
import Link from "next/link";
import { company, legalNav, primaryCta } from "@/content/site";
import { LUFT, type Partitur } from "../partitur";
import { naechsteStation, type Station } from "../rundgang";
import { uhrText } from "../zeitachse";

/**
 * Bausteine der Erlebnis-Seiten. Serverkomponenten: Aller Text steht im
 * HTML, auch ohne Skript und ohne WebGL. Bewegt wird er erst im Browser
 * (Erlebnis.tsx), und dort nur über Deckkraft und Verschiebung.
 *
 * Vertrag und Beispiele: docs/04-sayfa-api.md.
 */

type Seite = "links" | "rechts" | "unten";

function kapitelVon(partitur: Partitur, id: string) {
  const i = partitur.kapitel.findIndex((k) => k.id === id);
  if (i < 0)
    throw new Error(`Kapitel „${id}" fehlt in der Partitur „${partitur.id}"`);
  return { i, k: partitur.kapitel[i] };
}

const nr = (i: number) => String(i + 1).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* Bühne                                                               */
/* ------------------------------------------------------------------ */

/**
 * Feste Bühne: Der Abschnitt ist `hoehe` Fensterhöhen hoch, sein Inhalt
 * steht sticky im Bild. Kinder mit `data-takt="a b"` sind zwischen a und
 * b der festen Strecke sichtbar (0–1) und liegen übereinander.
 * `seite`: wo der Text steht — die Szene sollte auf der anderen Seite
 * stehen (Kamera-`versatz`), der Schleier folgt automatisch.
 */
export function Kapitel({
  partitur,
  id,
  seite = "links",
  children,
}: {
  partitur: Partitur;
  id: string;
  seite?: Seite;
  children: React.ReactNode;
}) {
  const { k } = kapitelVon(partitur, id);
  return (
    <section
      id={id}
      data-kapitel={id}
      className="e-kapitel"
      style={
        { "--hoehe": k.hoehe ?? 2, "--luft": k.luft ?? LUFT } as React.CSSProperties
      }
      aria-label={k.titel}
    >
      <div className={`e-buehne e-${seite}`}>
        <div className="e-stapel">{children}</div>
      </div>
    </section>
  );
}

/**
 * Marke über einem Titel: Kapitelnummer · Angabe · Name. Die Angabe ist
 * `marke` aus der Partitur, sonst die Uhrzeit des Kapitels.
 */
export function Marke({
  partitur,
  id,
  angabe,
  children,
}: {
  partitur: Partitur;
  id: string;
  /** Überschreibt die Angabe aus der Partitur. */
  angabe?: string;
  children?: React.ReactNode;
}) {
  const { i, k } = kapitelVon(partitur, id);
  const mitte =
    angabe ?? k.marke ?? (k.uhr !== undefined ? uhrText(k.uhr) : undefined);
  return (
    <p className="e-etikett e-marke">
      <span className="tnum">{nr(i)}</span>
      {mitte ? (
        <>
          <span aria-hidden="true" className="e-strich" />
          <span className="tnum">{mitte}</span>
        </>
      ) : null}
      {children ? (
        <>
          <span aria-hidden="true" className="e-strich" />
          <span>{children}</span>
        </>
      ) : null}
    </p>
  );
}

/** Textlink mit Pfeil, zu einer Seite, die das Thema vertieft. */
export function Weiter({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="e-weiter">
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}

/**
 * Titel der großen Momente, Wort für Wort (Takt-Schleife in Erlebnis.tsx
 * schreibt --z). Nur für wenige Stellen gedacht — überall eingesetzt
 * nutzt sich die Bewegung ab.
 *
 * Screenreader bekommen den Satz am Stück (sr-only); die zerlegte Fassung
 * ist nur Bild. `kante`: ein einzelnes Wort oder eine Zahl steigt hinter
 * einer Kante auf. `zahl`: Zielwert für den Zähler (data-zahl).
 * `auftakt`: tritt einmal beim Laden auf (für den ersten Titel einer
 * Seite, an den sich kein Scroll koppeln kann).
 */
export function Zeilen({
  as: Tag = "p",
  className,
  text,
  kante = false,
  auftakt = false,
  zahl,
}: {
  as?: "h1" | "h2" | "h3" | "p";
  className: string;
  text: string;
  kante?: boolean;
  auftakt?: boolean;
  zahl?: string | number;
}) {
  const woerter = text.split(" ");
  return (
    <Tag
      className={`${className}${auftakt ? " e-auftakt" : ""}`}
      data-zeilen={kante ? "kante" : ""}
      style={{ "--n": woerter.length } as React.CSSProperties}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {woerter.map((w, i) => (
          <Fragment key={i}>
            <span className="e-wort">
              <span
                style={{ "--i": i } as React.CSSProperties}
                data-zahl={zahl}
              >
                {w}
              </span>
            </span>
            {i < woerter.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/**
 * Auftakt einer Unterseite: erster Takt der ersten Bühne. Marke
 * (Kapitelnummer · Messgröße · Seitenname), H1 Wort für Wort, Lead,
 * optional Knöpfe als Kinder.
 */
export function Auftakt({
  partitur,
  kapitel,
  takt = "0 0.15",
  titel,
  lead,
  angabe,
  children,
}: {
  partitur: Partitur;
  /** Kapitel, in dessen Bühne der Auftakt steht (meist das erste). */
  kapitel: string;
  /** Sichtbarkeit in der festen Strecke, Standard „0 0.15". */
  takt?: string;
  titel: string;
  lead?: React.ReactNode;
  /** Messgröße in der Marke; Standard: `marke` des Kapitels. */
  angabe?: string;
  children?: React.ReactNode;
}) {
  return (
    <div data-takt={takt} className="e-block e-block-breit">
      <Marke partitur={partitur} id={kapitel} angabe={angabe}>
        {partitur.name}
      </Marke>
      <Zeilen as="h1" className="e-titel e-titel-xl" text={titel} auftakt />
      {lead ? <p className="e-text e-lead">{lead}</p> : null}
      {children ? <div className="e-knoepfe">{children}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Datenblatt                                                          */
/* ------------------------------------------------------------------ */

/**
 * Fließender Abschnitt auf Papier für Referenzwissen: Tabellen, Listen,
 * Fragen. Die Szene steht dahinter still (Kamera hält, Text läuft
 * normal). Zählt als Kapitel der Partitur, braucht dort aber keine
 * `hoehe` — seine Höhe ergibt sich aus dem Inhalt.
 */
export function Datenblatt({
  partitur,
  id,
  etikett,
  titel,
  children,
}: {
  partitur: Partitur;
  id: string;
  /** Kleine Zeile über dem Titel, z. B. „Datenblatt". */
  etikett?: string;
  titel?: string;
  children: React.ReactNode;
}) {
  const { k } = kapitelVon(partitur, id);
  return (
    <section
      id={id}
      data-kapitel={id}
      className="e-datenblatt"
      aria-label={titel ?? k.titel}
    >
      <div className="e-datenblatt-innen e-fliesst">
        {etikett || titel ? (
          <header className="e-datenblatt-kopf">
            <Marke partitur={partitur} id={id}>
              {etikett ?? k.titel}
            </Marke>
            {titel ? <h2 className="e-titel e-titel-l">{titel}</h2> : null}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/** Zwischentitel im Datenblatt. */
export function Abschnitt({
  titel,
  etikett,
  children,
}: {
  titel: string;
  etikett?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="e-abschnitt">
      {etikett ? <p className="e-etikett">{etikett}</p> : null}
      <h3 className="e-titel e-titel-m">{titel}</h3>
      {children}
    </div>
  );
}

/**
 * Schlüssel-Wert-Tabelle, wahlweise mit Nummer und Titel darüber
 * (Spezifikationsblock: „01 DIE FÖRDERUNG LÄUFT AUS · Was vorliegt …").
 */
export function Tabelle({
  nr: nummer,
  titel,
  zeilen,
}: {
  nr?: string;
  titel?: string;
  zeilen: { schluessel: string; wert: React.ReactNode }[];
}) {
  return (
    <div className="e-tabelle">
      {titel ? (
        <p className="e-tabelle-titel">
          {nummer ? <span className="tnum">{nummer}</span> : null}
          <span>{titel}</span>
        </p>
      ) : null}
      <dl>
        {zeilen.map((z) => (
          <div key={z.schluessel}>
            <dt>{z.schluessel}</dt>
            <dd>{z.wert}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Nummerierte Liste mit Titel und optionalem Text je Punkt. */
export function Liste({
  punkte,
}: {
  punkte: { titel: string; text?: React.ReactNode }[];
}) {
  return (
    <ol className="e-nliste">
      {punkte.map((p, i) => (
        <li key={p.titel}>
          <span className="tnum e-nliste-nr" aria-hidden="true">
            {nr(i)}
          </span>
          <div>
            <p className="e-titel e-titel-s">{p.titel}</p>
            {p.text ? <div className="e-text e-klein">{p.text}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Fragen und Antworten als <details>: aufklappbar, ohne Skript. */
export function Fragen({ fragen }: { fragen: { q: string; a: string }[] }) {
  return (
    <div className="e-fragen">
      {fragen.map((f) => (
        <details key={f.q}>
          <summary>
            <span>{f.q}</span>
            <span aria-hidden="true" className="e-fragen-zeichen" />
          </summary>
          <p className="e-text">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Abspann                                                             */
/* ------------------------------------------------------------------ */

/** „WEITER — {SEITE} · {MESSGRÖSSE}": Tür zur nächsten Seite des Rundgangs. */
export function Tuer({ station }: { station: Station }) {
  return (
    <Link href={station.pfad} className="e-tuer">
      <span className="e-etikett">Next</span>
      <span aria-hidden="true" className="e-tuer-strich" />
      <span className="e-tuer-name">{station.name}</span>
      <span className="e-etikett tnum">· {station.messgroesse}</span>
      <span aria-hidden="true" className="e-tuer-pfeil">
        →
      </span>
    </Link>
  );
}

/**
 * Gemeinsamer Schluss jeder Seite: Tür zur nächsten Seite, CTA-Titel,
 * zwei Knöpfe, Kontaktwege, Fuß mit Rechtlichem. Letztes Kapitel der
 * Partitur (ohne `hoehe`; eine Fensterhöhe reicht).
 */
export function Abspann({
  partitur,
  id = "abspann",
  pfad,
  weiter = true,
  marke = "Contact",
  titel,
  lead,
}: {
  partitur: Partitur;
  id?: string;
  /** Pfad dieser Seite — daraus folgt die Tür (rundgang.ts). */
  pfad: string;
  /** Tür zeigen. Oder eine eigene Station statt der aus dem Rundgang. */
  weiter?: boolean | Station;
  marke?: string;
  /** CTA-Titel, z. B. „Passt das zu Ihrer Situation?" */
  titel: string;
  lead?: React.ReactNode;
}) {
  const { k } = kapitelVon(partitur, id);
  const station =
    weiter === true ? naechsteStation(pfad) : weiter || null;
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
          {marke}
        </Marke>
        <Zeilen as="h2" className="e-titel e-titel-xl" text={titel} />
        {lead ? <p className="e-text e-lead">{lead}</p> : null}
        <div className="e-knoepfe">
          <Link href={primaryCta.href} className="e-knopf e-knopf-voll">
            {primaryCta.label}
          </Link>
          <Link href="/contact/service-request" className="e-knopf">
            Request service
          </Link>
        </div>
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
