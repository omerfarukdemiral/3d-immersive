import {
  Abschnitt,
  Datenblatt,
  Kapitel,
  Liste,
  Marke,
  Weiter,
  Zeilen,
} from "@/components/erlebnis/bausteine";
import { kennzahlen } from "@/content/site";
import {
  datenraum,
  datenraumKopf,
  kopf,
  modell,
  modellKopf,
  weg,
  wegKopf,
} from "./texte";
import { partitur } from "./partitur";
import Schluss from "./Schluss";
import { JAHR_20, JAHR_30, MODELL_TAKTE } from "./zeit";
import s from "./seite.module.css";

/**
 * Text der Seite „Partner & Investoren" (Serverkomponente): alle
 * Abschnitte in der Reihenfolge der Kapitelliste (zeit.ts).
 *
 * Bühne: Auftakt mit den vier Kennzahlen, dann das Betriebsmodell als
 * Laufzeit (Jahr 0 → 20 → 30 → Repowering), dann der Datenraum mit
 * sechs versiegelten Mappen. Datenblatt: was in den Mappen liegt und wie
 * ein Gespräch abläuft. Kein Formular — das sagt die Seite selbst.
 */

const nr = (i: number) => String(i + 1).padStart(2, "0");
const takt = (ab: readonly [number, number]) => `${ab[0]} ${ab[1]}`;

/**
 * Laufzeitbalken: zwei Strecken, 0–20 (EEG-Vergütung) und 20–30
 * (Weiterbetrieb), im Verhältnis der Jahre. Jede füllt sich in genau dem
 * Takt, in dem das HUD die Jahre zählt.
 */
function Laufzeit() {
  return (
    <div className={s.laufzeit} aria-hidden="true">
      <div className={s.spuren}>
        <div className={`e-jahre-spur ${s.eeg}`}>
          <span className="e-fuellung" data-strecke={takt(JAHR_20)} />
        </div>
        <div className={`e-jahre-spur ${s.weiter}`}>
          <span className="e-fuellung" data-strecke={takt(JAHR_30)} />
        </div>
      </div>
      <div className={`tnum ${s.skala}`}>
        <span style={{ left: "0%" }}>Year 0</span>
        <span style={{ left: "66.667%" }}>Year 20</span>
        <span style={{ left: "100%" }}>Year 30</span>
      </div>
    </div>
  );
}

export default function Inhalt() {
  const [bestand, technik, ertrag, repowering] = modell;
  return (
    <>
      {/* 01 — Betriebsjahr 0 ------------------------------------------ */}
      <Kapitel partitur={partitur} id="auftakt">
        {/* Endet knapp vor der Ausfahrt (wie der Repowering-Takt): Im
            Hochformat liefe der Lead sonst beim Hinausschieben über Turm
            und Rotor. */}
        <div
          data-takt="0 0.96"
          className={`e-block e-block-breit ${s.auftakt}`}
        >
          <Marke partitur={partitur} id="auftakt">
            {partitur.name}
          </Marke>
          <Zeilen
            as="h1"
            className="e-titel e-titel-xl"
            text={kopf.titel}
            auftakt
          />
          <p className="e-text e-lead">{kopf.lead}</p>
          {/* Belegbare Zahlen zuerst. */}
          <dl className={s.zahlen}>
            {kennzahlen.map((k) => (
              <div key={k.label}>
                <dd className="tnum">
                  <span data-zahl={k.value}>{k.value}</span>
                </dd>
                <dt>{k.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Kapitel>

      {/* 02 — Laufzeit ------------------------------------------------- */}
      <Kapitel partitur={partitur} id="modell">
        <div data-takt={takt(MODELL_TAKTE.einleitung)} className="e-block">
          <Marke partitur={partitur} id="modell" />
          <h2 className="e-titel e-titel-l">{modellKopf.titel}</h2>
          <p className="e-text">{modellKopf.lead}</p>
        </div>

        <div data-takt={takt(MODELL_TAKTE.bestand)} className="e-block">
          <p className="e-etikett">
            Feature <span className="tnum">01</span> / 04
          </p>
          <h3 className="e-titel e-titel-l">{bestand.titel}</h3>
          <Laufzeit />
          <p className="e-text">{bestand.text}</p>
        </div>

        <div data-takt={takt(MODELL_TAKTE.betrieb)} className="e-block">
          <Laufzeit />
          {[technik, ertrag].map((m, i) => (
            <div
              key={m.titel}
              data-takt={i === 0 ? "0.46 1" : "0.56 1"}
              className={s.merkmal}
            >
              <p className="e-etikett">
                Feature <span className="tnum">{nr(i + 1)}</span> / 04
              </p>
              <h3 className="e-titel e-titel-m">{m.titel}</h3>
              <p className="e-text e-klein">{m.text}</p>
            </div>
          ))}
        </div>

        <div data-takt={takt(MODELL_TAKTE.repowering)} className="e-block">
          <p className="e-etikett">
            Feature <span className="tnum">04</span> / 04
          </p>
          <h3 className="e-titel e-titel-l">{repowering.titel}</h3>
          <p className="e-text">{repowering.text}</p>
        </div>
      </Kapitel>

      {/* 03 — Datenraum ------------------------------------------------ */}
      <Kapitel partitur={partitur} id="datenraum" seite="rechts">
        {/* Erst wenn die Kamera auf der anderen Seite angekommen ist:
            Beim Schwenk liegt der Turmfuß sonst kurz unter der Marke. */}
        <div data-takt="0.03 0.44" className="e-block">
          <Marke partitur={partitur} id="datenraum">
            Data room
          </Marke>
          <Zeilen
            as="h2"
            className="e-titel e-titel-l"
            text={datenraumKopf.titel}
          />
          <p className="e-text">{datenraumKopf.lead}</p>
        </div>
        {/* Die sechs Mappen, versiegelt: Titel ja, Inhalt erst unter NDA.
            Was darin liegt, beschreibt das Datenblatt darunter. */}
        <div data-takt="0.48 1" className="e-block e-block-breit">
          <p className="e-etikett">
            {datenraumKopf.titel.replace(/\.$/, "")} · Under NDA
          </p>
          <ul className={s.mappen}>
            {datenraum.map((d, i) => (
              <li
                key={d.titel}
                data-takt={`${(0.5 + i * 0.06).toFixed(2)} 1`}
                className={s.mappe}
              >
                <span className={`tnum ${s.mappeNr}`}>{nr(i)}</span>
                <span className={s.mappeTitel}>{d.titel}</span>
                <span className={s.siegel}>Under NDA</span>
              </li>
            ))}
          </ul>
        </div>
      </Kapitel>

      {/* 04 — Datenblatt ----------------------------------------------- */}
      <Datenblatt partitur={partitur} id="daten" etikett="Data sheet">
        <Abschnitt titel={datenraumKopf.titel} etikett="Data room">
          <Liste
            punkte={datenraum.map((d) => ({ titel: d.titel, text: d.text }))}
          />
        </Abschnitt>
        <Abschnitt titel={wegKopf.titel} etikett="Conversation">
          <p className="e-text">{wegKopf.lead}</p>
          <Liste punkte={weg.map((w) => ({ titel: w.schritt, text: w.text }))} />
          <Weiter href="/references">See references</Weiter>
        </Abschnitt>
      </Datenblatt>

      {/* Eigener Abspann: Telefon und E-Mail als Knöpfe (Schluss.tsx). */}
      <Schluss />
    </>
  );
}
