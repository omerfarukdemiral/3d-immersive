/**
 * Inhalt der Standards-Seite (/company/standards).
 *
 * Deckungssummen und Zertifikatsnummern stehen bewusst nicht auf der
 * Seite: Sie ändern sich mit jeder Policenverlängerung, und eine Zahl im
 * Fließtext einer Website ist ohnehin kein Nachweis. Stattdessen steht
 * hier, welches Dokument es zu einem Punkt gibt und dass es vor der
 * Unterschrift auf dem Tisch liegt — das ist prüfbar, die Zahl nicht.
 *
 * Eigene Datei statt in page.tsx: Die Partitur zählt mit denselben Listen
 * (HUD „Nachweis n/6", Takte je Vorschrift), und beide sollen nie
 * auseinanderlaufen.
 */

export const kopf = {
  titel: "Standards & safety.",
  lead: "Occupational safety, insurance and documentation: what to check with any technical service provider, and the proof we put in front of you.",
};

export const punkteKopf = {
  titel: "Four things to settle before you sign.",
  lead: "They apply to every provider of service and operations management. Ask for proof on each one.",
};

/**
 * Die vier Punkte. `nachweise`: Nummern (1-basiert) der Nachweise unten,
 * die der Punkt selbst anspricht — „Rettungskonzept", „Prüfprotokolle",
 * „Deckungssumme", „Wartungshistorie". Daran zählt das HUD hoch.
 */
export const felder = [
  {
    titel: "Work at height",
    text: "Maintaining a wind turbine means working 60 to 140 meters up. The rules require regular safety training, inspected personal protective equipment and a rescue plan in case someone is incapacitated inside the tower.",
    pruefen:
      "Ask for the written rescue plan and how often it is drilled.",
    nachweise: [1, 2],
  },
  {
    titel: "Electrical systems",
    text: "Medium voltage, converter, transformer station: only qualified electricians may work on them. Portable electrical equipment is inspected at fixed intervals under DGUV Regulation 3.",
    pruefen:
      "The proof is an inspection report with date and inspector.",
    nachweise: [3],
  },
  {
    titel: "Insurance coverage",
    text: "When working on someone else's turbine, the service provider is liable for any damage it causes. What matters is the limit of its business liability policy and whether damage to the object being worked on is covered.",
    pruefen:
      "A drivetrain failure quickly exceeds a low coverage limit.",
    nachweise: [4],
  },
  {
    titel: "Documentation",
    text: "Every job comes with a report: what was inspected and replaced, and what condition the turbine was in. That history counts later, in the continued-operation assessment, in an insurance claim and in a sale.",
    pruefen:
      "A complete maintenance history raises the turbine's value when you sell.",
    nachweise: [5],
  },
] as const;

export const nachweiseKopf = {
  titel: "Proof before you sign.",
  lead: "Coverage limits and inspection dates change with every renewal, so we list the documents themselves. You can request any of them, even without an open inquiry.",
  schluss:
    "If a document you need is missing from this list, ask for it.",
};

/**
 * Dokumente, die ein Betreiber anfordern kann. Keine Zahlen, keine
 * Urkundennummern – beides gehört in die Anlage zum Angebot, nicht auf
 * eine Seite, die niemand aktualisiert, wenn die Police verlängert wird.
 *
 * Reihenfolge = Reihenfolge, in der die vier Punkte oben sie ansprechen
 * (Höhe → Elektrik → Versicherung → Dokumentation), damit „Nachweis n/6"
 * im HUD und die Nummer der Karte im Datenblatt dasselbe meinen. Der
 * Referenzbetreiber kommt in keinem Punkt vor und steht deshalb am Ende.
 * `schluessel`: Kennung für die Anfrage (?nachweis=…).
 */
export const nachweise = [
  {
    schluessel: "rettungskonzept",
    titel: "Rescue plan",
    text: "How an injured person is recovered from the nacelle or tower: in writing, with the equipment named and the drill interval set.",
  },
  {
    schluessel: "qualifikation",
    titel: "Technician qualifications",
    text: "Certificates of fitness for work at height, fall-protection PPE training, and qualified-electrician status for colleagues who work on live equipment.",
  },
  {
    schluessel: "pruefprotokolle",
    titel: "Electrical equipment inspection reports",
    text: "Periodic inspections under DGUV Regulation 3, with inspection date and inspector. You receive the report from the most recent inspection.",
  },
  {
    schluessel: "betriebshaftpflicht",
    titel: "Business liability insurance",
    text: "Certificate of insurance stating the coverage limit and whether damage to the object being worked on is included. Without it, damage caused during drivetrain work is not covered.",
  },
  {
    schluessel: "einsatzprotokolle",
    titel: "Maintenance and service reports",
    text: "A sample of the report you receive after every job: components inspected, findings, parts replaced, condition. It shows you up front how we document.",
  },
  {
    schluessel: "referenzbetreiber",
    titel: "Reference operator",
    text: "An introduction to an operator with a comparable turbine, if they agree. We never share a client relationship without consent.",
  },
] as const;

export const rahmenKopf = {
  titel: "Legal and technical framework.",
  lead: "These standards and regulations govern work on wind turbines. Use them to check whether a quote covers everything it should.",
};

/**
 * Öffentlich geltende Vorschriften – Aussagen über die Branche, nicht
 * über uns. Reihenfolge wie im Konzept:
 * an der Anlage von oben nach unten, dann die Anlage als Ganzes, zuletzt
 * der Standort. `stift`: Kurzname am Bauteil der Zeichnung (Konzept).
 */
export const rechtsrahmen = [
  {
    norm: "DIN EN 50308",
    stift: "DIN EN 50308",
    text: "Safety requirements for wind turbine design, operation and maintenance, including climb assists, escape routes and workplaces in the nacelle.",
  },
  {
    norm: "DGUV Rule 112-198 / 112-199",
    stift: "DGUV Rule 112-198/199",
    text: "Use of fall-protection PPE and rescue from heights and depths. This creates the duty to train staff, use inspected equipment and keep a drilled rescue plan.",
  },
  {
    norm: "DGUV Regulation 3",
    stift: "DGUV Regulation 3",
    text: "Governs the inspection and operation of electrical systems and equipment. It sets who may work on them and how often they are inspected.",
  },
  {
    norm: "Continued-operation assessment (DIBt guideline)",
    stift: "Continued operation (DIBt)",
    text: "Once the calculated design life (usually 20 years) has passed, continued operation must be justified by an expert assessment. Without it, the turbine may not keep running.",
  },
  {
    norm: "Industrial Safety Regulation (BetrSichV)",
    stift: "BetrSichV",
    text: "Requires the operator to assess work equipment before use and set inspection intervals. Responsibility stays with the operator, even when a service provider does the work.",
  },
  {
    norm: "§ 16b BImSchG",
    stift: "§ 16b BImSchG",
    text: "A simplified procedure for replacing existing turbines under the Federal Immission Control Act: only the change from the existing setup is reviewed. The basis of every repowering project.",
  },
] as const;

export const abspann = {
  titel: "Request the documents.",
  lead: "We send you the paperwork before you sign.",
};

/* ------------------------------------------------------------------ */
/* Takte — gemeinsam für Text (page.tsx) und Partitur                  */
/* ------------------------------------------------------------------ */

/** Takt eines der vier Punkte: [von, bis] in der festen Strecke. */
export const punktTakt = (i: number): [number, number] => [
  0.02 + i * 0.25,
  i === 3 ? 1 : 0.22 + i * 0.25,
];

/**
 * Einleitung des Rahmens. Lang genug, dass die wortweise gesetzte
 * Überschrift (WORT ≈ 0,12 der Strecke herein, ebenso lang hinaus)
 * vollständig steht, bevor sie wieder geht — bei 0–0.12 begann der
 * Abgang, ehe das letzte Wort angekommen war.
 */
export const rahmenEinleitung: [number, number] = [0, 0.24];

/** Takt einer Vorschrift; davor steht die Einleitung. */
export const rahmenTakt = (i: number): [number, number] => [
  0.27 + i * 0.122,
  i === 5 ? 1 : 0.372 + i * 0.122,
];

export const taktText = ([a, b]: [number, number]) =>
  `${a.toFixed(3)} ${b.toFixed(3)}`;
