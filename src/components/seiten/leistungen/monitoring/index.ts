/**
 * Monitoring & Fernüberwachung (/services/monitoring): „Eine Nacht", L3.
 *
 * Schnittstelle zur gemeinsamen Route `(site)/services/[slug]`: Jede
 * Leistung liefert ihre Partitur und eine Serverkomponente mit allem
 * Text (Kapitel). Die Route meldet die Partitur an, rendert den Text und
 * setzt Metadaten und JSON-LD.
 */
export { partitur } from "./partitur";
export { default as Kapitel } from "./Kapitel";
