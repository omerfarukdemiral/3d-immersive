import Link from "next/link";
import { Marke, Zeilen } from "@/components/erlebnis/bausteine";
import { nachweise } from "@/app/(site)/company/standards/inhalt";
import { company } from "@/content/site";
import Formular from "./Formular";
import { partiturKontakt as partitur } from "./partitur";
import Schluss from "./Schluss";
import { kontakt } from "./texte";
import s from "./seite.module.css";

/**
 * Text von /contact — „Jetzt" · L0.
 *
 * Links der große Titel und die direkten Wege, die Telefonnummer in der
 * größten Schrift der Seite: Wer anruft, ist am schnellsten. Rechts auf
 * einer Papierkarte die beiden Richtungen, für die es eigene Formulare
 * gibt. Darunter die allgemeine Anfrage — der Fuß der Seite
 * verweist hierher, ein Formular muss es also geben. Es fragt die
 * Anlagendaten bewusst nicht ab.
 *
 * Kein Takt: Bei L0 fließt der Text, die Szene steht in der echten
 * Uhrzeit dahinter.
 */
export default function KontaktInhalt() {
  const osm = `https://www.openstreetmap.org/?mlat=${company.address.lat}&mlon=${company.address.lng}#map=15/${company.address.lat}/${company.address.lng}`;
  return (
    <>
      {/* 01 — Jetzt ------------------------------------------------- */}
      <section
        id="jetzt"
        data-kapitel="jetzt"
        className={s.kopfteil}
        aria-label={partitur.kapitel[0].titel}
      >
        <div className={`e-fliesst ${s.kopfInnen} ${s.zweispaltig}`}>
          <div className={s.links}>
            <Marke partitur={partitur} id="jetzt">
              {partitur.name}
            </Marke>
            <Zeilen
              as="h1"
              className={`e-titel e-titel-xl ${s.h1}`}
              text={kontakt.titel}
              auftakt
            />
            <p className="e-text e-lead">{kontakt.lead}</p>

            <h2 className={`e-etikett ${s.direktTitel}`}>{kontakt.direkt}</h2>
            <dl className={s.direkt}>
              <div className={s.telefonZeile}>
                <dt>Phone</dt>
                <dd>
                  <a href={company.phone.href} className={`tnum ${s.telefon}`}>
                    {company.phone.display}
                  </a>
                </dd>
              </div>
              <div>
                <dt>WhatsApp</dt>
                <dd>
                  <a
                    href={company.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Send a message
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
                <dt>Address</dt>
                <dd>
                  <address className={s.adresse}>
                    {company.legalName}
                    <br />
                    {company.address.street}
                    <br />
                    {company.address.zip} {company.address.city}
                    <br />
                    {company.address.country}
                  </address>
                  <a
                    href={osm}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={s.karteLink}
                  >
                    {kontakt.osm}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div className={s.rechts}>
            <div className={`${s.karte} ${s.wege}`}>
              <h2 className="e-etikett">{kontakt.wegeTitel}</h2>
              {kontakt.wege.map((w) => (
                <Link key={w.href} href={w.href} className={s.weg}>
                  <h3 className={`e-titel e-titel-m ${s.wegTitel}`}>
                    {w.titel}
                  </h3>
                  <p className={s.kartenText}>{w.text}</p>
                  <span className={s.wegCta}>
                    {w.cta}
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 02 — Allgemeine Anfrage ------------------------------------- */}
      {/* Kein Datenblatt auf Papier: Die Seite folgt der echten Uhrzeit,
          und nachts stünde helles Papier unter heller Kopfleiste. Das
          Formular liegt stattdessen selbst auf einer Papierkarte. */}
      <section
        id="anfrage"
        data-kapitel="anfrage"
        className={s.folgeteil}
        aria-label={kontakt.allgemein.titel}
      >
        <div className={`e-fliesst ${s.kopfInnen} ${s.frei} ${s.nah}`}>
          <header className={s.formKopf}>
            <Marke partitur={partitur} id="anfrage">
              {partitur.kapitel[1].titel}
            </Marke>
            <h2 className="e-titel e-titel-l">{kontakt.allgemein.titel}</h2>
            <p className="e-text e-lead">{kontakt.allgemein.lead}</p>
          </header>
          <div className={s.anfrageRaster}>
            <Formular variante="allgemein" nachweise={nachweise} />
            <aside className={s.begleitung} aria-label={kontakt.wann.titel}>
              <div>
                <h3 className={s.spaltenTitel}>{kontakt.wann.titel}</h3>
                <p className={s.spaltenText}>{kontakt.wann.text}</p>
                <p className={`${s.spaltenText} ${s.eilig}`}>
                  {kontakt.wann.eilig}
                </p>
              </div>
              <div className={s.direktKlein}>
                <a href={company.phone.href} className={`tnum ${s.telefonKlein}`}>
                  {company.phone.display}
                </a>
                <div className={s.nebenwege}>
                  <a href={company.whatsapp.href}>{company.whatsapp.display}</a>
                  <a href={company.email.href}>{company.email.display}</a>
                </div>
              </div>
              <p className={s.leise}>
                How we handle your details is explained in our{" "}
                <Link href="/privacy" className={s.verweis}>
                  privacy policy
                </Link>
                .
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* 03 — Weiter zur Startseite ---------------------------------- */}
      <Schluss partitur={partitur} pfad="/contact" />
    </>
  );
}
