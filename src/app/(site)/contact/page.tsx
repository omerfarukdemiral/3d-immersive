import type { Metadata } from "next";
import KontaktInhalt from "@/components/seiten/kontakt/KontaktInhalt";
import Buehne from "./Buehne";

/**
 * /contact — „Jetzt" · L0. Text und Partitur liegen unter
 * src/components/seiten/kontakt/.
 */
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Musterwerk Energie GmbH & Co. KG in Musterstadt: phone, email, WhatsApp and inquiry forms for turbine acquisition and service.",
  alternates: { canonical: "/contact" },
};

export default function Kontakt() {
  return (
    <>
      <Buehne />
      <KontaktInhalt />
    </>
  );
}
