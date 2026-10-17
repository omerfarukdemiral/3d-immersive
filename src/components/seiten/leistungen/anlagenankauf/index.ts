/**
 * Ankauf von Altanlagen (/services/acquisition).
 *
 * Schnittstelle zur gemeinsamen Route `(site)/services/[slug]`: Jede
 * Leistung liefert ihre Partitur und eine Serverkomponente mit allem
 * Text (Kapitel). Die Route meldet die Partitur an und rendert den Text.
 */
export { partitur } from "./partitur";
export { default as Kapitel } from "./Kapitel";
