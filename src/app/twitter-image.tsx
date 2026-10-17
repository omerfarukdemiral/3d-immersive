/**
 * X/Twitter nutzt dieselbe Grafik wie Open Graph. Eigene Datei, weil das
 * Dateikonventions-System von Next sonst kein twitter:image ausgibt —
 * Inhalt und Maße kommen unverändert aus `opengraph-image.tsx`.
 */
export { size, contentType, alt, default } from "./opengraph-image";
export const dynamic = "force-static";
