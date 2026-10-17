import Buehne from "./_start/Buehne";
import Kapitelfolge from "./_start/Kapitelfolge";

/**
 * «Eine Anlage. Ein Tag.» — Partitur in _start/partitur.ts, Text in
 * _start/Kapitelfolge.tsx. Szene und Rahmen liefert das Layout.
 */
export default function Home() {
  return (
    <>
      <Buehne />
      <Kapitelfolge />
    </>
  );
}
