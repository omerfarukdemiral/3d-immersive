import type { Metadata } from "next";
import Inhalt from "@/components/seiten/partner/Inhalt";
import Buehne from "./Buehne";

/**
 * /company/partners-investors — „Die Laufzeit" · L2. Text und Partitur
 * liegen unter src/components/seiten/partner/.
 */
export const metadata: Metadata = {
  title: "Partners and investors",
  description:
    "Operating model, portfolio and investment process of Musterwerk Energie GmbH & Co. KG for capital partners investing in operating turbines.",
  alternates: { canonical: "/company/partners-investors" },
};

export default function PartnerInvestoren() {
  return (
    <>
      <Buehne />
      <Inhalt />
    </>
  );
}
