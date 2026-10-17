import type { Metadata } from "next";
import { Archivo, Schibsted_Grotesk, Source_Serif_4 } from "next/font/google";
import { company, siteUrl } from "@/content/site";
import "./globals.css";

/* Grotesk für Titel, Zahlen und Bedienelemente */
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-schibsted",
  display: "swap",
});

/* Serife für Fließtext — trägt die langen Fachbeiträge */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});
/* Startseite: eine einzige Familie mit Breitenachse. Schmal und schwer
   für Schlagzeilen, normal für Text, breit für Beschriftungen. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const SITE_URL = `${siteUrl}/`;
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Musterwerk Energy | Wind Turbine Acquisition, Service and Operation",
    template: "%s | Musterwerk Energy",
  },
  description:
    "We buy, operate and maintain wind turbines across Germany. In-house service crews, 24/7 monitoring and our own planning office for repowering under § 16b BImSchG, Germany's fast-track permit for replacing turbines.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: company.legalName,
    url: SITE_URL,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legalName,
  url: SITE_URL,
  telephone: company.phone.display,
  email: company.email.display,
  vatID: company.vatId,
  foundingDate: String(company.founded),
  address: {
    "@type": "PostalAddress",
    streetAddress: company.address.street,
    postalCode: company.address.zip,
    addressLocality: company.address.city,
    addressCountry: company.address.countryCode,
  },
  areaServed: { "@type": "Country", name: "Germany" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${schibsted.variable} ${sourceSerif.variable} ${archivo.variable}`}
    >
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </body>
    </html>
  );
}
