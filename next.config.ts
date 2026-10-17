import type { NextConfig } from "next";

/**
 * Statischer Export für GitHub Pages. Dort liegt die Seite unter
 * /<repository> (PAGES_BASE_PATH setzt der Workflow), lokal ohne Präfix.
 * Der Pfad muss zu `siteUrl` in src/content/site.ts passen.
 */
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
