import type { Metadata } from "next";
import Inhalt from "@/components/seiten/karriere/Inhalt";
import Buehne from "./Buehne";

/**
 * /company/careers — „Ein Tag oben" · L2. Text und Partitur liegen
 * unter src/components/seiten/karriere/.
 */
export const metadata: Metadata = {
  title: "Careers",
  description:
    "Wind turbine service technicians: work in our own teams, across Germany, independent of any manufacturer. Open positions at Musterwerk Energy.",
  alternates: { canonical: "/company/careers" },
};

export default function Karriere() {
  return (
    <>
      <Buehne />
      <Inhalt />
    </>
  );
}
