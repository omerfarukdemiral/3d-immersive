import Link from "next/link";
import { begleitTexte, begleitung } from "./texte";
import s from "./seite.module.css";

/**
 * Begleitspalte neben dem Formular (bisher AnfrageSeitenleiste).
 *
 * Ein Formular allein beantwortet die beiden Fragen nicht, die jemanden
 * vor dem Absenden zögern lassen: Was passiert mit meinen Angaben, und
 * worauf lasse ich mich ein? Deshalb stehen hier der weitere Ablauf und
 * die Angaben, die das Gespräch abkürzen. Der direkte Weg (Telefon,
 * WhatsApp, E-Mail) steht im Schluss der Seite, beim Service zusätzlich
 * über dem Formular.
 *
 * Die drei Schritte sind dieselben, die das HUD nach dem Absenden
 * zählt („Schritt 1/3 · Rückmeldung").
 */
export default function Begleitung({
  variante,
}: {
  variante: "verkaufen" | "service";
}) {
  const i = begleitung[variante];
  return (
    <aside className={s.begleitung} aria-label={begleitTexte.ablaufTitel}>
      <div>
        <h2 className={s.spaltenTitel}>{begleitTexte.ablaufTitel}</h2>
        <ol className={s.ablauf}>
          {i.ablauf.map((a, n) => (
            <li key={a.titel} data-schritt={n + 1}>
              <span className={`tnum ${s.ablaufNr}`}>
                {String(n + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className={s.ablaufTitel}>{a.titel}</h3>
                <p className={s.ablaufText}>{a.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className={s.hilfreich}>
        <h2 className={s.spaltenTitel}>{i.hilfreich.titel}</h2>
        <ul className={s.punkte}>
          {i.hilfreich.punkte.map((p) => (
            <li key={p.text} data-feld={p.feld.join(" ")}>
              <span aria-hidden="true" className={s.strich} />
              {p.text}
            </li>
          ))}
        </ul>
        <p className={s.leise}>{begleitTexte.freiwillig}</p>
      </div>

      <p className={s.leise}>
        How we handle your details is explained in our{" "}
        <Link href="/privacy" className={s.verweis}>
          privacy policy
        </Link>
        .
      </p>
    </aside>
  );
}
