import type { Metadata } from "next";
import Impressum from "@/components/seiten/recht/Impressum";

/**
 * /imprint — L0 auf Papier. Text, Partitur und Stile liegen unter
 * src/components/seiten/recht/.
 */
export const metadata: Metadata = {
  title: "Imprint",
  description:
    "Legal notice under § 5 DDG (German Digital Services Act) for Musterwerk Energie GmbH & Co. KG, Musterstadt.",
  alternates: { canonical: "/imprint" },
  robots: { index: true, follow: true },
};

export default function ImpressumSeite() {
  return <Impressum />;
}
