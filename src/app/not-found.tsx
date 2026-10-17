import Erlebnis from "@/components/erlebnis/Erlebnis";
import NichtGefunden, {
  fehlerMetadata,
} from "@/components/seiten/recht/NichtGefunden";
import "@/components/erlebnis/erlebnis.css";

export const metadata = fehlerMetadata;

/**
 * 404 für unbekannte Adressen und `notFound()` außerhalb der (site)-Gruppe.
 *
 * Sie hängt unter dem Root-Layout, nicht unter `(site)/layout.tsx` — den
 * Erlebnis-Rahmen (Szene, Kopfleiste, HUD) bringt sie darum selbst mit. Inhalt
 * und Begründung: src/components/seiten/recht/NichtGefunden.tsx.
 */
export default function NotFound() {
  return (
    <Erlebnis>
      <NichtGefunden />
    </Erlebnis>
  );
}
