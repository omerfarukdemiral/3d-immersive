/**
 * Texte der Seite „Partner & Investoren" (/company/partners-investors).
 *
 * Portfolio- und Finanzkennzahlen stehen nicht auf der Seite, und das ist
 * keine Lücke: Wer eine Beteiligung prüft, bekommt sie unter NDA im
 * Datenraum und nicht aus einer öffentlichen Übersicht, die zugleich jeder
 * Wettbewerber liest. Beschrieben ist stattdessen, was im Datenraum liegt
 * und wie der Weg dorthin aussieht.
 */

export const kopf = {
  titel: "Partners & investors.",
  lead: "We acquire wind turbines once their EEG feed-in tariff ends, keep them running and develop the sites for repowering. For capital partners who invest in operating turbines.",
};

export const modellKopf = {
  titel: "The operating model.",
  lead: "Four features that define how we work as an operator.",
};

/** Die vier Merkmale des Betriebsmodells, in der Reihenfolge der Laufzeit. */
export const modell = [
  {
    titel: "Turbines in our own portfolio",
    text: "A large share of the turbines we acquire stays in our own portfolio, and we operate them ourselves. Our returns depend on how long the turbines run, just like a capital partner's.",
  },
  {
    titel: "Engineering in-house",
    text: "We handle service, maintenance and remote monitoring ourselves. With operating turbines, operating costs decide the return, and we control them with our own teams.",
  },
  {
    titel: "Two revenue streams",
    text: "Besides our own turbines, we look after third-party turbines. Operations management brings recurring revenue that depends less on power prices than generation does.",
  },
  {
    titel: "Repowering as the next step",
    text: "With our own planning office, we secure good sites beyond the end of the old turbine's life. The site is the scarce asset.",
  },
] as const;

export const datenraumKopf = {
  titel: "What's in the data room.",
  lead: "We don't publish portfolio or yield figures, because a public overview of assets and remaining lifetimes mostly helps competing bidders. Under NDA, you get the full documentation.",
};

/** Inhalt des Datenraums – beschrieben, nicht beziffert. */
export const datenraum = [
  {
    titel: "Portfolio overview",
    text: "Turbines by model, rated power and site quality, split into our own portfolio and third-party operations management. Plus total installed capacity and the breakdown by turbine class.",
  },
  {
    titel: "Age profile and remaining life",
    text: "Year of construction, status of continued-operation assessments and the remaining calculated service life of each turbine. For operating turbines, valuation hinges on this figure.",
  },
  {
    titel: "Operating cost and availability history",
    text: "Operating costs of the turbines over several years, with availability and unplanned downtime.",
  },
  {
    titel: "Revenue structure",
    text: "The split between direct marketing, operations management contracts and other revenue, each with its exposure to the spot price.",
  },
  {
    titel: "Pipeline",
    text: "Acquisitions in progress and repowering projects with their permitting status. For repowering, that includes whether land and zoning rights are secured.",
  },
  {
    titel: "Legal and collateral",
    text: "Lease and land-use agreements, easements, decommissioning obligations and how they are secured, including decommissioning bonds.",
  },
] as const;

export const wegKopf = {
  titel: "How the conversation works.",
  lead: "Four steps. A first call of about twenty minutes tells us whether the next steps make sense.",
};

export const weg = [
  {
    schritt: "First conversation",
    text: "By phone, no documents needed. We discuss ticket size, time horizon and type of investment, and tell you openly if it isn't a fit.",
  },
  {
    schritt: "Confidentiality agreement",
    text: "A short, mutual NDA. After that, you get access to portfolio, operating and yield data in the depth described above.",
  },
  {
    schritt: "Due diligence",
    text: "You review with your own advisors. Technical questions are answered by the people who look after the turbines.",
  },
  {
    schritt: "Structure and closing",
    text: "Invest in individual turbines, in project companies or as a capital partner in acquisitions. We align the structure with your investment horizon.",
  },
] as const;

export const abspann = {
  titel: "We discuss investments directly.",
  lead: "Call or write to us. In the first conversation, we find out whether working together makes sense.",
};
