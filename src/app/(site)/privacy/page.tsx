import type { Metadata } from "next";
import Datenschutz from "@/components/seiten/recht/Datenschutz";

/**
 * /privacy — L0 auf Papier. Text, Partitur und Stile liegen unter
 * src/components/seiten/recht/.
 */
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How this website processes personal data: contact inquiries, server logs, fonts and your rights under the GDPR.",
  alternates: { canonical: "/privacy" },
};

export default function DatenschutzSeite() {
  return <Datenschutz />;
}
