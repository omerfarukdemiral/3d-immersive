import type { Metadata } from "next";
import Link from "next/link";
import {
  Abspann,
  Auftakt,
  Kapitel,
  Marke,
  Weiter,
} from "@/components/erlebnis/bausteine";
import { wissenPartitur as partitur } from "@/components/seiten/wissen/partitur";
import {
  auftaktTakt,
  beitragTakte,
  paragraf,
} from "@/components/seiten/wissen/takte";
import s from "@/components/seiten/wissen/seite.module.css";
import { artikel } from "@/content/wissen";
import Buehne from "./Buehne";

/**
 * /insights — „Lesemodus" (L2).
 *
 * Abendlicht. Drei Beiträge als drei Wege: jeder ein Takt mit Kicker,
 * Titel, Teaser und Lesezeit, und die Szene zeigt im Vorbeigehen das
 * Bild, in dem der Beitrag selbst stehen bleibt. HUD: „BEITRAG 1/3".
 */

export const metadata: Metadata = {
  title: "Insights: Post-EEG, Repowering and Decommissioning",
  description:
    "Articles for wind turbine operators: options after the EEG feed-in tariff ends, repowering under § 16b BImSchG and the decommissioning obligation.",
  alternates: { canonical: "/insights" },
};

export default function WissenSeite() {
  return (
    <>
      <Buehne />

      <Kapitel partitur={partitur} id="wege">
        <Auftakt
          partitur={partitur}
          kapitel="wege"
          takt={auftaktTakt.join(" ")}
          titel="Know-how for operators."
          lead="Post-EEG, repowering and the decommissioning obligation: articles on the decisions where details determine profitability and liability."
        />
        {artikel.map((a, i) => (
          <article
            key={a.slug}
            data-takt={beitragTakte[i].join(" ")}
            className="e-block e-block-breit"
          >
            <Marke
              partitur={partitur}
              id="wege"
              angabe={`Article ${i + 1}/${artikel.length}`}
            >
              {a.kicker}
            </Marke>
            <h2 className={`e-titel e-titel-l ${s.beitragTitel}`}>
              <Link href={`/insights/${a.slug}`} className={s.beitragLink}>
                {paragraf(a.title)}
              </Link>
            </h2>
            <p className="e-text e-lead">{paragraf(a.teaser)}</p>
            <Weiter href={`/insights/${a.slug}`}>
              {a.readingMinutes} min read
            </Weiter>
          </article>
        ))}
      </Kapitel>

      <Abspann
        partitur={partitur}
        pfad="/insights"
        titel="Get your turbine assessed."
        lead="We look at your turbine and tell you which option makes economic sense in your case."
      />
    </>
  );
}
