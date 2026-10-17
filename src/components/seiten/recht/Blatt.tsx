import { Marke } from "@/components/erlebnis/bausteine";
import type { Partitur } from "@/components/erlebnis/partitur";
import s from "./recht.module.css";

/**
 * Bausteine der Rechtsseiten. Wie das Datenblatt fließen sie (keine
 * feste Bühne, keine Takte), aber ohne dessen großen Einstieg aus der
 * Szene: Hier gibt es keine Szene, jeder Abschnitt ist nur ein weiterer
 * Absatz auf demselben Papier. Jeder Abschnitt ist ein Kapitel der
 * Partitur — so führen Kapitelschiene und HUD durch die Abschnitte.
 *
 * Ohne `e-fliesst`: Die Maske der Bühne wird nur für die Kapitel um
 * das aktuelle herum nachgeführt. Die Rechtsabschnitte sind so kurz,
 * dass oft drei, vier zugleich im Bild stehen — ein entfernter hätte
 * eine stehengebliebene Maske und verlöre mitten im Bild Zeilen. Auf
 * deckendem Papier leisten Säume in Papierfarbe dasselbe (`.saum`).
 */

/**
 * Rahmen einer Rechtsseite: das deckende Papier, die Blendsäume oben
 * und unten und die Leselinie (recht.module.css, `.lesen`).
 *
 * `--schiene` ist die Breite, die die Kapitelschiene rechts braucht,
 * wenn ihr längstes Etikett aufgedeckt ist — die Etiketten stehen in
 * jedem Eintrag im Fluss (nur unsichtbar), die Schiene ist also so breit
 * wie ihr längster Titel. Der Text endet links davon (recht.module.css).
 * Die Zahl ist geschätzt aus der Zeichenzahl: 10,5 px Versalien, weit
 * gesperrt (~9,2 px je Zeichen, im Browser nachgemessen), dazu Nummer,
 * Strich (aktiv 28 px breit), Abstände und gut 20 px Luft zum Text.
 */
export function Lesen({
  partitur,
  children,
}: {
  partitur: Partitur;
  children: React.ReactNode;
}) {
  const zeichen = Math.max(...partitur.kapitel.map((k) => k.titel.length));
  return (
    <div
      className={s.lesen}
      style={
        {
          "--schiene": `${Math.round(zeichen * 9.2 + 136)}px`,
        } as React.CSSProperties
      }
    >
      <div className={s.papier} aria-hidden="true" />
      <div className={s.saum} aria-hidden="true" />
      {children}
    </div>
  );
}

/** Erster Abschnitt: Marke, H1, Lead, optional mehr. */
export function Kopf({
  partitur,
  id,
  titel,
  lead,
  children,
}: {
  partitur: Partitur;
  id: string;
  titel: string;
  lead: string;
  children?: React.ReactNode;
}) {
  const k = partitur.kapitel.find((x) => x.id === id);
  return (
    <section
      id={id}
      data-kapitel={id}
      className={`${s.blatt} ${s.kopf}`}
      aria-label={k?.titel ?? titel}
    >
      <div className={s.innen}>
        <Marke partitur={partitur} id={id}>
          {partitur.name}
        </Marke>
        {/* Ohne Wort-für-Wort-Auftritt: Auf den Rechtsseiten bewegt
            sich nichts. */}
        <h1 className={`e-titel e-titel-xl ${s.titel}`}>{titel}</h1>
        <p className={`e-text e-lead ${s.lead}`}>{lead}</p>
        {children}
      </div>
    </section>
  );
}

/** Nummer eines Kapitels, wie Kapitelschiene und HUD sie zeigen. */
export function kapitelNr(partitur: Partitur, id: string) {
  const i = partitur.kapitel.findIndex((k) => k.id === id);
  return String(i + 1).padStart(2, "0");
}

/**
 * Ein Abschnitt: links Nummer und Titel (h2), rechts der Text. Die
 * Nummer ist die des Kapitels — dieselbe, die Kapitelschiene und HUD
 * gerade zeigen, sonst stünde „02" neben einem anderen „02".
 */
export function Absatz({
  partitur,
  id,
  titel,
  children,
}: {
  partitur: Partitur;
  id: string;
  titel: string;
  children: React.ReactNode;
}) {
  const ueberschrift = `${id}-titel`;
  return (
    <section
      id={id}
      data-kapitel={id}
      className={s.blatt}
      aria-labelledby={ueberschrift}
    >
      <div className={`${s.innen} ${s.abschnitt}`}>
        <div className={s.raster}>
          <div>
            <span className={`e-etikett tnum ${s.nr}`} aria-hidden="true">
              {kapitelNr(partitur, id)}
            </span>
            <h2 id={ueberschrift} className="e-titel e-titel-m">
              {titel}
            </h2>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

/** Absatztext im Abschnitt. */
export function Text({ children }: { children: React.ReactNode }) {
  return <p className={`e-text ${s.text}`}>{children}</p>;
}
