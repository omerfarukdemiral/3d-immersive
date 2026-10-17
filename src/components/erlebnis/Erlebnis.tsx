"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Lenis from "lenis";
import { company, primaryCta } from "@/content/site";
import { buehne, lauf } from "./lauf";
import {
  grundzustand,
  type HudWert,
  type Partitur,
  type Szenenzustand,
} from "./partitur";
import {
  echteUhrzeit,
  glatt,
  himmelUm,
  istNacht,
  klemm,
  mix,
  sonnenUhrAus,
  uhrText,
  uhrzeitAus,
  wert,
} from "./zeitachse";

const Szene = dynamic(() => import("./Szene"), { ssr: false });

/* WebGL wird einmal geprüft. Ohne bleibt der CSS-Himmel stehen und der
   Text läuft vollständig durch — die Szene ist Zugabe, nicht Inhalt. */
let webglCache: boolean | null = null;
const webglDa = () => {
  if (webglCache === null) {
    try {
      const c = document.createElement("canvas");
      webglCache = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
};
const nichts = () => () => {};

type Takt = {
  el: HTMLElement;
  a: number;
  b: number;
  zahlen: { el: HTMLElement; ziel: number }[];
  zeilen: Zeilen[];
  zuletzt: number;
};

/* Wortweise Enthüllung der großen Momente (data-zeilen, siehe Kapitel.tsx).
   Die Schleife schreibt nur einen Fortschritt --z (0 = verborgen,
   1 = steht, 2 = gegangen); die Staffelung pro Wort rechnet das CSS. */
type Zeilen = { el: HTMLElement; kante: boolean; zuletzt: string };

/* Kanten: Text blendet unter der Kopfleiste und über dem HUD weich aus.
   Die Maske hängt am Element, nicht am Fenster — darum schiebt die
   Schleife sie gegen den Weg der Bühne, damit sie fest im Bild steht. */
type Kante = {
  el: HTMLElement;
  /** feste Bühne (sticky) oder mitlaufender Inhalt (Schluss) */
  fest: boolean;
  h: number;
  oben: number;
  zuletzt: number;
};

const FADE = 0.045;

/** Dauer der Kamerafahrt beim Seitenwechsel (ms), siehe Szene.tsx. */
const WECHSEL_MS = 1000;

/** Standort im HUD, wenn eine Seite keine eigene Messgröße hat. */
const STANDORT = "Musterstadt · 51.16° N 10.45° E";

/** Uhrzeit nach der Himmelsquelle der Partitur. */
function uhrNach(p: Partitur, T: number, echt: number) {
  const h = p.himmel;
  if (h.quelle === "kapitel") return uhrzeitAus(p.kapitel, T);
  if (h.quelle === "spur") return wert(h.uhr, T);
  if (h.quelle === "fest") return h.uhr;
  return echt;
}

/** Zwei Uhrzeiten auf dem kürzeren Weg um die Uhr mischen. */
function uhrMix(a: number, b: number, k: number) {
  let d = (((b - a) % 24) + 24) % 24;
  if (d > 12) d -= 24;
  return a + d * k;
}

const schluessel = Object.keys(grundzustand) as (keyof Szenenzustand)[];
/** Wörter brauchen länger als der Block, sonst wirkt die Staffel gehetzt. */
const WORT = FADE * 2.6;

export default function Erlebnis({ children }: { children: React.ReactNode }) {
  const wurzel = useRef<HTMLDivElement>(null);
  const uhrEl = useRef<HTMLSpanElement>(null);
  const hudEtikett = useRef<HTMLSpanElement>(null);
  const hudEinheit = useRef<HTMLSpanElement>(null);
  const hudNotiz = useRef<HTMLSpanElement>(null);
  const uhrKlein = useRef<HTMLSpanElement>(null);
  const kapKlein = useRef<HTMLSpanElement>(null);
  const upmEl = useRef<HTMLSpanElement>(null);
  const kapNr = useRef<HTMLSpanElement>(null);
  const kapName = useRef<HTMLSpanElement>(null);
  const balken = useRef<HTMLSpanElement>(null);
  const linie = useRef<SVGPathElement>(null);
  const schleierL = useRef<HTMLDivElement>(null);
  const schleierR = useRef<HTMLDivElement>(null);
  const punkt = useRef<SVGGElement>(null);

  const webgl = useSyncExternalStore(nichts, webglDa, () => false);
  /* Die Seite meldet ihre Partitur an (bausteine/Anmeldung.tsx). Bis
     dahin — beim ersten Bild nach dem Laden — läuft keine Schleife. */
  const partitur = useSyncExternalStore(
    buehne.abonnieren,
    buehne.lesen,
    buehne.leer,
  );
  const pfad = usePathname();
  /* Über Seitenwechsel hinweg: woher die Szene kommt. Lebt so lange wie
     das Layout — wer zurück auf eine alte Unterseite geht, beginnt danach
     ohne Überblendung. */
  const wechsel = useRef({
    letzte: null as Partitur | null,
    start: -Infinity,
    von: { ...grundzustand } as Szenenzustand,
    vonUhr: 0,
    zurueck: false,
    pfad: "",
  });

  /* Weiches Scrollen: Mausrad und Trackpad laufen über Lenis, Touch
     bleibt nativ (dort scrollt das Betriebssystem bereits mit Schwung).
     Ohne das springt der Text mit jeder Rastung des Mausrads, während die
     Szene hinterhergleitet — genau das waren die Ruckler beim Scrollen. */
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.075,
      wheelMultiplier: 0.75,
      anchors: true,
    });
    lauf.lenis = lenis;
    return () => {
      lenis.destroy();
      lauf.lenis = null;
    };
  }, []);

  /* Vor- und Zurück-Taste: Der Browser stellt die Lage selbst wieder her,
     dann darf die Bühne nicht nach oben springen. */
  useEffect(() => {
    const merk = () => {
      wechsel.current.zurueck = true;
    };
    addEventListener("popstate", merk);
    return () => removeEventListener("popstate", merk);
  }, []);

  useEffect(() => {
    if (!partitur) return;
    const pt = partitur;
    const root = wurzel.current!;
    const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
    lauf.ruhig = ruhig;
    const steht = pt.bewegung === "L0" || pt.bewegung === "L1";
    root.dataset.bewegung = pt.bewegung;

    /* Beim Pfadwechsel rendert das Layout einmal mit der alten Partitur,
       bevor die neue Seite sich anmeldet. Passen die Abschnitte im HTML
       dann nicht zur Partitur, wird auf die Anmeldung gewartet. */
    const w = wechsel.current;
    const ids = [...root.querySelectorAll<HTMLElement>("[data-kapitel]")].map(
      (s) => s.dataset.kapitel,
    );
    const passt = ids.join() === pt.kapitel.map((k) => k.id).join();
    if (!passt && pt === w.letzte && pfad !== w.pfad) return;
    if (!passt && process.env.NODE_ENV !== "production")
      console.warn(
        `[Bühne] Abschnitte im HTML (${ids.join(", ")}) passen nicht zur Partitur „${pt.id}" (${pt.kapitel.map((k) => k.id).join(", ")}).`,
      );

    /* Seitenwechsel: neue Seite beginnt oben (außer mit Sprungziel oder
       über Vor/Zurück), und Kamera, Uhr und Szene blenden von der letzten
       Stellung herüber. Next scrollt meist schon selbst — aber nicht,
       wenn der Anfang der neuen Seite zufällig im Bild liegt. */
    if (w.letzte && w.letzte !== pt) {
      if (!location.hash && !w.zurueck) {
        if (lauf.lenis) lauf.lenis.scrollTo(0, { immediate: true, force: true });
        else scrollTo(0, 0);
      }
      w.von = { ...lauf.szene };
      w.vonUhr = lauf.uhr;
      w.start = performance.now();
    }
    w.zurueck = false;
    w.letzte = pt;
    w.pfad = pfad;
    lauf.partitur = pt;

    const abschnitte = [
      ...root.querySelectorAll<HTMLElement>("[data-kapitel]"),
    ];
    const takte = abschnitte.map((s) =>
      [...s.querySelectorAll<HTMLElement>("[data-takt]")].map((el): Takt => {
        const [a, b] = el.dataset.takt!.split(" ").map(Number);
        return {
          el,
          a,
          b,
          zahlen: [...el.querySelectorAll<HTMLElement>("[data-zahl]")].map(
            (z) => ({
              el: z,
              ziel: Number(z.dataset.zahl),
            }),
          ),
          zeilen: [...el.querySelectorAll<HTMLElement>("[data-zeilen]")].map(
            (z) => ({
              el: z,
              kante: z.dataset.zeilen === "kante",
              zuletzt: "",
            }),
          ),
          zuletzt: -1,
        };
      }),
    );
    /* Zeilen ohne Takt (Schluss) hängen nur am Eintreffen ihres Kapitels. */
    const freieZeilen = abschnitte.map((s) =>
      [...s.querySelectorAll<HTMLElement>("[data-zeilen]")]
        .filter((z) => !z.closest("[data-takt]"))
        .map(
          (z): Zeilen => ({
            el: z,
            kante: z.dataset.zeilen === "kante",
            zuletzt: "",
          }),
        ),
    );
    const kanten = abschnitte.map(
      (s): Kante | null => {
        const el = s.querySelector<HTMLElement>(".e-buehne, .e-fliesst");
        return el
          ? {
              el,
              fest: el.classList.contains("e-buehne"),
              h: 0,
              oben: 0,
              zuletzt: NaN,
            }
          : null;
      },
    );
    const strecken = abschnitte.map((s) =>
      [...s.querySelectorAll<HTMLElement>("[data-strecke]")].map((el) => {
        const [a, b] = el.dataset.strecke!.split(" ").map(Number);
        return { el, a, b };
      }),
    );
    const upmAblesung = [...root.querySelectorAll<HTMLElement>("[data-upm]")];
    const masse = [...root.querySelectorAll<HTMLElement>("[data-mass]")].map(
      (el) => ({
        el,
        basis: Number(el.dataset.mass),
      }),
    );
    const teile = Object.fromEntries(
      [...root.querySelectorAll<HTMLElement>("[data-teil]")].map((el) => [
        el.dataset.teil!,
        el,
      ]),
    );

    /* Datenblätter sind immer helles Papier. Kopfleiste, Schiene und HUD
       stehen fest darüber und tragen nachts helle Schrift — läuft das
       Papier unter sie, wäre sie weiß auf Weiß. Die Schleife meldet darum,
       wo Papier liegt (data-papier-oben/-mitte/-unten, erlebnis.css). */
    const blaetter = [...root.querySelectorAll<HTMLElement>(".e-datenblatt")];
    const papierVorher = { oben: "", mitte: "", unten: "" };

    const oben: number[] = [];
    const hoehen: number[] = [];
    /* Textseite je Abschnitt: links/unten → linker Schleier, rechts → rechter */
    const seiten = abschnitte.map((a) => {
      const b = a.querySelector(".e-buehne");
      if (!b) return [0, 0];
      return b.classList.contains("e-rechts") ? [0, 1] : [1, 0];
    });
    const schleierVorher = ["", ""];
    let vh = innerHeight;
    let schmal = innerWidth < 768;
    const messen = () => {
      vh = innerHeight;
      schmal = innerWidth < 768;
      const sy = scrollY;
      abschnitte.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        oben[i] = r.top + sy;
        hoehen[i] = r.height;
        const kante = kanten[i];
        if (kante) {
          kante.h = kante.el.offsetHeight;
          kante.oben = kante.el.getBoundingClientRect().top + sy;
          kante.zuletzt = NaN;
        }
      });
      root.style.setProperty("--kante-h", `${vh}px`);
    };
    messen();
    const ro = new ResizeObserver(messen);
    ro.observe(document.body);
    addEventListener("resize", messen);

    let ys = scrollY;
    let nachtVorher: boolean | null = null;
    let kapVorher = -1;
    let hudVorher = "";
    const himmelVorher = { oben: "", horizont: "" };
    let upmVorher = "";
    let raf = 0;
    let echt = echteUhrzeit();
    let echtZuletzt = 0;

    /* Eintreffen eines Kapitels: 0, solange seine Bühne noch knapp eine
       halbe Höhe unter dem Fenster steht, 1, wenn sie oben anliegt. Trägt
       die Titel, die ab dem ersten Bild ihres Kapitels stehen. */
    const ankunft = (k: number) =>
      klemm((ys - oben[k] + vh * 0.45) / (vh * 0.45));
    const zeilenSetzen = (z: Zeilen, wert: number) => {
      const s = ruhig ? "1" : wert.toFixed(3);
      if (s !== z.zuletzt) {
        z.zuletzt = s;
        z.el.style.setProperty("--z", s);
      }
    };

    const schritt = (jetzt: number) => {
      raf = requestAnimationFrame(schritt);

      /* Lenis zuerst, dann lesen: Text (DOM) und Szene beruhen so auf
         derselben Scrolllage. Keine zweite Glättung mehr — sie ließ die
         Szene hinter dem Text herlaufen. Touch scrollt nativ mit Schwung
         und ist damit schon weich. */
      lauf.lenis?.raf(jetzt);
      /* Lenis' eigene Lage statt scrollY: scrollY ist auf Gerätepixel
         gerundet. Im Auslauf eines Radschubs springt es dann in ganzen
         Pixeln und bleibt dazwischen stehen — nah an der Gondel ruckt die
         Kamera dabei sichtbar vor und zurück. */
      const y = lauf.lenis ? lauf.lenis.scroll : scrollY;
      ys = y;

      /* Erzählzeit */
      let i = 0;
      /* Ein Pixel Spiel: Ist der Abspann genau eine Fensterhöhe hoch,
         endet die Seite exakt an seiner Oberkante — gebrochene Lagen aus
         getBoundingClientRect dürfen ihn dann nicht verfehlen. */
      while (i < abschnitte.length - 1 && ys >= oben[i + 1] - 1) i++;
      /* Strecke bis zum nächsten Kapitel — inklusive der Luft dazwischen
         (partitur.ts, LUFT), damit die Kamera auch dort weiterfliegt. */
      const strecke =
        i + 1 < abschnitte.length ? oben[i + 1] - oben[i] : hoehen[i];
      const anteil = klemm((ys - oben[i]) / Math.max(1, strecke), 0, 0.9999);
      const T = i + anteil;

      /* Erst alles lesen, dann schreiben. Jede Messung nach einer
         Stil-Änderung zwingt den Browser, Stil und Layout sofort neu zu
         rechnen — einmal pro Bild, mitten im Scroll: genau das waren
         die Hänger. Zu Beginn des Bilds ist das Layout noch vom letzten
         Bild sauber, Lesen kostet nichts. */
      let lv = 0;
      let lid = "";
      for (const f of pt.fokus ?? []) {
        const w = 0.012;
        const v = klemm((T - f.von) / w) * klemm((f.bis - T) / w);
        if (v > lv) {
          lv = v;
          lid = f.id;
        }
      }
      const karte = teile[lid];
      const karteRect = lv > 0 && karte ? karte.getBoundingClientRect() : null;
      const blattRects = blaetter.map((b) => b.getBoundingClientRect());
      lauf.T = T;
      /* L0/L1: Die Szene steht in ihrem ersten Bild, der Text läuft. */
      const sT = steht ? 0 : T;
      lauf.szeneT = sT;

      /* Seitenwechsel: von der alten Szene zur neuen, unabhängig vom
         Scroll. Ohne Bewegung (reduced motion) sofort. */
      const kw = ruhig ? 1 : glatt(klemm((jetzt - w.start) / WECHSEL_MS));
      lauf.wechsel = kw;
      for (const s of schluessel) {
        const ziel = wert(pt.spuren?.[s] ?? grundzustand[s], sT);
        lauf.szene[s] = kw < 1 ? mix(w.von[s], ziel, kw) : ziel;
      }
      if (steht) lauf.szene.drehzahl *= 1 - kw;

      if (pt.himmel.quelle === "echt" && jetzt - echtZuletzt > 1000) {
        echtZuletzt = jetzt;
        echt = echteUhrzeit();
      }
      const uhrZiel = uhrNach(pt, sT, echt);
      const uhr = kw < 1 ? uhrMix(w.vonUhr, uhrZiel, kw) : uhrZiel;
      lauf.uhr = uhr;
      lauf.sonnenUhr =
        kw >= 1 && pt.himmel.quelle === "kapitel"
          ? sonnenUhrAus(pt.kapitel, sT)
          : uhr;

      /* Text der Kapitel in Reichweite */
      for (
        let k = Math.max(0, i - 1);
        k <= Math.min(abschnitte.length - 1, i + 1);
        k++
      ) {
        const strecke = Math.max(1, hoehen[k] - vh);
        const p = klemm((ys - oben[k]) / strecke);
        for (const t of takte[k]) {
          const ein = t.a <= 0 ? 1 : glatt(klemm((p - t.a) / FADE));
          const aus =
            t.b >= 1 ? 1 : 1 - glatt(klemm((p - (t.b - FADE)) / FADE));
          const v = Math.round(ein * aus * 1000) / 1000;
          if (v !== t.zuletzt) {
            t.zuletzt = v;
            t.el.style.opacity = String(v);
            const weg = ruhig ? 0 : (1 - v) * (p < t.a + FADE ? 26 : -26);
            t.el.style.transform = weg ? `translate3d(0,${weg}px,0)` : "";
            t.el.style.pointerEvents = v > 0.5 ? "" : "none";
          }
          for (const z of t.zahlen) {
            const f = t.a <= 0 ? 1 : glatt(klemm((p - t.a) / (FADE * 1.6)));
            const zahl = String(Math.round(z.ziel * f));
            if (z.el.textContent !== zahl) z.el.textContent = zahl;
          }
          for (const z of t.zeilen) {
            /* Eine Zahl hinter der Kante darf nicht lange halb stehen:
               Sie steigt so schnell, wie der Zähler läuft. */
            const dauer = z.kante ? FADE * 1.6 : WORT;
            const ein = t.a <= 0 ? ankunft(k) : klemm((p - t.a) / dauer);
            /* Eine riesige Zahl im letzten Takt würde mit der Bühne bis
               unter die Kopfleiste wandern und dort in der Maske als
               grauer Schatten unter dem Logo stehen. Sie geht darum
               schon im ersten Stück des Kapitelwechsels. */
            const aus =
              t.b < 1
                ? klemm((p - (t.b - dauer * 0.8)) / (dauer * 0.8))
                : z.kante
                  ? klemm((ys - oben[k] - strecke) / (vh * 0.14))
                  : 0;
            zeilenSetzen(z, ein < 1 ? ein : 1 + aus);
          }
        }
        for (const z of freieZeilen[k]) zeilenSetzen(z, ankunft(k));
        for (const s of strecken[k]) {
          s.el.style.transform = `scaleX(${klemm((p - s.a) / (s.b - s.a))})`;
        }
      }

      /* Kanten: Maske gegen den echten Weg der Bühne verschieben (scrollY,
         nicht geglättet — die Bühne selbst folgt dem echten Scroll). */
      for (
        let k = Math.max(0, i - 2);
        k <= Math.min(abschnitte.length - 1, i + 2);
        k++
      ) {
        const kante = kanten[k];
        if (!kante) continue;
        let lage: number;
        if (kante.fest) {
          const ende = oben[k] + hoehen[k] - kante.h;
          lage = y < oben[k] ? oben[k] - y : y > ende ? ende - y : 0;
        } else {
          lage = kante.oben - y;
        }
        const pos = Math.round(-lage * 2) / 2;
        if (pos !== kante.zuletzt) {
          kante.zuletzt = pos;
          kante.el.style.setProperty("--kante-y", `${pos}px`);
        }
      }

      /* Himmel als CSS — trägt die Seite auch ohne WebGL */
      /* Schleier hinter dem Text: im Kapitel voll, im Wechsel zum nächsten
         im Takt des Scrolls übergeblendet (nicht mehr per CSS-Zeit). */
      if (!schmal && schleierL.current && schleierR.current) {
        const fest = Math.max(0, hoehen[i] - vh);
        const weg =
          i + 1 < abschnitte.length ? oben[i + 1] - oben[i] - fest : 1;
        const u = glatt(klemm((ys - oben[i] - fest) / Math.max(1, weg)));
        const nach = seiten[Math.min(i + 1, seiten.length - 1)];
        const jetzt = seiten[i];
        [schleierL.current, schleierR.current].forEach((el, k) => {
          const o = mix(jetzt[k], nach[k], u).toFixed(3);
          if (o !== schleierVorher[k]) {
            schleierVorher[k] = o;
            el.style.opacity = o;
          }
        });
      } else if (schleierVorher[0] !== "css") {
        schleierVorher[0] = schleierVorher[1] = "css";
        schleierL.current?.style.removeProperty("opacity");
        schleierR.current?.style.removeProperty("opacity");
      }

      /* Nur bei Änderung schreiben: Eine Variable am Wurzelelement
         invalidiert den Stil aller Nachfahren. */
      const h = himmelUm(uhr);
      if (h.oben !== himmelVorher.oben) {
        himmelVorher.oben = h.oben;
        root.style.setProperty("--oben", h.oben);
      }
      if (h.horizont !== himmelVorher.horizont) {
        himmelVorher.horizont = h.horizont;
        root.style.setProperty("--horizont", h.horizont);
      }
      const nacht = istNacht(uhr);
      if (nacht !== nachtVorher) {
        nachtVorher = nacht;
        root.dataset.nacht = nacht ? "1" : "0";
      }

      /* Papier unter dem Rahmen. Der obere Verlauf des Blatts (220 px,
         erlebnis.css) zählt erst ab etwa der Mitte als Papier. */
      let pO = false;
      let pM = false;
      let pU = false;
      for (const r of blattRects) {
        const deckt = r.top + 140;
        if (deckt < 72 && r.bottom > 24) pO = true;
        if (deckt < vh * 0.4 && r.bottom > vh * 0.6) pM = true;
        if (deckt < vh - 16 && r.bottom > vh - 56) pU = true;
      }
      const papier = { oben: pO ? "1" : "", mitte: pM ? "1" : "", unten: pU ? "1" : "" };
      for (const k of ["oben", "mitte", "unten"] as const) {
        if (papier[k] !== papierVorher[k]) {
          papierVorher[k] = papier[k];
          const name = `papier${k[0].toUpperCase()}${k.slice(1)}`;
          if (papier[k]) root.dataset[name] = "1";
          else delete root.dataset[name];
        }
      }

      /* Rahmen: die Messgröße der Seite */
      const hud: HudWert = pt.hud
        ? pt.hud(T, { uhr, kapitel: i, anteil, szene: lauf.szene })
        : { wert: uhrText(uhr), notiz: STANDORT };
      const ht = `${hud.etikett ?? ""}|${hud.wert}|${hud.einheit ?? ""}|${hud.notiz ?? ""}`;
      if (ht !== hudVorher && uhrEl.current) {
        hudVorher = ht;
        uhrEl.current.textContent = hud.wert;
        hudEtikett.current!.textContent = hud.etikett ?? "";
        hudEinheit.current!.textContent = hud.einheit ?? "";
        hudNotiz.current!.textContent = hud.notiz ?? "";
        if (uhrKlein.current) {
          const klein = hud.einheit ? `${hud.wert} ${hud.einheit}` : hud.wert;
          uhrKlein.current.textContent = klein;
          /* Ein Wort statt einer Zahl (Referenzen: „Deutschland“) braucht
             den Platz der Kapitelzahl — sie tritt dann zurück. */
          uhrKlein.current.parentElement!.dataset.lang =
            klein.length > 7 ? "1" : "0";
        }
      }
      const upm = lauf.upm.toFixed(1);
      if (upm !== upmVorher) {
        upmVorher = upm;
        if (upmEl.current) upmEl.current.textContent = upm;
        for (const el of upmAblesung) el.textContent = upm;
      }
      if (i !== kapVorher) {
        kapVorher = i;
        const nr = String(i + 1).padStart(2, "0");
        if (kapNr.current) kapNr.current.textContent = nr;
        if (kapKlein.current) kapKlein.current.textContent = nr;
        const kap = pt.kapitel.find((x) => x.id === abschnitte[i]?.dataset.kapitel);
        if (kapName.current) kapName.current.textContent = kap?.titel ?? "";
        root.dataset.kap = kap?.id ?? "";
        const b = abschnitte[i]?.querySelector(".e-buehne");
        root.dataset.seite = !b
          ? "fliesst"
          : b.classList.contains("e-rechts")
            ? "rechts"
            : b.classList.contains("e-unten")
              ? "unten"
              : "links";
        root.querySelectorAll("[data-sprung]").forEach((a, j) => {
          if (j === i) a.setAttribute("aria-current", "step");
          else a.removeAttribute("aria-current");
        });
      }
      if (balken.current) {
        const ende = document.documentElement.scrollHeight - vh;
        balken.current.style.transform = `scaleX(${klemm(ys / Math.max(1, ende))})`;
      }
      const m = lauf.szene.massstab;
      for (const x of masse) x.el.textContent = String(Math.round(x.basis * m));

      /* Leitlinie vom Bauteil zur Karte (gemessen oben, vor den Schreibzugriffen) */
      const anker = lauf.anker[lid];
      if (linie.current && punkt.current) {
        if (lv > 0 && anker?.da && karte && karteRect && webgl) {
          const r = karteRect;
          if (schmal) {
            /* Hochformat: Der Text füllt die Breite, eine Linie von seiner
               rechten Kante liefe quer durch die Überschrift. Stattdessen
               senkrecht vom Bauteil bis knapp über die Etikettzeile und
               dort ein kurzes Stück zum Textanfang. */
            const y0 = r.top - 14;
            linie.current.setAttribute(
              "d",
              anker.y < y0 - 12
                ? `M${r.left},${y0} H${anker.x} V${anker.y}`
                : "",
            );
          } else {
            const x0 = r.right + 18;
            const y0 = r.top + 34;
            const knick = Math.min(anker.x - 30, x0 + 80);
            linie.current.setAttribute(
              "d",
              `M${x0},${y0} H${knick} L${anker.x},${anker.y}`,
            );
          }
          punkt.current.setAttribute(
            "transform",
            `translate(${anker.x},${anker.y})`,
          );
          const o = String(lv * Number(karte.style.opacity || 1));
          linie.current.style.opacity = o;
          punkt.current.style.opacity = o;
        } else {
          linie.current.style.opacity = "0";
          punkt.current.style.opacity = "0";
        }
      }
    };
    raf = requestAnimationFrame(schritt);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      removeEventListener("resize", messen);
    };
    /* `pfad`: Seiten mit gleicher Partitur (Beiträge unter /insights/[slug])
       bringen trotzdem neue Abschnitte mit — die müssen neu vermessen und
       eingesammelt werden. */
  }, [webgl, partitur, pfad]);

  const kapitel = partitur?.kapitel ?? [];

  return (
    <div
      ref={wurzel}
      className="erlebnis"
      data-nacht="0"
      data-seite="links"
      data-bewegung="L3"
    >
      <div className="e-himmel" aria-hidden="true" />
      {webgl ? (
        <div className="e-szene" aria-hidden="true">
          <Szene />
        </div>
      ) : null}
      {/* L1/L0: Die Szene tritt hinter den Text zurück (erlebnis.css). */}
      <div className="e-blende" aria-hidden="true" />
      <div ref={schleierL} className="e-schleier e-schleier-links" aria-hidden="true" />
      <div ref={schleierR} className="e-schleier e-schleier-rechts" aria-hidden="true" />

      <svg className="e-leitlinien" aria-hidden="true">
        <path ref={linie} d="" />
        <g ref={punkt}>
          <circle r="5" className="e-punkt" />
          <circle r="14" className="e-ring" />
        </g>
      </svg>

      <a href="#inhalt" className="e-sprungmarke">
        Skip to content
      </a>

      <header className="e-kopf">
        {/* Beide Fassungen liegen übereinander in einem festen Rahmen; die
            Nacht blendet nur um, die Kopfleiste springt nie. */}
        <Link href="/" className="e-logo" aria-label={company.shortName}>
          <span className="e-logo-tag" aria-hidden="true">
            <b>{company.wordmark.first}</b>
            <span>{company.wordmark.second}</span>
          </span>
          <span className="e-logo-nacht" aria-hidden="true">
            <b>{company.wordmark.first}</b>
            <span>{company.wordmark.second}</span>
          </span>
        </Link>
        {/* Mobil fehlt der HUD; der Tag braucht trotzdem eine Uhr. */}
        <span className="e-kopf-uhr tnum" aria-hidden="true">
          <span ref={uhrKlein}>06:25</span>
          <span className="e-kopf-kap">
            <span ref={kapKlein}>01</span>/
            {String(kapitel.length || 1).padStart(2, "0")}
          </span>
        </span>
        <nav className="e-nav" aria-label="Main navigation">
          <Link href="/services">Services</Link>
          <Link href="/references">References</Link>
          <Link href="/company">Company</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <Link
          href={primaryCta.href}
          className="e-knopf e-knopf-voll e-knopf-klein"
        >
          {primaryCta.label}
        </Link>
      </header>

      <nav className="e-schiene" aria-label="Chapters">
        {kapitel.map((k, i) => (
          <a key={k.id} href={`#${k.id}`} data-sprung>
            <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
            <span className="e-schiene-name">{k.titel}</span>
          </a>
        ))}
      </nav>

      <div className="e-hud" aria-hidden="true">
        {/* Messgröße der Seite (Partitur.hud). Leere Teile fallen weg. */}
        <div className="e-hud-uhr">
          <span ref={hudEtikett} className="e-etikett e-hud-etikett" />
          <span className="e-hud-wert">
            <span ref={uhrEl} className="tnum">
              06:25
            </span>
            <span ref={hudEinheit} className="e-hud-einheit" />
          </span>
          <span ref={hudNotiz} className="e-etikett">
            {STANDORT}
          </span>
        </div>
        <div className="e-hud-rechts">
          <span className="e-etikett">
            Rotor{" "}
            <span ref={upmEl} className="tnum">
              0.0
            </span>{" "}
            rpm
          </span>
          <span className="e-etikett">
            <span ref={kapNr} className="tnum">
              01
            </span>{" "}
            /{" "}
            <span className="tnum">
              {String(kapitel.length || 1).padStart(2, "0")}
            </span>{" "}
            <span ref={kapName}>Opening</span>
          </span>
        </div>
        <span className="e-hud-balken">
          <span ref={balken} />
        </span>
      </div>

      <main id="inhalt">{children}</main>
    </div>
  );
}
