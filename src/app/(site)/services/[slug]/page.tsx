import type { Metadata } from "next";
import { notFound } from "next/navigation";
import * as ankauf from "@/components/seiten/leistungen/anlagenankauf";
import * as monitoring from "@/components/seiten/leistungen/monitoring";
import * as planung from "@/components/seiten/leistungen/planung-repowering";
import * as service from "@/components/seiten/leistungen/service-wartung";
import { leistungen, leistungBySlug } from "@/content/leistungen";
import { company } from "@/content/site";
import Buehne from "./Buehne";

/**
 * Gemeinsame Route der vier Leistungsseiten.
 *
 * Jede Leistung hat ihre eigene Erzählung und liegt dafür in einem
 * eigenen Ordner unter src/components/seiten/leistungen/:
 * `partitur` für die Bühne, `Kapitel` mit allem Text als
 * Serverkomponente. Diese Route hält nur, was alle vier teilen —
 * statische Pfade, Metadaten, strukturierte Daten — und reicht den Rest
 * an die Seite der Leistung weiter. Die Partitur meldet `Buehne` an
 * (Client), weil sie Funktionen und den Zusatz im Canvas enthält.
 */

type Params = { slug: string };

const inhalte: Record<string, React.ComponentType> = {
  acquisition: ankauf.Kapitel,
  "maintenance": service.Kapitel,
  monitoring: monitoring.Kapitel,
  "planning-repowering": planung.Kapitel,
};

export function generateStaticParams(): Params[] {
  return leistungen.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const l = leistungBySlug(slug);
  if (!l) return {};
  return {
    title: l.seo.title,
    description: l.seo.description,
    alternates: { canonical: `/services/${l.slug}` },
  };
}

export default async function LeistungSeite(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const l = leistungBySlug(slug);
  const Inhalt = inhalte[slug];
  if (!l || !Inhalt) notFound();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: l.title,
    description: l.seo.description,
    areaServed: { "@type": "Country", name: "Germany" },
    provider: { "@type": "Organization", name: company.legalName },
  };

  return (
    <>
      <Buehne slug={slug} />
      <Inhalt />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
    </>
  );
}
