import {
  stellung,
  zeitraster,
  type Kapiteldef,
  type Partitur,
  type Punkt,
} from "@/components/erlebnis/partitur";
import { zahl } from "@/components/erlebnis/zeitachse";

/**
 * Partitur „Team" — „Von unten nach oben".
 *
 * Die Anlage liest sich wie ein Organigramm: Jede Rolle steht dort, wo
 * sie arbeitet. Planung auf der Fläche, Betriebsführung in der Ferne
 * (dort laufen die Daten aller Anlagen auf), die Elektrofachkraft am
 * Turmfuß, der Servicetechniker oben in der Gondel, die Geschäftsführung
 * wieder am Boden, im Gespräch. Das HUD misst die Höhe, in der die Rolle
 * arbeitet, und zählt die Rollen mit.
 *
 * Takte und Orte stehen hier und in page.tsx im selben Raster (`takte`),
 * damit Text und Kamera nicht auseinanderlaufen.
 */

const kapitel: Kapiteldef[] = [
  /* Sechs Takte: 1 + 0,6 × 6 ≈ 4,6 Fensterhöhen, etwas Luft für die
     lange Fahrt in die Gondel. */
  { id: "rollen", titel: "Roles", hoehe: 4.8, marke: "Height 0 m" },
  { id: "arbeitsweise", titel: "How we work" },
  { id: "abspann", titel: "Contact" },
];

const { tAus, index } = zeitraster(kapitel);
const q = (x: number) => tAus("rollen", x);

/**
 * Sichtbarkeit der Takte in der festen Strecke (0–1). page.tsx liest sie
 * für `data-takt`, die Partitur für Kamera, Fokus und HUD.
 */
const takte = {
  auftakt: [0, 0.14],
  planung: [0.17, 0.3],
  monitoring: [0.33, 0.45],
  elektro: [0.48, 0.6],
  service: [0.63, 0.8],
  leitung: [0.83, 1],
} as const;

type Taktname = keyof typeof takte;
export const takt = (n: Taktname) => `${takte[n][0]} ${takte[n][1]}`;

/* ------------------------------------------------------------------ */
/* Höhe                                                                */
/* ------------------------------------------------------------------ */

/**
 * Höhe der Arbeit in Einheiten der 60-m-Anlage: am Boden 0, im Aufstieg
 * auf Nabenhöhe. Das HUD multipliziert mit dem Maßstab — so zeigt es
 * während des Servicetakts „60 bis 140 Meter", wie der Text sagt, und
 * die Anlage wächst sichtbar mit.
 */
const hoehe: Punkt<number>[] = [
  [q(takte.service[0] - 0.02), 0],
  [q(takte.service[0] + 0.03), 60],
  [q(takte.service[1]), 60],
  [q(takte.leitung[0] + 0.01), 0],
];

/** 140 m Nabenhöhe = Maßstab 140/60 der Modellanlage. */
const OBEN = 140 / 60;

/* Das Wachsen beginnt erst, wenn die Kamera in der Totale steht. */
const massstab: Punkt<number>[] = [
  [q(takte.service[0] + 0.07), 1],
  [q(takte.service[1] - 0.03), OBEN],
  [q(takte.service[1]), OBEN],
  [q(takte.leitung[0] + 0.02), 1],
];

/* ------------------------------------------------------------------ */
/* HUD                                                                 */
/* ------------------------------------------------------------------ */

/** Rollen in der Reihenfolge der Takte (Namen aus der alten Team-Seite). */
const rollen: { takt: Taktname; name: string }[] = [
  { takt: "planung", name: "Planning & project development" },
  { takt: "monitoring", name: "Operations management & monitoring" },
  { takt: "elektro", name: "Qualified electrician" },
  { takt: "service", name: "Service technician" },
  { takt: "leitung", name: "Management" },
];

/* Notizen einmal bauen: Der Formatierer läuft in jedem Bild. */
const notizen = rollen.map(
  (r, i) => `Role ${i + 1}/${rollen.length} · ${r.name}`,
);
const beginn = rollen.map((r) => q(takte[r.takt][0] - 0.015));

/** Index der Rolle zur Erzählzeit, -1 vor der ersten. */
function rolleBei(T: number) {
  if (T >= index("arbeitsweise")) return -1;
  let r = -1;
  for (let i = 0; i < beginn.length; i++) if (T >= beginn[i]) r = i;
  return r;
}

/* ------------------------------------------------------------------ */
/* Partitur                                                            */
/* ------------------------------------------------------------------ */

/* Hochformat, Gondel nah: Der Servicetakt ist der längste Text der Seite
   und füllt die untere Hälfte. Die Gondel rückt höher und etwas weiter
   weg, damit kein Blatt hinter dem Titel steht. */
const serviceHoch = { hoch: 0.3, weite: 1.45 };

export const partitur: Partitur = {
  id: "/company/team",
  name: "Team",
  bewegung: "L3",
  kapitel,
  /* Ein klarer Vormittag: Die Sonne steht im Südosten, Kamerastellungen
     mit positivem z sehen die Anlage im Licht. */
  himmel: { quelle: "fest", uhr: 10.5 },
  kamera: [
    /* Auftakt: die ganze Anlage aus Augenhöhe, Text links. */
    stellung(q(0), [150, 12, 175], [0, 46, 0], { versatz: 0.2 }),
    stellung(q(0.12), [138, 14, 165], [0, 46, 0], { versatz: 0.2 }),

    /* Planung: erhöht über der Fläche, an der Anlage vorbei nach Osten,
       wo die geplanten Standorte als Umriss stehen — alles, was vor der
       ersten Umdrehung passiert. Weiter nach Südosten gedreht als die
       erste Fassung: Der Umriss bei (225, -933) stand bei 1280 × 720
       links hinter Titel und Etikett; so fällt er aus dem Bild, und die
       übrigen Umrisse bleiben rechts der Textspalte (1280–1440 geprüft). */
    stellung(q(takte.planung[0]), [-325, 100, 10], [620, 10, -340], { versatz: 0.2 }),
    stellung(q(takte.planung[1]), [-305, 108, 30], [620, 10, -340], { versatz: 0.2 }),

    /* Betriebsführung: weit weg und erhöht, die Flotte im Blick — hier
       laufen die Daten aller betreuten Anlagen auf. */
    /* Hoch genug, dass keine Anlage der Flotte quer durch den Text steht. */
    stellung(q(takte.monitoring[0]), [-760, 540, 1040], [0, 0, 0], { versatz: 0.18, fov: 40 }),
    stellung(q(takte.monitoring[1]), [-640, 520, 1120], [0, 0, 0], { versatz: 0.18, fov: 40 }),

    /* Elektrofachkraft: am Turmfuß vor der Tür (Umrichter, Schaltanlage). */
    stellung(q(takte.elektro[0]), [13, 2.6, 26], [0, 5, 0], { versatz: 0.18, fov: 40 }),
    stellung(q(takte.elektro[1]), [16, 2.4, 25], [0, 5, 0], { versatz: 0.18, fov: 40 }),

    /* Servicetechniker: hinauf zur Gondel, dann wächst die Anlage von
       60 auf 140 m. Erst zieht die Kamera auf die Totale zurück, dann
       steht sie still, während die Anlage wächst (s. `massstab`) —
       weicht sie während des Wachsens zurück, wird die Anlage im Bild
       eher kleiner und das Wachsen liest sich wie ein Herauszoomen. Die
       Totale ist auf die 140-m-Anlage bemessen. */
    stellung(q(takte.service[0]), [58, 64, 80], [0, 61, 0], { versatz: 0.24, ...serviceHoch }),
    stellung(q(takte.service[0] + 0.03), [60, 66, 82], [0, 62, 0], { versatz: 0.24, ...serviceHoch }),
    stellung(q(takte.service[0] + 0.07), [230, 72, 290], [0, 104, 0], { versatz: 0.24 }),
    stellung(q(takte.service[1]), [232, 73, 292], [0, 104, 0], { versatz: 0.24 }),

    /* Geschäftsführung: zurück auf den Boden, ruhige Totale. */
    stellung(q(takte.leitung[0]), [190, 20, 230], [0, 48, 0], { versatz: 0.2 }),
    stellung(q(1), [200, 22, 245], [0, 48, 0], { versatz: 0.2 }),

    /* Datenblatt: weiter Blick, die Anlage steht ruhig hinter dem Papier. */
    stellung(index("arbeitsweise"), [260, 70, 300], [0, 50, 0], { versatz: 0.2 }),

    /* Abspann: Die Flotte steht noch einmal auf, aber nicht hinter dem
       CTA. Die Kamera steht südwestlich außerhalb des Rings und blickt
       steil auf seinen westlichen Rand: So liegt die Flotte im Querformat
       ganz rechts der Textspalte (1280 × 720 und 1440 × 900 geprüft).
       Im Hochformat füllt der Text fast das ganze Bild; dort hebt `hoch`
       die Flotte in den schmalen Streifen unter der Kopfleiste. */
    stellung(index("abspann"), [-1800, 810, 2540], [-1160, 30, 720], {
      versatz: 0.22,
      hoch: 0.4,
      dreh: -15,
    }),
  ],
  spuren: {
    /* Vor der ersten Umdrehung steht der Rotor; mit der Betriebsführung
       läuft er an. */
    drehzahl: [
      [q(0.12), 9],
      [q(takte.planung[0]), 0],
      [q(takte.planung[1]), 0],
      [q(takte.monitoring[0]), 12],
      /* Oben in der Gondel steht der Rotor: Wie bei echten Arbeiten
         wird er festgesetzt, in Y-Stellung (s. `parken`). */
      [q(takte.elektro[1]), 6],
      [q(takte.service[0]), 0],
      [q(takte.service[1]), 0],
      [q(takte.leitung[0]), 9],
    ],
    parken: [
      [q(takte.service[0] - 0.03), 0],
      [q(takte.service[0]), 1],
      [q(takte.service[1]), 1],
      [q(takte.leitung[0]), 0],
    ],
    massstab,
    /* Sechs Planungsprojekte als Umriss, nur im Planungstakt. */
    planung: [
      [q(takte.planung[0] - 0.02), 0],
      [q(takte.planung[0] + 0.03), 1],
      [q(takte.planung[1]), 1],
      [q(takte.planung[1] + 0.03), 0],
    ],
    /* Die Flotte: alle betreuten Anlagen, im Monitoringtakt und im Abspann. */
    flotte: [
      [q(takte.monitoring[0] - 0.03), 0],
      [q(takte.monitoring[0] + 0.02), 1],
      [q(takte.monitoring[1]), 1],
      [q(takte.elektro[0] - 0.01), 0],
      [index("abspann") - 0.3, 0],
      [index("abspann"), 1],
    ],
  },
  fokus: [
    { id: "fuss", von: q(takte.elektro[0]), bis: q(takte.elektro[1]) },
    { id: "gondel", von: q(takte.service[0] + 0.02), bis: q(takte.service[1]) },
  ],
  hud: (T, k) => {
    const r = rolleBei(T);
    return {
      etikett: "Height",
      wert: String(Math.round(zahl(hoehe, T) * k.szene.massstab)),
      einheit: "m",
      notiz: r >= 0 ? notizen[r] : undefined,
    };
  },
};
