import { Marke, Zeilen } from "@/components/erlebnis/bausteine";
import type { Partitur } from "@/components/erlebnis/partitur";
import { company } from "@/content/site";
import Begleitung from "./Begleitung";
import Formular from "./Formular";
import Schluss from "./Schluss";
import { begleitTexte, begleitung, formularKopf, serviceWarnung } from "./texte";
import s from "./seite.module.css";

/**
 * Text der beiden Formularseiten — L0.
 *
 * Die Szene steht in der echten Uhrzeit still und blass dahinter, das
 * Formular liegt in voller Deckung auf einer Papierkarte. Daneben, was
 * nach dem Absenden passiert und welche Angaben die Rückfragen abkürzen.
 * Der Schluss bietet den direkten Weg an: „Lieber direkt sprechen?"
 */
export default function FormularInhalt({
  partitur,
  pfad,
  variante,
}: {
  partitur: Partitur;
  pfad: string;
  variante: "verkaufen" | "service";
}) {
  const kopf = formularKopf[variante];
  return (
    <>
      <section
        id="anfrage"
        data-kapitel="anfrage"
        className={s.kopfteil}
        aria-label={partitur.kapitel[0].titel}
      >
        {/* Die Feldzuordnung (:has) wirkt innerhalb dieser Wurzel. */}
        <div className={`e-fliesst ${s.kopfInnen} ${s.frei} ${s.wurzel}`}>
          <header className={s.formKopf}>
            <Marke partitur={partitur} id="anfrage">
              {partitur.name}
            </Marke>
            <Zeilen
              as="h1"
              className={`e-titel e-titel-xl ${s.h1}`}
              text={kopf.titel}
              auftakt
            />
            <p className="e-text e-lead">{kopf.lead}</p>
            {variante === "service" ? (
              <p className={s.warnung}>
                <span>{serviceWarnung}</span>
                <a href={company.phone.href} className="tnum">
                  {company.phone.display}
                </a>
              </p>
            ) : null}
          </header>

          <div className={s.anfrageRaster}>
            <Formular variante={variante} />
            <Begleitung variante={variante} />
          </div>
        </div>
      </section>

      <Schluss
        partitur={partitur}
        pfad={pfad}
        titel={begleitTexte.direktTitel}
        lead={begleitung[variante].schluss}
      />
    </>
  );
}
