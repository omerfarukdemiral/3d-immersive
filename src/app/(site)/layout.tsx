import Erlebnis from "@/components/erlebnis/Erlebnis";
import "@/components/erlebnis/erlebnis.css";

/**
 * Rahmen der Erlebnisseiten.
 *
 * Die Szene liegt hier und nicht in der Seite: Beim Wechsel von der
 * Startseite auf eine Unterseite soll die Anlage stehen bleiben und die
 * Kamera weiterfahren, statt dass ein Canvas ab- und wieder aufgebaut
 * wird. Die Seite liefert nur noch ihre eigene Partitur — die Bühne
 * gehört dem Layout.
 */
export default function ErlebnisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Erlebnis>{children}</Erlebnis>;
}
