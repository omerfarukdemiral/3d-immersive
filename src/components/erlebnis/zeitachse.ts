import { haltAnteil, type Kapiteldef, type Punkt, type Spur } from "./partitur";

/**
 * Werkzeug der Bühne: Kurven, Uhrzeit und Himmel.
 *
 * Seitenneutral — was eine Seite tut, steht in ihrer Partitur
 * (partitur.ts, docs/04-sayfa-api.md). Hier liegt nur, wie aus
 * Stützpunkten Werte und aus Uhrzeiten Himmelsfarben werden.
 */

/* ------------------------------------------------------------------ */
/* Kurven                                                              */
/* ------------------------------------------------------------------ */

export const klemm = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const glatt = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;


/**
 * Monotone kubische Interpolation (Fritsch–Carlson) über Stützpunkte.
 *
 * Früher lief zwischen je zwei Punkten ein eigenes Smootherstep — jede
 * Bewegung kam an jedem Zwischenpunkt kurz zum Stehen, die Kamera fuhr
 * „ruckweise". Hier bleibt die Geschwindigkeit über Zwischenpunkte
 * hinweg stetig, und weil die Kurve monoton ist, schießt sie nie über
 * einen Wert hinaus. Zwei gleiche Punkte (Halt) ergeben weiter einen
 * echten Stillstand mit weichem Ein- und Auslauf; Anfang und Ende einer
 * Spur laufen weich aus.
 *
 * `zeit(i)` und `wert(i)` lesen den i-ten Stützpunkt — so teilen sich
 * Zahlen, Vektoren und Kamerastellungen dieselbe Rechnung, ohne pro Bild
 * Arrays anzulegen.
 */
export function kurve(
  n: number,
  zeit: (i: number) => number,
  wertBei: (i: number) => number,
  t: number,
) {
  if (n === 0) return 0;
  if (n === 1 || t <= zeit(0)) return wertBei(0);
  if (t >= zeit(n - 1)) return wertBei(n - 1);
  let i = 0;
  while (zeit(i + 1) < t) i++;
  const ta = zeit(i);
  const tb = zeit(i + 1);
  const h = tb - ta;
  const a = wertBei(i);
  const b = wertBei(i + 1);
  if (h <= 1e-9) return b;
  const tangente = (k: number) => {
    if (k <= 0 || k >= n - 1) return 0;
    const h0 = zeit(k) - zeit(k - 1);
    const h1 = zeit(k + 1) - zeit(k);
    if (h0 <= 1e-9 || h1 <= 1e-9) return 0;
    const d0 = (wertBei(k) - wertBei(k - 1)) / h0;
    const d1 = (wertBei(k + 1) - wertBei(k)) / h1;
    if (d0 * d1 <= 0) return 0;
    return (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
  };
  const s = (t - ta) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * a +
    (s3 - 2 * s2 + s) * h * tangente(i) +
    (-2 * s3 + 3 * s2) * b +
    (s3 - s2) * h * tangente(i + 1)
  );
}

export function zahl(spur: Punkt<number>[], t: number) {
  return kurve(
    spur.length,
    (i) => spur[i][0],
    (i) => spur[i][1],
    t,
  );
}

/** Wert einer Spur (feste Zahl oder Verlauf) zur Erzählzeit. */
export const wert = (spur: Spur, t: number) =>
  typeof spur === "number" ? spur : zahl(spur, t);

/* ------------------------------------------------------------------ */
/* Uhr und Himmel                                                      */
/* ------------------------------------------------------------------ */

/**
 * Uhrzeit (Stunden, fortlaufend) zur Erzählzeit, aus den Uhrzeiten der
 * Kapitel. Während der festen Bühne läuft die Uhr kaum, im Übergang
 * springt sie. Kapitel ohne `uhr` übernehmen die des Vorgängers.
 */
export function uhrzeitAus(kapitel: Kapiteldef[], T: number) {
  const i = Math.floor(klemm(T, 0, kapitel.length - 1));
  const uhrVon = (j: number) => {
    for (let x = j; x >= 0; x--) {
      const u = kapitel[x].uhr;
      if (u !== undefined) return u;
    }
    return 6.42;
  };
  const a = uhrVon(i);
  if (i + 1 >= kapitel.length) return a;
  const b = uhrVon(i + 1);
  const f = T - i;
  const h = haltAnteil(kapitel[i]);
  const innen = f < h ? (f / h) * 0.15 : 0.15 + ((f - h) / (1 - h)) * 0.85;
  return mix(a, b, glatt(klemm(innen)));
}

/**
 * Wie `uhrzeitAus`, aber ohne das langsame Weiterlaufen in der festen
 * Bühne: Für den Sonnenstand (Schatten) steht die Uhr beim Lesen.
 */
export function sonnenUhrAus(kapitel: Kapiteldef[], T: number) {
  const i = Math.floor(klemm(T, 0, kapitel.length - 1));
  const uhrVon = (j: number) => {
    for (let x = j; x >= 0; x--) {
      const u = kapitel[x].uhr;
      if (u !== undefined) return u;
    }
    return 6.42;
  };
  const a = uhrVon(i);
  if (i + 1 >= kapitel.length) return a;
  const h = haltAnteil(kapitel[i]);
  const f = T - i;
  return mix(a, uhrVon(i + 1), glatt(klemm((f - h) / (1 - h))));
}

/** Echte Uhrzeit in Musterstadt (Europe/Berlin), in Stunden. */
const ortszeit =
  typeof Intl !== "undefined"
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Europe/Berlin",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      })
    : null;
export function echteUhrzeit(jetzt = new Date()) {
  if (!ortszeit) return jetzt.getHours() + jetzt.getMinutes() / 60;
  const t: Record<string, number> = {};
  for (const p of ortszeit.formatToParts(jetzt)) t[p.type] = Number(p.value);
  return (t.hour ?? 0) + (t.minute ?? 0) / 60 + (t.second ?? 0) / 3600;
}

export const uhrText = (stunden: number) => {
  const m = Math.round((((stunden % 24) + 24) % 24) * 60);
  const hh = Math.floor(m / 60) % 24;
  const mm = m % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

/**
 * Himmel nach Tageszeit. Bewusst bedeckt und kühl: norddeutscher Himmel
 * über Musterstadt, kein Werbeblau. Nur Morgen und Abend dürfen warm sein.
 */
type Himmel = {
  oben: string;
  horizont: string;
  boden: string;
  sonne: string;
  sonnenKraft: number;
  umgebung: number;
};

const himmel: Punkt<Himmel>[] = [
  [0, { oben: "#04070C", horizont: "#101A26", boden: "#070B10", sonne: "#7A93B8", sonnenKraft: 0.25, umgebung: 0.22 }],
  [4.6, { oben: "#0A1220", horizont: "#26304A", boden: "#0C1118", sonne: "#7A93B8", sonnenKraft: 0.3, umgebung: 0.25 }],
  [5.8, { oben: "#3A5374", horizont: "#D8B59E", boden: "#4A4A48", sonne: "#FFCCA6", sonnenKraft: 1.3, umgebung: 0.6 }],
  /* Prolog (06:25) und Repowering (06:20): erstes Bild der Seite. Die Wärme
     sitzt im Horizont, nicht im Licht — sonst färbt die weiße Anlage braun.
     Helleres Umgebungslicht von oben und unten hält den Turm sauber hell. */
  [6.4, { oben: "#5D7A9C", horizont: "#E4CDBA", boden: "#8E8F88", sonne: "#FFE9D6", sonnenKraft: 1.9, umgebung: 1.05 }],
  [8,{ oben: "#7894AE", horizont: "#E3E1DA", boden: "#8D9184", sonne: "#FFF1DE", sonnenKraft: 2, umgebung: 0.8 }],
  [13, { oben: "#89A3BA", horizont: "#ECEAE4", boden: "#9A9D90", sonne: "#FFFAF0", sonnenKraft: 2.4, umgebung: 0.9 }],
  [17, { oben: "#7790A9", horizont: "#E9DCCB", boden: "#8F8E80", sonne: "#FFE2BE", sonnenKraft: 2, umgebung: 0.8 }],
  [19.2, { oben: "#34476A", horizont: "#E2956A", boden: "#4A4440", sonne: "#FF9C63", sonnenKraft: 1.3, umgebung: 0.55 }],
  [21, { oben: "#0C1422", horizont: "#2C3244", boden: "#0D1117", sonne: "#7A93B8", sonnenKraft: 0.35, umgebung: 0.28 }],
  [24, { oben: "#04070C", horizont: "#101A26", boden: "#070B10", sonne: "#7A93B8", sonnenKraft: 0.25, umgebung: 0.22 }],
];

const hex = (s: string) => {
  const n = parseInt(s.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const misch = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return `rgb(${x.map((v, i) => Math.round(mix(v, y[i], t))).join(",")})`;
};

export function himmelUm(stunden: number): Himmel {
  const h = ((stunden % 24) + 24) % 24;
  let i = 0;
  while (himmel[i + 1][0] < h) i++;
  const [ta, a] = himmel[i];
  const [tb, b] = himmel[i + 1];
  const k = (h - ta) / (tb - ta);
  return {
    oben: misch(a.oben, b.oben, k),
    horizont: misch(a.horizont, b.horizont, k),
    boden: misch(a.boden, b.boden, k),
    sonne: misch(a.sonne, b.sonne, k),
    sonnenKraft: mix(a.sonnenKraft, b.sonnenKraft, k),
    umgebung: mix(a.umgebung, b.umgebung, k),
  };
}

/** Dunkel genug, dass Text hell gesetzt werden muss. */
export const istNacht = (stunden: number) => {
  const h = ((stunden % 24) + 24) % 24;
  return h < 5.5 || h > 20.3;
};

/** Sonnenrichtung: Aufgang im Osten (+x), Mittag hoch im Süden (+z). */
export function sonnenRichtung(stunden: number, aus: number[]) {
  const h = ((stunden % 24) + 24) % 24;
  const tag = klemm((h - 5.5) / 14.5);
  const w = tag * Math.PI;
  const nacht = h < 5.5 || h > 20;
  aus[0] = Math.cos(w) * 120;
  aus[1] = nacht ? 140 : 25 + Math.sin(w) * 150;
  aus[2] = 70 + Math.sin(w) * 40;
  return aus;
}

