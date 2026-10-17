import type { Metadata } from "next";
import FormularInhalt from "@/components/seiten/kontakt/FormularInhalt";
import { partiturVerkaufen } from "@/components/seiten/kontakt/partitur";
import Buehne from "./Buehne";

/**
 * /contact/sell-your-turbine — Formular · L0.
 */
export const metadata: Metadata = {
  title: "Sell your turbine",
  description:
    "Sell your wind turbine: model, rated output, year of construction and location are all we need for a first acquisition assessment.",
  alternates: { canonical: "/contact/sell-your-turbine" },
};

export default function AnlageVerkaufen() {
  return (
    <>
      <Buehne />
      <FormularInhalt
        partitur={partiturVerkaufen}
        pfad="/contact/sell-your-turbine"
        variante="verkaufen"
      />
    </>
  );
}
