/**
 * Texte der Kontaktseiten (/contact, /contact/sell-your-turbine,
 * /contact/service-request) — die einzige Fassung.
 *
 * Mit [NEU] markiert ist die Warnzeile über dem Serviceformular.
 */

export type Variante = "verkaufen" | "service" | "allgemein";

/** Name eines Formularfelds — Ziel der Zuordnung „kürzt die Rückfragen ab". */
type Feld = "anlagentyp" | "leistung" | "baujahr" | "standort" | "nachricht";

export const kontakt = {
  titel: "How to reach us.",
  lead: "By form, phone, email or WhatsApp. Your inquiry goes straight to our team in Musterstadt, the people who look after the turbines.",
  direkt: "Reach us directly",
  osm: "View on OpenStreetMap",
  wegeTitel: "Send an inquiry",
  wege: [
    {
      titel: "Sell your turbine",
      text: "You want to sell a wind turbine: post-EEG, shut down or still running.",
      href: "/contact/sell-your-turbine",
      cta: "Go to the sales form",
    },
    {
      titel: "Request service",
      text: "You need maintenance, a repair or a technical assessment of your turbine.",
      href: "/contact/service-request",
      cta: "Go to the service form",
    },
  ],
  allgemein: {
    titel: "General inquiry.",
    lead: "For everything else, such as investments, sites or working together.",
  },
  wann: {
    titel: "When you'll hear from us",
    text: "We usually reply to form inquiries on the next business day, by phone or email, whichever you prefer.",
    eilig:
      "If a turbine is down or the matter is urgent for another reason, call us directly.",
  },
} as const;

/** Kopf der beiden Formularseiten (bisher PageHero). */
export const formularKopf = {
  verkaufen: {
    titel: "Offer your turbine for sale.",
    lead: "For a first assessment, we only need the turbine model, rated output, year of construction and location. You'll hear from us shortly whether an acquisition is an option.",
  },
  service: {
    titel: "Request service for your turbine.",
    lead: "Maintenance, repair or a technical assessment: briefly describe the situation. We'll get back to you with a first take.",
  },
} as const;

/** [NEU]: eine Zeile über dem Serviceformular. */
export const serviceWarnung = "If your turbine is down, please call us directly.";

/**
 * Begleitung neben dem Formular. `feld` ordnet jeden Punkt dem Feld zu,
 * in das die Angabe gehört — fokussiert man das Feld, hebt sich der
 * Punkt hervor (seite.module.css, :has). Was kein eigenes Feld hat,
 * gehört in die Nachricht.
 */
export const begleitung = {
  verkaufen: {
    ablauf: [
      {
        titel: "Callback",
        text: "We review your details and call you back, usually on the next business day.",
      },
      {
        titel: "First assessment",
        text: "In the first call, we tell you whether the turbine is a fit for us. Even when the answer is no.",
      },
      {
        titel: "Valuation",
        text: "Next, we review operating data and maintenance history, with a site visit if needed.",
      },
    ],
    hilfreich: {
      titel: "Helpful details",
      punkte: [
        { text: "Manufacturer, model and rated output", feld: ["anlagentyp", "leistung"] },
        { text: "Year of construction and date of last maintenance", feld: ["baujahr"] },
        { text: "Location (the municipality is enough)", feld: ["standort"] },
        { text: "Whether the turbine still receives an EEG feed-in tariff", feld: ["nachricht"] },
        {
          text: "Who owns the land and how long the land lease runs",
          feld: ["nachricht"],
        },
      ] satisfies { text: string; feld: Feld[] }[],
    },
    schluss:
      "Your inquiry is non-binding. We do not share your details with third parties.",
  },
  service: {
    ablauf: [
      {
        titel: "Callback",
        text: "We call you back, on the same day if your turbine is down.",
      },
      {
        titel: "Diagnosis",
        text: "Often we can tell on the phone what the problem is and whether it needs a site visit or can be fixed remotely.",
      },
      {
        titel: "Appointment or quote",
        text: "For a one-off job, you get an appointment. For ongoing support, a quote with a maintenance schedule.",
      },
    ],
    hilfreich: {
      titel: "Helpful details",
      punkte: [
        { text: "Manufacturer, model and year of construction", feld: ["nachricht"] },
        { text: "Controller error message, if any", feld: ["nachricht"] },
        { text: "When the issue started", feld: ["nachricht"] },
        { text: "Who has maintained the turbine so far", feld: ["nachricht"] },
        { text: "Whether the turbine is down or running at reduced output", feld: ["nachricht"] },
      ] satisfies { text: string; feld: Feld[] }[],
    },
    schluss:
      "If your turbine is down, please call us directly. Every hour of downtime costs revenue.",
  },
} as const;

export const begleitTexte = {
  ablaufTitel: "What happens next",
  freiwillig:
    "Missing some of these details? Send the form anyway. All of them are optional.",
  direktTitel: "Prefer to talk directly?",
};
