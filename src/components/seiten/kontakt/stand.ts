/**
 * Ob auf dieser Seite gerade eine Anfrage abgeschickt wurde.
 *
 * Bewusst kein React-State: Der HUD-Formatierer der Partitur läuft in
 * jedem Bild außerhalb von React und muss das nur ablesen können. Das
 * Formular setzt den Wert beim Erfolg und beim Einhängen zurück — ein
 * neuer Seitenaufruf beginnt also immer bei „noch nicht gesendet".
 */
export const anfrageStand = { gesendet: false };
