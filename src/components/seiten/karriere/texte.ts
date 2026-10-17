/**
 * Texte der Karriere-Seite (/company/careers).
 *
 * Servicetechniker sind in dieser Branche der Engpass, nicht die
 * Aufträge. Die Seite spricht deshalb Techniker an, nicht Bewerber im
 * Allgemeinen — und sagt ehrlich, was der Job bedeutet, statt ihn zu
 * bewerben.
 *
 * Zu den Stellenprofilen: Sie beschreiben die Tätigkeit, nicht eine
 * Vergütung. Eine Gehaltsspanne steht bewusst nicht da — sie wäre eine
 * Zusage, die das Unternehmen macht, nicht die Website. Vor dem Livegang
 * gleicht der Kunde ab, welche der beiden Stellen tatsächlich offen ist;
 * unverändert bleibt in jedem Fall der Hinweis auf Initiativbewerbungen.
 */

export const kopf = {
  titel: "Careers at Musterwerk Energy.",
  lead: "We are looking for service technicians who understand wind turbines and keep them running. Here, you are responsible for the turbines in your area.",
};

export const warum = {
  titel: "Working with us.",
  /**
   * Für den Takt: die drei Gründe in den kurzen Fassungen („Wie es hier
   * läuft" und die Stellenanzeige). Die vollen Absätze stehen im Datenblatt.
   */
  kurz: [
    "Short lines, same-day decisions",
    "Manufacturer-independent: more turbine models than any single manufacturer's service team sees",
    "Our own turbines in the portfolio: your work shows up directly in availability",
  ],
  absaetze: [
    "We are a small company with our own service teams, short lines of communication and same-day decisions.",
    "We work independently of any manufacturer, so you get to know more turbine models than you would in a single manufacturer's service team.",
    "Some of the turbines are our own. Their availability shows you what your work achieved.",
  ],
};

/** „Ehrlich": was der Job bedeutet, in beide Richtungen. */
export const ehrlich = [
  {
    frage: "What to expect",
    punkte: [
      "Maintenance, inspection and repair on turbines from different manufacturers",
      "Work at height, in the tower and nacelle",
      "Fault callouts, including outside the schedule",
      "Turbines 20 to 30 years old, with technology that takes experience",
    ],
  },
  {
    frage: "What we expect",
    punkte: [
      "Completed technical training, ideally electrical or mechatronics",
      "Fitness for work at height, and willingness to recertify regularly",
      "Driver's license and willingness to travel within Germany",
      "Independent work and ownership of your turbines",
    ],
  },
] as const;

export const stellenKopf = {
  titel: "Open positions.",
  lead: "Two roles, both full-time and permanent. Pay depends on qualifications and experience; we discuss it in the first conversation.",
};

export const stellen = [
  {
    titel: "Wind Turbine Service Technician",
    eckdaten: [
      { k: "Type", v: "Full-time, permanent" },
      { k: "Location", v: "Nationwide, mainly northwestern Germany" },
      { k: "Start", v: "Immediately" },
    ],
    intro:
      "You look after operating turbines from different manufacturers: scheduled maintenance, inspections and fault callouts. Because we are manufacturer-independent, you will get to know many turbine models.",
    spalten: [
      {
        kopf: "What you will do",
        punkte: [
          "Maintenance and inspection by schedule and condition",
          "Troubleshooting mechanical, hydraulic and control systems",
          "Replacing components, up to drivetrain assemblies",
          "Documenting every job with findings and a condition assessment",
        ],
      },
      {
        kopf: "What you bring",
        punkte: [
          "Completed technical training, ideally electrical or mechatronics",
          "Fitness for work at height, and willingness to recertify regularly",
          "Class B driver's license and willingness to travel",
          "Independent work and ownership of your turbines",
          "Career changers from industrial plants or marine engineering are welcome",
        ],
      },
      {
        kopf: "What we provide",
        punkte: [
          "Service vehicle and a full set of personal protective equipment",
          "Rescue-at-height and occupational safety training at our expense",
          "Manufacturer-specific training for the models you service",
          "Job scheduling with trips bundled by region",
        ],
      },
      {
        kopf: "How things work here",
        punkte: [
          "Short lines, same-day decisions",
          "Responsibility for the turbines in your area",
          "Our own turbines in the portfolio: your work shows up directly in availability",
        ],
      },
    ],
  },
  {
    titel: "Technical Specialist, Operations Management & Monitoring",
    eckdaten: [
      { k: "Type", v: "Full-time, permanent" },
      { k: "Location", v: "Musterstadt, partly remote" },
      { k: "Start", v: "Flexible" },
    ],
    intro:
      "The data from every turbine we look after comes together with you. You decide whether a fault can be reset remotely or needs a site visit.",
    spalten: [
      {
        kopf: "What you will do",
        punkte: [
          "Monitoring operating data and assessing incoming alerts",
          "Remote access and fault resets, where technically permitted",
          "Trend analysis: vibration, temperatures, power curve",
          "Operating reports for owners, coordination with grid operators and direct marketers",
        ],
      },
      {
        kopf: "What you bring",
        punkte: [
          "Technical training or a degree, ideally in energy engineering",
          "Confidence working with operating data and analysis",
          "Experience with wind energy or plant control systems is a plus",
          "Willingness to share an on-call rotation",
        ],
      },
    ],
  },
] as const;

export const abspann = {
  titel: "Open application.",
  /** Vor und nach der E-Mail-Adresse. */
  vor: "If none of these roles fits, write to us at",
  nach: ". We hire qualified technicians even when no position is advertised.",
};
