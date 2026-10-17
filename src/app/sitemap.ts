import type { MetadataRoute } from "next";
import { leistungen } from "@/content/leistungen";
import { artikel } from "@/content/wissen";
import { siteUrl } from "@/content/site";

export const dynamic = "force-static";

const BASE = siteUrl;

export default function sitemap(): MetadataRoute.Sitemap {
  const statisch = [
    { url: "/", priority: 1.0, changeFrequency: "monthly" as const },
    { url: "/services", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/references", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/company", priority: 0.8, changeFrequency: "yearly" as const },
    {
      url: "/company/team",
      priority: 0.6,
      changeFrequency: "yearly" as const,
    },
    {
      url: "/company/standards",
      priority: 0.6,
      changeFrequency: "yearly" as const,
    },
    {
      url: "/company/partners-investors",
      priority: 0.6,
      changeFrequency: "yearly" as const,
    },
    {
      url: "/company/careers",
      priority: 0.7,
      changeFrequency: "monthly" as const,
    },
    { url: "/insights", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/contact", priority: 0.8, changeFrequency: "yearly" as const },
    {
      url: "/contact/sell-your-turbine",
      priority: 0.9,
      changeFrequency: "yearly" as const,
    },
    {
      url: "/contact/service-request",
      priority: 0.8,
      changeFrequency: "yearly" as const,
    },
    { url: "/imprint", priority: 0.2, changeFrequency: "yearly" as const },
    { url: "/privacy", priority: 0.2, changeFrequency: "yearly" as const },
  ];

  const now = new Date();

  return [
    ...statisch.map((s) => ({
      ...s,
      url: `${BASE}${s.url}`,
      lastModified: now,
    })),
    ...leistungen.map((l) => ({
      url: `${BASE}/services/${l.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    ...artikel.map((a) => ({
      url: `${BASE}/insights/${a.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
