/**
 * Texte der Referenzseite. Sie liegen getrennt vom JSX, weil Bühne
 * (Takte) und Datenblatt dieselben Sätze an zwei Stellen brauchen.
 *
 * Bewusst weggelassen: der Satz „Zusammen … Anlagen und Projekte"
 * mit der Summe der Kennzahlen. Die Bereiche überschneiden sich (eine
 * Anlage im Eigenbestand steht auch im Monitoring), die Summe zählt also
 * doppelt.
 */

export const kopf = {
  titel: "Our wind projects at a glance.",
  lead: "We run our own turbines and look after other operators' turbines with service, monitoring and planning. Across Germany, from our headquarters in Musterstadt.",
};

export const zahlenKopf = {
  titel: "Current figures.",
  text: "Turbines in our care as of today. One turbine can count in more than one area, for example in our own portfolio and in monitoring.",
};

/** Vier Arten, an einer Anlage zu arbeiten (vormals Bildkarten). */
export const bereicheKopf = "Our project areas.";
export const bereiche = [
  {
    titel: "Monitoring & operations",
    text: "Round-the-clock turbine monitoring, remote maintenance and operating data analysis. The goal: high availability and early fault detection for higher energy yields.",
    href: "/services/monitoring",
  },
  {
    titel: "Service & maintenance",
    text: "Repairs, inspections and technical work by our own mobile service teams across Germany.",
    href: "/services/maintenance",
  },
  {
    titel: "Our own turbines",
    text: "The turbines we operate ourselves are our test bed and our showcase. What we prove there in maintenance and operation, we apply to client turbines too.",
    href: "/company",
  },
  {
    titel: "Project development & planning",
    text: "From site assessment through permitting to grid connection: our planning office gets projects onto the grid on sound economics.",
    href: "/services/planning-repowering",
  },
] as const;

export const lagenKopf = {
  titel: "Typical starting points.",
  lead: "We don't name our clients' turbines. What happens at a turbine belongs to its owner. These are the situations we see again and again with operating turbines.",
};

/** Die wiederkehrenden Konstellationen im Bestandsanlagengeschäft. */
export const ausgangslagen = [
  {
    titel: "EEG feed-in tariff ends",
    lage: "After 20 years the turbine loses its EEG (Renewable Energy Sources Act) tariff. It still runs fine, but market revenue no longer covers its current operating costs.",
    vorgehen:
      "We model three options side by side: continued operation at lower cost, sale to us, or decommissioning. The inputs are the continued-operation assessment, remaining service life and the size of the decommissioning bond.",
    messbar:
      "One result per option, calculated over the same term. If running the turbine yourself makes more economic sense, we tell you.",
  },
  {
    titel: "Drivetrain anomalies",
    lage: "Vibration, oil temperature or particle count are outside normal ranges. The current service provider reports a finding without context, and a major gearbox failure can cost half a year's yield.",
    vorgehen:
      "We analyze operating data and maintenance history, order an endoscopy and oil analysis, then decide: monitor, repair or replace. Until then, the turbine runs under close remote monitoring.",
    messbar:
      "A dated finding with a recommendation, plus a cost comparison of both options before anything is taken apart.",
  },
  {
    titel: "No more service for the model",
    lage: "The manufacturer has discontinued the model or no longer exists. Spare parts are hard to source, and with every fault it is unclear who will show up.",
    vorgehen:
      "We take over maintenance independently of the manufacturer: an on-site survey, a maintenance plan based on actual condition and a spare-parts supply for critical components.",
    messbar:
      "Annual availability and the time from fault report to restart. Both figures appear in the operating report.",
  },
  {
    titel: "A site with repowering potential",
    lage: "An older, smaller turbine stands on a site that could carry many times the capacity today. The hurdles are zoning law, setback distances and grid connection, and there is no in-house time for a permitting process.",
    vorgehen:
      "Site and economic assessment, then the procedure under § 16b BImSchG, which reviews only the change from the existing setup. Plus technical design, grid connection planning and coordination with authorities and landowners.",
    messbar:
      "Expected annual yield of the new turbine versus the existing one, with all assumptions disclosed, plus a dated status of the permitting process.",
  },
] as const;

export const vermittlung =
  "Want to talk to an operator who handed a comparable turbine over to us? We will make the introduction, if the operator agrees.";

export const einsatzKopf = {
  titel: "From Musterstadt, across Germany.",
  lead: "How we organize service and operations management over long distances.",
  /* Bildunterschrift der Karte. */
  karte:
    "Headquarters in Musterstadt. Service, operations management and planning nationwide.",
};

/**
 * Was „deutschlandweit" organisatorisch bedeutet. Reihenfolge: erst die Ferne, dann die Fahrt, dann die
 * Teams — so folgt die Karte dem Weg einer Störung.
 */
export const einsatz = [
  {
    id: "ferne",
    titel: "Remote diagnosis first",
    text: "We assess every fault through remote monitoring first. If it can be reset remotely, the turbine restarts without a team on the road.",
  },
  {
    id: "fahrt",
    titel: "Jobs bundled by region",
    text: "We group jobs by region and combine them with scheduled maintenance. That keeps even distant sites economical to serve, from Mecklenburg to the Lower Rhine.",
  },
  {
    id: "teams",
    titel: "Our own service teams",
    text: "Our technicians are our own employees. So we confirm appointments ourselves and never pass jobs on to subcontractors.",
  },
] as const;

export const standorte =
  "We don't show individual turbine sites. They belong to their operators.";

export const schluss = {
  titel: "Talk to us about your turbine.",
  lead: "Acquisition, service or monitoring: we look at the turbine and tell you which route makes economic sense for you.",
};
