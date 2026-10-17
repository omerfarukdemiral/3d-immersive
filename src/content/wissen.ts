/**
 * Wissensbeiträge.
 *
 * Zweck: Sichtbarkeit bei den Begriffen, nach denen Betreiber tatsächlich
 * suchen (Post-EEG, § 16b, Rückbaubürgschaft), und ein Fachlichkeitssignal,
 * das die alte Website nicht hatte.
 *
 * Die Texte geben den allgemeinen Rechts- und Branchenstand wieder, nicht
 * die Praxis eines einzelnen Betreibers. Vor der Veröffentlichung sollte
 * der Kunde sie fachlich gegenlesen – besonders die Rechtsverweise.
 */

export type Artikel = {
  slug: string;
  kicker: string;
  title: string;
  teaser: string;
  readingMinutes: number;
  updated: string;
  sections: { h: string; p: string[]; list?: string[] }[];
  faq?: { q: string; a: string }[];
  relatedService?: { label: string; href: string };
  seo: { title: string; description: string };
};

export const artikel: Artikel[] = [
  {
    slug: "post-eeg",
    kicker: "Fundamentals",
    title: "Post-EEG: What happens to a wind turbine after 20 years",
    teaser:
      "After 20 years, the fixed EEG feed-in tariff ends, but the turbine's permit stays in place. Operators have four options, each with different consequences for revenue, liability and the land lease.",
    readingMinutes: 6,
    updated: "2026-09",
    sections: [
      {
        h: "What “post-EEG” actually means",
        p: [
          "Under the EEG (Germany's Renewable Energy Sources Act), turbines receive a fixed feed-in tariff for 20 years, counted from commissioning plus the remainder of the commissioning year. After that, the entitlement ends. The turbine may keep running, but its power has to be sold another way.",
          "The first large cohorts of German wind turbines passed this point long ago. Most of them are in the 500 kW to 1.5 MW class and are often in good technical shape. Without a fixed tariff, the economics become the deciding question.",
        ],
      },
      {
        h: "The four options",
        p: [
          "In practice, there are four paths. Which one pays off depends on the site, the turbine's condition, and the lease and zoning situation.",
        ],
        list: [
          "Continued operation with direct marketing: requires a lifetime extension assessment and only pays off when operating costs are low.",
          "Selling the turbine: operations pass to the buyer with all obligations, including the decommissioning obligation.",
          "Repowering: replacement with a modern turbine, usually under the simplified procedure of § 16b BImSchG (Federal Immission Control Act).",
          "Decommissioning: complete removal of the turbine and restoration of the land, funded from the posted security.",
        ],
      },
      {
        h: "The lifetime extension assessment",
        p: [
          "To run a turbine beyond its design life, insurers and authorities usually require an assessment based on the DIBt guideline (German Institute for Building Technology) or the principles of the BWE guideline (German Wind Energy Association). It examines the support structure, fatigue and the condition of the main components.",
          "The assessment determines how long continued operation is permitted and which inspection intervals apply from then on. If the result is negative, continued operation ends.",
        ],
      },
      {
        h: "Who carries the decommissioning obligation",
        p: [
          "The obligation to decommission lies with the operator and is usually secured by a bank guarantee or other security posted with the permitting authority. It remains in force even if the turbine is idle, until the turbine is removed or the obligation is validly transferred.",
          "In a sale, this point is central. If the buyer takes over the decommissioning obligation together with the security, the seller is fully released. Without that arrangement, the seller keeps a risk that lowers the purchase price.",
        ],
      },
    ],
    faq: [
      {
        q: "Does a turbine automatically have to shut down after 20 years?",
        a: "No. Only the fixed EEG tariff ends. The permit remains valid, and continued operation is allowed with a positive assessment.",
      },
      {
        q: "Does continued operation pay off without the tariff?",
        a: "That depends on site quality, operating costs and power prices. Turbines with high maintenance costs often no longer pay off under direct marketing.",
      },
      {
        q: "Can I still sell a turbine that's not running?",
        a: "Usually, yes. The valuation is based on location, condition and zoning status. Whether the turbine is currently generating power matters less.",
      },
    ],
    relatedService: {
      label: "Turbine Acquisition",
      href: "/services/acquisition",
    },
    seo: {
      title: "Post-EEG: Options for Wind Turbines After 20 Years",
      description:
        "Continued operation, sale, repowering or decommissioning: your options once the EEG tariff ends, including the lifetime extension assessment and the decommissioning obligation.",
    },
  },

  {
    slug: "repowering-guide",
    kicker: "Guide",
    title: "Repowering under § 16b BImSchG: How the process works",
    teaser:
      "When an old turbine is replaced, the authority reviews only the changes compared with what's already there. This article covers what § 16b simplifies, which reviews remain, and where projects stall.",
    readingMinutes: 7,
    updated: "2026-09",
    sections: [
      {
        h: "The core idea of § 16b",
        p: [
          "§ 16b of the BImSchG (Germany's Federal Immission Control Act) governs the procedure for replacing existing wind turbines. The authority reviews the changes compared with the permitted existing installation.",
          "If the new turbine has a smaller impact than the old one on a given point, such as noise or shadow flicker, that point doesn't need to be reassessed. This shortens the process. The substantive requirements still apply.",
        ],
      },
      {
        h: "What still gets reviewed",
        p: [
          "The relief applies to the scope of review. The protected interests stay the same. The following typically need to be addressed:",
        ],
        list: [
          "Species protection: modern turbines are taller, which changes the impact on breeding and migratory birds and on bats.",
          "Noise and shadow flicker: must be reassessed if hub height or rotor diameter increase significantly.",
          "Zoning law: height limits in land-use or development plans still apply.",
          "Grid connection: the higher output needs a new commitment from the grid operator.",
        ],
      },
      {
        h: "A typical project timeline",
        p: [
          "The project starts with a site and feasibility analysis. It establishes the site's yield and which turbine class zoning allows. Only then is it worth paying for expert studies.",
          "Next come the ecological surveys, which are often tied to growing seasons and therefore set the schedule. In parallel: the grid inquiry, securing the land, and coordination with the permitting authority.",
        ],
      },
      {
        h: "Where projects get stuck",
        p: [
          "The most common delay comes from surveys started too late. Miss the species protection survey by one season and the project loses a year, even if every other document is ready.",
          "The second issue is securing the land. New turbines need larger setbacks and different access roads, which leases from the 1990s rarely cover.",
        ],
      },
    ],
    faq: [
      {
        q: "Does the new turbine have to stand in exactly the same spot?",
        a: "Not necessarily, but it has to remain spatially connected to the existing installation. Moving it further away puts you back in the standard procedure.",
      },
      {
        q: "How long does a repowering procedure take?",
        a: "That depends on the surveys required. The ecological surveys are tied to the seasons and set the schedule.",
      },
    ],
    relatedService: {
      label: "Planning & Repowering",
      href: "/services/planning-repowering",
    },
    seo: {
      title: "Repowering under § 16b BImSchG | Procedure and Timeline",
      description:
        "How the simplified permitting procedure for replacing wind turbines works: scope of review, species protection, grid connection and common delays.",
    },
  },

  {
    slug: "decommissioning-costs",
    kicker: "Fundamentals",
    title: "Decommissioning obligations and costs: Who pays for what?",
    teaser:
      "When an older turbine is sold, the decommissioning obligation is often underestimated. This article explains its scope, how it's secured, and how it transfers to a buyer.",
    readingMinutes: 5,
    updated: "2026-09",
    sections: [
      {
        h: "Scope of the obligation",
        p: [
          "A wind turbine permit usually comes with the condition that the turbine be removed and the land restored once operations end for good. This covers the turbine, access road, crane pad and, depending on the condition, the foundation in full or down to a specified depth.",
          "How far the obligation extends for the foundation varies from permit to permit. This one point changes the cost calculation considerably.",
        ],
      },
      {
        h: "Security deposit",
        p: [
          "As security, a bank guarantee or other form of security is usually posted with the permitting authority. The amount is based on a cost estimate for decommissioning and, in some German states, is updated regularly.",
          "Important for sellers: the security is only released once the obligation has been fulfilled or validly transferred to someone else.",
        ],
      },
      {
        h: "What affects the proceeds",
        p: [
          "Decommissioning costs are offset by proceeds, mainly from steel and copper. These fluctuate with commodity prices and as a rule don't cover the costs.",
          "The rotor blades are the hard part. Glass-fiber composite can't be recycled like metal. Disposal is a cost item of its own and was often underestimated in older calculations.",
        ],
      },
      {
        h: "Transfer in a sale",
        p: [
          "When a turbine is sold, what matters is whether the decommissioning obligation transfers with it and whether the authority accepts the change of security provider. If that's handled cleanly, the seller is fully released.",
          "Without that arrangement, the seller keeps a risk that can wipe out the economic value of the sale price. Make sure the purchase agreement explicitly covers the transfer.",
        ],
      },
    ],
    relatedService: {
      label: "Turbine Acquisition",
      href: "/services/acquisition",
    },
    seo: {
      title: "Wind Turbine Decommissioning Obligations: Scope, Costs, Transfer",
      description:
        "What the decommissioning obligation covers, how the security deposit works, and what to watch for when it transfers to a buyer.",
    },
  },
];

export const artikelBySlug = (slug: string) =>
  artikel.find((a) => a.slug === slug);
