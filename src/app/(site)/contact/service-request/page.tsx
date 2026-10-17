import type { Metadata } from "next";
import FormularInhalt from "@/components/seiten/kontakt/FormularInhalt";
import { partiturService } from "@/components/seiten/kontakt/partitur";
import Buehne from "./Buehne";

/**
 * /contact/service-request — Formular · L0.
 */
export const metadata: Metadata = {
  title: "Request service",
  description:
    "Request service for your wind turbine: maintenance, repair or a technical assessment. Independent of manufacturer, anywhere in Germany.",
  alternates: { canonical: "/contact/service-request" },
};

export default function ServiceAnfrage() {
  return (
    <>
      <Buehne />
      <FormularInhalt
        partitur={partiturService}
        pfad="/contact/service-request"
        variante="service"
      />
    </>
  );
}
