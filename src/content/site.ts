/**
 * Zentrale Stammdaten. Alles, was mehrfach auftaucht, steht nur hier.
 *
 * Fiktives Demo-Unternehmen: Name, Adresse, Register und Kontaktdaten
 * sind frei erfunden und gehören zu keiner realen Firma.
 */

/**
 * Öffentliche Adresse der Seite, ohne Schrägstrich am Ende. Der Pages-
 * Workflow setzt sie aus dem Repository (NEXT_PUBLIC_SITE_URL); lokal
 * gilt localhost. Der Pfad muss zu `basePath` in next.config.ts passen.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const company = {
  legalName: "Musterwerk Energie GmbH & Co. KG",
  shortName: "Musterwerk Energy",
  wordmark: { first: "MUSTERWERK", second: "ENERGY" },

  founded: 2016,
  experienceYears: 12,

  managingDirector: "Max Mustermann",
  generalPartner: "Musterwerk Energie Verwaltungs GmbH",
  tradeRegister: "HRA 00000 Musterstadt",
  vatId: "DE000000000",

  address: {
    street: "Musterstraße 1",
    zip: "12345",
    city: "Musterstadt",
    country: "Germany",
    countryCode: "DE",
    lat: 51.16,
    lng: 10.45,
  },

  phone: { display: "+49 000 0000000", href: "tel:+490000000000" },
  email: {
    display: "info@example.com",
    href: "mailto:info@example.com",
  },
  whatsapp: { display: "WhatsApp", href: "https://wa.me/000000000" },
} as const;

/** Kennzahlen – Basis der Beweisführung auf der Startseite. */
export const kennzahlen = [
  { value: 96, label: "Turbines under monitoring", href: "/services/monitoring" },
  { value: 54, label: "Turbines in our own portfolio", href: "/references" },
  {
    value: 140,
    label: "Turbines under service",
    href: "/services/maintenance",
  },
  {
    value: 9,
    label: "Active planning projects",
    href: "/services/planning-repowering",
  },
] as const;

export const navigation = [
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "Turbine Acquisition",
        href: "/services/acquisition",
        desc: "We buy your turbine and take over the decommissioning obligation.",
      },
      {
        label: "Service & Maintenance",
        href: "/services/maintenance",
        desc: "Our own crews. Any manufacturer. Anywhere in Germany.",
      },
      {
        label: "Monitoring & Remote Control",
        href: "/services/monitoring",
        desc: "24/7 monitoring with remote resets and fault alerts.",
      },
      {
        label: "Planning & Repowering",
        href: "/services/planning-repowering",
        desc: "From site assessment to grid connection.",
      },
    ],
  },
  { label: "References", href: "/references" },
  {
    label: "Company",
    href: "/company",
    children: [
      {
        label: "About Us",
        href: "/company",
        desc: "Operator, service partner and planner since 2016.",
      },
      {
        label: "Team",
        href: "/company/team",
        desc: "Your contacts in the office and in the field.",
      },
      {
        label: "Standards & Safety",
        href: "/company/standards",
        desc: "Certifications, insurance, occupational safety.",
      },
      {
        label: "Partners & Investors",
        href: "/company/partners-investors",
        desc: "Own portfolio, operating model, working with us.",
      },
      {
        label: "Careers",
        href: "/company/careers",
        desc: "Open positions for service technicians.",
      },
    ],
  },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
] as const;

export const primaryCta = {
  label: "Sell your turbine",
  href: "/contact/sell-your-turbine",
} as const;

export const legalNav = [
  { label: "Imprint", href: "/imprint" },
  { label: "Privacy Policy", href: "/privacy" },
] as const;
