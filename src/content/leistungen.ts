/**
 * Leistungsinhalte.
 *
 * Fließtexte und Leistungspunkte stammen von der bestehenden Website
 * (Tippfehler korrigiert: "Fernüberwachungs" → "Fernüberwachung") und sind
 * um Ablauf, FAQ und Prozessangaben ergänzt.
 *
 * Zu den Zeitangaben im Ablauf: Es sind Richtwerte zur Orientierung, keine
 * zugesicherten Fristen — so sind sie auf der Seite auch ausgewiesen. Der
 * verbindliche Zeitplan entsteht im Angebot. Vor dem Livegang sollte der
 * Kunde die Spannen gegen die eigene Erfahrung prüfen.
 *
 * Bewusst nicht behauptet werden Dinge, die nur der Kunde belegen kann:
 * eine pauschale Reaktionszeit bei Störungen und eine Liste betreuter
 * Hersteller. Beides ist stattdessen so beantwortet, dass der Leser
 * weiterkommt — über den Servicevertrag und über das erste Telefonat.
 */

type Leistung = {
  slug: string;
  nav: string;
  title: string;
  lead: string;
  intro: string;
  bullets: string[];
  /** Prozessschritte – Dauer wird vom Kunden ergänzt. */
  ablauf?: {
    step: string;
    text: string;
    dauer?: string;
    /** Dieselbe Dauer als Spanne in Wochen, für die Zeitachse der Startseite. */
    wochen?: [number, number];
  }[];
  /**
   * Was beim Verkauf vom Betreiber auf uns übergeht — und in welchem
   * Schritt (Index in `ablauf`). Inhaltliche Aussage, vom Kunden zu
   * bestätigen; abgeleitet aus den Texten zu Vertrag, Übernahme und FAQ.
   */
  uebergaben?: { last: string; beiSchritt: number }[];
  faq?: { q: string; a: string }[];
  seo: { title: string; description: string };
};

export const leistungen: Leistung[] = [
  {
    slug: "acquisition",
    nav: "Wind turbine acquisition",
    title: "Turbine Acquisition",
    lead: "We buy your wind turbine and take over the operator's technical and legal obligations.",
    intro:
      "We buy used wind turbines anywhere in Germany. Directly, at a fair price, without the hassle. Whether your turbine is post-EEG or was shut down early, we handle the technical and legal work of the transfer. Once the deal closes, we operate the turbine ourselves.",
    bullets: [
      "Technical assessment, remote or on site",
      "Assumption of easements and obligations (e.g. decommissioning)",
      "Legally sound purchase agreements",
    ],
    ablauf: [
      {
        step: "First contact",
        text: "You send us the turbine model, rated power, year of commissioning and location. We tell you whether the turbine is a fit for us.",
        dauer: "1 business day",
        wochen: [0.2, 0.2],
      },
      {
        step: "Technical assessment",
        text: "We review operating data, maintenance history and existing expert reports, remotely or on site at the turbine.",
        dauer: "1–2 weeks",
        wochen: [1, 2],
      },
      {
        step: "Offer",
        text: "You receive a binding purchase offer that includes how the decommissioning obligation is handled.",
        dauer: "about 1 week",
        wochen: [1, 1],
      },
      {
        step: "Contract",
        text: "We draft the purchase agreement and settle easements and land leases with the landowners.",
        dauer: "2–4 weeks",
        wochen: [2, 4],
      },
      {
        step: "Handover",
        text: "Transfer of operations, re-registration with the grid operator, and we take over technical management.",
        dauer: "4–8 weeks",
        wochen: [4, 8],
      },
    ],
    uebergaben: [
      { last: "Land leases", beiSchritt: 3 },
      { last: "Easements", beiSchritt: 3 },
      { last: "Decommissioning obligation", beiSchritt: 3 },
      { last: "Grid operator", beiSchritt: 4 },
      { last: "Technical management", beiSchritt: 4 },
    ],
    faq: [
      {
        q: "Do you take over the decommissioning obligation?",
        a: "Yes. Taking over easements, including decommissioning obligations, is a standard part of our purchase agreements. You hand over the turbine along with all its obligations.",
      },
      {
        q: "Do you buy single turbines?",
        a: "Yes. We take on single turbines as well as entire wind farms. What counts for the valuation is location, turbine model and technical condition.",
      },
      {
        q: "What happens to existing land leases?",
        a: "We review existing lease and land-use agreements as part of the transfer and take them over if you want us to and the contracts allow it.",
      },
    ],
    seo: {
      title: "Sell Your Wind Turbine | Turbine Acquisition",
      description:
        "We buy used wind turbines across Germany: technical assessment, assumption of decommissioning obligations, legally sound contracts. Post-EEG or shut down early.",
    },
  },

  {
    slug: "maintenance",
    nav: "Service & maintenance",
    title: "Service, Maintenance & Repair",
    lead: "Maintenance, inspection and repair by our own service crews. Any manufacturer, anywhere in Germany.",
    intro:
      "Our service crews look after your turbine anywhere in Germany, quickly and efficiently. Independent of the manufacturer, highly skilled and with an eye for detail.",
    bullets: [
      "Scheduled maintenance & inspections",
      "Fast repairs & spare parts supply",
      "On-site and on-call technical service",
      "Minimal downtime",
    ],
    faq: [
      {
        q: "Which turbine models do you service?",
        a: "We work independently of the manufacturer and specialize in existing turbines, mostly built between the 1990s and the 2010s. For many of these, the original manufacturer no longer offers service. Tell us the manufacturer, model and year. We'll tell you on the first call whether we can take your turbine on.",
      },
      {
        q: "How quickly can you be on site after a fault?",
        a: "Fault alerts reach us instantly through remote monitoring. We reset some faults remotely, so the turbine is down for minutes instead of days. If a site visit is needed, timing depends on distance, weather and spare parts availability. The binding response time for your turbine is set in the service contract.",
      },
      {
        q: "Can we keep our current maintenance provider and hire you only for repairs?",
        a: "Yes. We take on individual jobs as well as full maintenance. If we also handle maintenance, our technicians know the turbine and find the root cause faster when something breaks.",
      },
      {
        q: "What does a service call cost?",
        a: "Costs depend on turbine model, condition and scope of work. We prepare a reliable quote once we know the maintenance history and operating data. Full-service maintenance is billed at a flat annual rate, individual jobs on a time-and-materials basis. Our quote tells you which model works out cheaper for your turbine.",
      },
    ],
    seo: {
      title: "Wind Turbine Service & Maintenance | Manufacturer-Independent",
      description:
        "Maintenance, inspection and fast repair of wind turbines by our own service crews. Independent of the manufacturer and active across Germany.",
    },
  },

  {
    slug: "monitoring",
    nav: "Monitoring & remote control",
    title: "Monitoring & Remote Control",
    lead: "We monitor your turbine around the clock and step in remotely when faults occur.",
    intro:
      "We record your turbine's operating data continuously, catch faults early, reset them remotely where possible, and plan any site visit with the diagnosis already in hand.",
    bullets: [
      "24/7 turbine monitoring",
      "Remote maintenance & immediate response to faults",
      "Ongoing analysis of technical operating data",
    ],
    faq: [
      {
        q: "Do we need to install new hardware on the turbine?",
        a: "In most cases, no. We connect to the existing turbine controller and read the operating data it already records. If a component doesn't report measurements, we recommend a retrofit and include the cost in our quote.",
      },
      {
        q: "What happens when a fault occurs at night?",
        a: "The fault alert reaches us automatically. We reset some faults remotely, and the turbine starts up again. If a fault can't be cleared remotely, our service team schedules a site visit for the next day. The technician arrives with the diagnosis in hand.",
      },
      {
        q: "Can I see my turbine's data myself?",
        a: "Yes. You get access to your turbine's operating data and a regular report on availability, yield and anomalies.",
      },
      {
        q: "Is it worth it for a single older turbine?",
        a: "Yes. On older turbines, the biggest risk sits in the drivetrain. A gearbox failure costs many times what a full year of monitoring does. Oil temperature, particle count and vibration patterns often signal that kind of damage months in advance.",
      },
    ],
    seo: {
      title: "Wind Turbine Monitoring & Remote Control | 24/7",
      description:
        "Round-the-clock monitoring, remote maintenance and ongoing analysis of operating data. Early fault detection for higher availability.",
    },
  },

  {
    slug: "planning-repowering",
    nav: "Planning & repowering",
    title: "Planning & Repowering",
    lead: "From site assessment to grid feed-in, delivered by our in-house planning team.",
    intro:
      "From idea to grid feed-in: our planning team supports new wind projects and repowering projects with technical and commercial expertise. We are currently running nine active planning projects.",
    bullets: [
      "Site assessment & feasibility analysis",
      "Project development & permitting",
      "Technical design & grid planning",
    ],
    /* Ohne Zeitangaben: Die Dauer eines Genehmigungsverfahrens hängt an
       Behörde, Gutachtenlage und Einwendungen und schwankt um Jahre. Eine
       Spanne hier wäre keine Orientierung, sondern Zufall. */
    ablauf: [
      {
        step: "Site assessment",
        text: "Wind resource, setback distances to buildings, nature conservation and zoning status. The result: whether the site is suitable, and for which turbine class.",
      },
      {
        step: "Feasibility",
        text: "Yield forecast weighed against investment, operating costs and revenue assumptions. For repowering, also compared with continuing to run the existing turbines.",
      },
      {
        step: "Preliminary design and land rights",
        text: "Turbine layout, access roads, crane pads and grid connection point. In parallel, agreements with landowners and the municipality.",
      },
      {
        step: "Permitting",
        text: "Application under the BImSchG (Federal Immission Control Act) with the required studies on noise, shadow flicker and species protection. For repowering under § 16b, the authority reviews only the changes compared with the existing turbines.",
      },
      {
        step: "Detailed design",
        text: "Technical design, grid connection planning and coordination with the grid operator, tendering and contract award.",
      },
      {
        step: "Construction and commissioning",
        text: "Construction supervision, commissioning, acceptance and handover to operations management, ours if you wish.",
      },
    ],
    faq: [
      {
        q: "What does repowering under § 16b BImSchG mean?",
        a: "§ 16b of the BImSchG (Federal Immission Control Act) sets out a simplified permitting procedure for replacing existing wind turbines. The authority reviews only the changes compared with the existing turbines. That makes the process shorter than a new permit.",
      },
      {
        q: "When does repowering pay off?",
        a: "It depends on the quality of the site, the age and model of the existing turbine, and the zoning situation. We evaluate this in a site and feasibility analysis.",
      },
    ],
    seo: {
      title: "Wind Turbine Planning & Repowering | § 16b BImSchG",
      description:
        "Site assessment, project development, permitting and grid planning for new wind turbines and repowering projects.",
    },
  },
];

export const leistungBySlug = (slug: string) =>
  leistungen.find((l) => l.slug === slug);

/**
 * Anatomie der Windkraftanlage – Datenbasis für den 3D-Abschnitt.
 *
 * Messgrößen und Frühindikatoren sind fachlich allgemeingültig formuliert
 * und gelten für jede Anlage dieser Klasse. Sie behaupten damit nichts über
 * den konkreten Überwachungsumfang eines einzelnen Vertrags — der steht im
 * Servicevertrag und nicht auf der Startseite.
 */
export const anatomie = [
  {
    id: "rotorblaetter",
    name: "Rotor blades",
    messwert: "Vibration, pitch angle, icing",
    fehler: "Blade damage, imbalance, pitch deviation",
    text: "Every blade has its own vibration signature. When it shifts, that points to damage before it's visible from the outside.",
  },
  {
    id: "nabe",
    name: "Hub & pitch system",
    messwert: "Blade pitch, hydraulic pressure",
    fehler: "Pitch faults, leaks, bearing wear",
    text: "The pitch system controls output with every change in the wind. Sluggish pitch control costs yield and shows up early in the data.",
  },
  {
    id: "getriebe",
    name: "Gearbox",
    messwert: "Oil temperature, particle count, vibration",
    fehler: "Bearing damage, gear tooth damage",
    text: "A gearbox failure is the single most expensive failure a turbine can have. Oil analysis and vibration data often flag it months before it fails.",
  },
  {
    id: "generator",
    name: "Generator & converter",
    messwert: "Winding temperature, power curve",
    fehler: "Winding damage, converter faults",
    text: "We compare the measured power curve with the reference curve for the turbine model. Deviations point to faults in the generator, converter or controls.",
  },
  {
    id: "turm",
    name: "Tower & foundation",
    messwert: "Tilt, vibration, settlement",
    fehler: "Foundation cracks, loose flange bolts",
    text: "A change in tower vibration is an early warning sign of damage to the foundation and flange connections.",
  },
] as const;
