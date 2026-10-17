"use client";

/**
 * Eintrag im Inhaltsverzeichnis der Datenschutzerklärung.
 *
 * Ein reiner Hash-Link legt einen History-Eintrag ohne Zustand des
 * Routers an. Wer danach auf eine andere Seite geht und mit „Zurück"
 * wiederkommt, landet auf diesem Eintrag — die Adresse stimmt, der
 * Router stellt die Seite aber nicht wieder her. Darum springt der Link
 * selbst und ersetzt nur den Hash im aktuellen Eintrag (mit dessen
 * Zustand), statt einen neuen anzulegen.
 *
 * Ohne Skript bleibt es ein gewöhnlicher Anker. Den weichen Weg zum Ziel
 * macht der geglättete Scroll der Bühne; `scroll-margin-top` in
 * recht.module.css legt die Überschrift unter die Kopfleiste.
 */
export default function Sprung({
  ziel,
  children,
}: {
  ziel: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`#${ziel}`}
      onClick={(e) => {
        /* Neuer Tab, Fenster usw.: dem Browser überlassen. */
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
          return;
        const el = document.getElementById(ziel);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ block: "start" });
        history.replaceState(history.state, "", `#${ziel}`);
        /* Tastatur: Der nächste Tab-Schritt geht vom Abschnitt aus
           weiter, wie nach einem echten Sprung. */
        const h = el.querySelector<HTMLElement>("h2");
        if (h) {
          h.tabIndex = -1;
          h.focus({ preventScroll: true });
        }
      }}
    >
      {children}
    </a>
  );
}
