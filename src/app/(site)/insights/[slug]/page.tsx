import type { Metadata } from "next";
import { siteUrl } from "@/content/site";
import { notFound } from "next/navigation";
import Beitrag from "@/components/seiten/wissen/Beitrag";
import { beitragsPartituren } from "@/components/seiten/wissen/partitur";
import { artikel, artikelBySlug } from "@/content/wissen";
import { company } from "@/content/site";
import Buehne from "./Buehne";

/**
 * Beiträge unter /insights/[slug] — Lesemodus (L1). Hier stehen
 * statische Pfade, Metadaten und strukturierte Daten; der Text steht in
 * Beitrag.tsx, das eingefrorene Bild der Szene in der Partitur des
 * Beitrags.
 */

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return artikel.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const a = artikelBySlug(slug);
  if (!a) return {};
  return {
    title: a.seo.title,
    description: a.seo.description,
    alternates: { canonical: `/insights/${a.slug}` },
    openGraph: {
      type: "article",
      title: a.seo.title,
      description: a.seo.description,
      /* Ohne diese Zeile fiele das Vorschaubild weg: Ein eigener
         openGraph-Block ersetzt den des Layouts, er ergänzt ihn nicht.
         Daher hier die generierte Startkachel ausdrücklich nennen. */
      images: [`${siteUrl}/opengraph-image`],
    },
  };
}

export default async function BeitragSeite(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const a = artikelBySlug(slug);
  const partitur = beitragsPartituren.get(slug);
  if (!a || !partitur) notFound();

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: a.title,
      description: a.seo.description,
      inLanguage: "en",
      author: { "@type": "Organization", name: company.legalName },
      publisher: { "@type": "Organization", name: company.legalName },
    },
    ...(a.faq
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: a.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <Buehne slug={slug} />
      <Beitrag a={a} partitur={partitur} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
