"use client";

import { anfrageSenden } from "./anfrage";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { company } from "@/content/site";
import { anfrageStand } from "./stand";
import type { Variante } from "./texte";
import s from "./seite.module.css";

/**
 * Anfrageformular in Erlebnis-Gestaltung.
 *
 * Fachlich dasselbe wie src/components/forms/AnfrageFormular.tsx:
 * gleiche Felder und Namen, gleiche Pflichtfelder, Honeypot „website",
 * Prüfung und (Demo-)Versand in anfrage.ts, mit `variante`. „verkaufen" fragt
 * zusätzlich die vier Anlagendaten ab — eine Verkaufsanfrage ohne Typ,
 * Leistung, Baujahr und Standort beginnt bei der Rückfrage bei null.
 * „allgemein" fragt sie bewusst nicht ab.
 *
 * Neu ist nur die Gestalt (Papierkarte, Tinte, Signalrot statt Blau)
 * und dass ein Erfolg auch im HUD ankommt (stand.ts → Partitur).
 */

const anreden = ["Mr.", "Ms.", "Prefer not to say"];

/** Ein Dokument, das sich über `?nachweis=<schluessel>` anfordern lässt. */
type Vorlage = { readonly schluessel: string; readonly titel: string };

export default function Formular({
  variante,
  nachweise = [],
}: {
  variante: Variante;
  /** Whitelist für `?nachweis=` (Standards, „Anfordern →"). */
  nachweise?: readonly Vorlage[];
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">(
    "idle",
  );
  const [fehler, setFehler] = useState("");
  const nachricht = useRef<HTMLTextAreaElement>(null);

  /* „Anfordern →" auf /company/standards verlinkt hierher mit
     ?nachweis=<schluessel>. Die Nachricht wird dann mit dem Titel des
     Dokuments vorbelegt — nur für bekannte Schlüssel, und nur solange
     das Feld leer ist. Im Browser gelesen statt über searchParams, damit
     die Seite statisch bleibt. */
  useEffect(() => {
    const feld = nachricht.current;
    if (!feld || feld.value) return;
    const schluessel = new URLSearchParams(window.location.search).get("nachweis");
    const n = nachweise.find((v) => v.schluessel === schluessel);
    if (n) feld.value = `Document request: ${n.titel}`;
  }, [nachweise]);

  /* Neue Seite, neues Formular: Das HUD beginnt wieder bei der Uhrzeit. */
  useEffect(() => {
    anfrageStand.gesendet = false;
    return () => {
      anfrageStand.gesendet = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setFehler("");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const meldung = await anfrageSenden({ ...data, variante });
      if (meldung) throw new Error(meldung);
      anfrageStand.gesendet = true;
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setFehler(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  if (status === "ok") {
    /* data-gesendet: Die Begleitung daneben hebt Schritt 01 hervor
       (seite.module.css, :has) — ohne weiteres Skript. */
    return (
      <div className={s.karte} data-gesendet="" role="status">
        <p className={`e-etikett ${s.signal}`}>Inquiry received</p>
        <h2 className={`e-titel e-titel-m ${s.kartenTitel}`}>
          Thank you. We&apos;ll be in touch.
        </h2>
        <p className={s.kartenText}>
          We&apos;ll review your details and get back to you shortly. If it&apos;s
          urgent, call us directly at{" "}
          <a href={company.phone.href} className={`tnum ${s.verweis}`}>
            {company.phone.display}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`${s.karte} ${s.formular}`}>
      <div className={s.felder}>
        <div className={s.breit}>
          <label className={s.label} htmlFor="anrede">
            Title *
          </label>
          <select
            id="anrede"
            name="anrede"
            required
            className={s.feld}
            defaultValue=""
          >
            <option value="" disabled>
              Please select
            </option>
            {anreden.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={s.label} htmlFor="vorname">
            First name *
          </label>
          <input
            id="vorname"
            name="vorname"
            required
            autoComplete="given-name"
            className={s.feld}
          />
        </div>
        <div>
          <label className={s.label} htmlFor="nachname">
            Last name *
          </label>
          <input
            id="nachname"
            name="nachname"
            required
            autoComplete="family-name"
            className={s.feld}
          />
        </div>
        <div>
          <label className={s.label} htmlFor="email">
            Email *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={s.feld}
          />
        </div>
        <div>
          <label className={s.label} htmlFor="telefon">
            Phone *
          </label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            required
            autoComplete="tel"
            className={s.feld}
          />
        </div>

        {variante === "verkaufen" && (
          <>
            <div className={`${s.breit} ${s.gruppe}`}>
              <p className="e-etikett">Turbine details</p>
              <p className={s.hinweis}>
                These four details let us assess whether an acquisition is an
                option.
              </p>
            </div>
            <div>
              <label className={s.label} htmlFor="anlagentyp">
                Turbine model / manufacturer
              </label>
              <input
                id="anlagentyp"
                name="anlagentyp"
                placeholder="e.g. NEG Micon NM60"
                className={s.feld}
              />
            </div>
            <div>
              <label className={s.label} htmlFor="leistung">
                Rated output
              </label>
              <input
                id="leistung"
                name="leistung"
                placeholder="e.g. 1,000 kW"
                className={s.feld}
              />
            </div>
            <div>
              <label className={s.label} htmlFor="baujahr">
                Year built / commissioned
              </label>
              <input
                id="baujahr"
                name="baujahr"
                inputMode="numeric"
                placeholder="e.g. 2001"
                className={s.feld}
              />
            </div>
            <div>
              <label className={s.label} htmlFor="standort">
                Location (postcode / district)
              </label>
              <input
                id="standort"
                name="standort"
                placeholder="e.g. 12345 Musterstadt"
                className={s.feld}
              />
            </div>
          </>
        )}

        <div className={s.breit}>
          <label className={s.label} htmlFor="nachricht">
            Message *
          </label>
          <textarea
            ref={nachricht}
            id="nachricht"
            name="nachricht"
            required
            rows={5}
            className={`${s.feld} ${s.nachricht}`}
          />
        </div>
      </div>

      {/* Honeypot – für Menschen unsichtbar, für einfache Bots verlockend */}
      <div aria-hidden="true" className={s.honigtopf}>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <label className={s.einwilligung}>
        <input type="checkbox" name="datenschutz" required />
        <span>
          I consent to the processing of the data I have entered, as
          described in the{" "}
          <Link href="/privacy" className={s.verweis}>
            privacy policy
          </Link>
          . *
        </span>
      </label>

      {status === "error" && (
        <div role="alert" className={s.fehler}>
          <p className={s.fehlerTitel}>{fehler}</p>
          <p>
            Please call us at{" "}
            <a href={company.phone.href} className={`tnum ${s.verweis}`}>
              {company.phone.display}
            </a>{" "}
            or email{" "}
            <a href={company.email.href} className={s.verweis}>
              {company.email.display}
            </a>
            .
          </p>
        </div>
      )}

      <div className={s.absenden}>
        <button
          type="submit"
          disabled={status === "sending"}
          className="e-knopf e-knopf-voll"
        >
          {status === "sending" ? "Sending …" : "Send inquiry"}
        </button>
        <p className={s.pflicht}>* Required field</p>
      </div>
    </form>
  );
}
