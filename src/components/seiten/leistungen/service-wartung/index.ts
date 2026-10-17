/**
 * Service-Seite „Der Aufstieg" (/services/maintenance).
 *
 * Die Route unter src/app/(site)/services/[slug]/ liest von hier nur zwei
 * Dinge: die Partitur (meldet sie an der Bühne an) und den Text der
 * Seite als Serverkomponente `Kapitel` (alle Abschnitte in der
 * Reihenfolge der Kapitelliste). Metadaten und JSON-LD setzt die Route
 * aus `seo` in content/leistungen.ts.
 */
export { partitur } from "./partitur";
export { default as Kapitel } from "./Inhalt";
