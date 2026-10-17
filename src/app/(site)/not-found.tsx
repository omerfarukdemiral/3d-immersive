import NichtGefunden, {
  fehlerMetadata,
} from "@/components/seiten/recht/NichtGefunden";

export const metadata = fehlerMetadata;

/**
 * 404 für `notFound()` innerhalb einer Erlebnis-Seite (etwa eine unbekannte
 * Leistung unter /services/…). Der Rahmen mit Szene steht hier schon
 * (layout.tsx): Die Anlage verschwindet vom Fundament, statt dass der
 * Canvas neu aufgebaut wird. Unbekannte Adressen fängt app/not-found.tsx.
 */
export default function NichtGefundenV4() {
  return <NichtGefunden />;
}
