import { company } from "@/content/site";

/**
 * Rundgang durch die Seiten: Jede Seite endet mit einer Tür zur
 * nächsten — „WEITER — {SEITE} · {MESSGRÖSSE}". Die Messgröße ist die
 * Einheit, die das HUD dort zeigt. Wer eine Seite umbenennt oder ihre
 * Messgröße ändert, ändert sie hier — nur hier.
 */
export type Station = {
  pfad: string;
  /** Kurzname der Seite, wie in der Tür. */
  name: string;
  /** Was das HUD dort misst. */
  messgroesse: string;
};

export const rundgang: Station[] = [
  { pfad: "/", name: "Home", messgroesse: "Time" },
  { pfad: "/services", name: "Services", messgroesse: "Heading 000° → 270°" },
  { pfad: "/services/acquisition", name: "Acquisition", messgroesse: "Step 1/5" },
  { pfad: "/services/maintenance", name: "Maintenance", messgroesse: "Height 0 → 60 m" },
  { pfad: "/services/monitoring", name: "Monitoring", messgroesse: "Time 03:10 → 07:00" },
  { pfad: "/services/planning-repowering", name: "Planning", messgroesse: "Step 1/6 · Hub height" },
  { pfad: "/references", name: "References", messgroesse: "Turbines · Germany" },
  {
    pfad: "/company",
    name: "Company",
    messgroesse: `Since ${company.founded} · ${company.experienceYears}+ years`,
  },
  { pfad: "/company/team", name: "Team", messgroesse: "Height 0 → 140 m" },
  { pfad: "/company/standards", name: "Standards", messgroesse: "Proof 1/6" },
  { pfad: "/company/partners-investors", name: "Partners & Investors", messgroesse: "Operating year 0 → 30" },
  { pfad: "/company/careers", name: "Careers", messgroesse: "Time · Height" },
  { pfad: "/insights", name: "Insights", messgroesse: "Article 1/3" },
  { pfad: "/contact", name: "Contact", messgroesse: "Now" },
];

/**
 * Nächste Station nach `pfad`. Beiträge unter /insights/… führen weiter
 * zu Kontakt, Formulare unter /contact/… zurück zur Startseite; Kontakt
 * schließt den Kreis zur Startseite.
 */
export function naechsteStation(pfad: string): Station | null {
  const i = rundgang.findIndex((s) => s.pfad === pfad);
  if (i >= 0) return rundgang[(i + 1) % rundgang.length];
  if (pfad.startsWith("/insights/"))
    return rundgang.find((s) => s.pfad === "/contact")!;
  if (pfad.startsWith("/contact/")) return rundgang[0];
  return null;
}
