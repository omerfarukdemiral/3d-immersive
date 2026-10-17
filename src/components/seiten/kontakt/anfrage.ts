/**
 * Annahme der Formularanfragen — Demo-Modus, im Browser.
 *
 * Die Seite wird statisch ausgeliefert (GitHub Pages), es gibt also
 * keinen Server. Die Eingaben werden wie im echten Betrieb geprüft,
 * versendet wird nichts. Für einen echten Einsatz hier einen
 * Formulardienst oder eine eigene API anbinden.
 */

type Anfrage = Record<string, unknown>;

const PFLICHT = [
  "anrede",
  "vorname",
  "nachname",
  "email",
  "telefon",
  "nachricht",
  "datenschutz",
];

/** Gibt eine Fehlermeldung zurück oder null, wenn die Anfrage gilt. */
export async function anfrageSenden(data: Anfrage): Promise<string | null> {
  // Honeypot: ausgefüllt heißt Bot — still „Erfolg" melden.
  if (typeof data.website === "string" && data.website.trim() !== "")
    return null;

  const fehlend = PFLICHT.filter((f) => {
    const v = data[f];
    return v === undefined || v === null || String(v).trim() === "";
  });
  if (fehlend.length > 0) return "Please fill in all required fields.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email)))
    return "Please check your email address.";

  /* Kurze Pause, damit der Zustand „wird gesendet" sichtbar bleibt. */
  await new Promise((r) => setTimeout(r, 600));
  return null;
}
