import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Bauten der Kraftwerke (Solarpark, Batteriespeicher, Biogasanlage,
 * Umspannwerk) — ganz aus Code, ohne Modell.
 *
 * Zwei Dinge machen den Unterschied zwischen „Klötzchen" und Anlage:
 *  1. Maßstab und Teilezahl wie in echt: Container mit Klimageräten an
 *     den Stirnseiten, Isolatoren mit Schirmen, Trafos mit Radiatoren.
 *  2. Prozedurale Texturen (Canvas): Kies, Asphalt, Schalungsbeton,
 *     Trapezblech, Lüftungsgitter, Folie, Fassade, Zaungeflecht.
 * Schatten kommen aus der Szene (Licht folgt dem Blickpunkt, Szene.tsx).
 *
 * Nur im Browser auswerten: Die Texturen brauchen `document`. Das Modul
 * wird ausschließlich von Kraftwerke.tsx geladen, und das nur clientseitig.
 */

export type V3 = [number, number, number];
type Geo = THREE.BufferGeometry;
export type Teil = { geo: Geo; mat: THREE.Material; wirft?: boolean };

const OBEN = new THREE.Vector3(0, 1, 0);

/**
 * Höhen der Beläge. Der Schattenempfänger am Boden liegt auf 0,05 m —
 * Flächen, die nur 1–2 cm darüber liegen, kämpfen auf 300 m Abstand um
 * denselben Tiefenwert und flimmern (Z-Fighting). Darum deutlich darüber,
 * und Straßen auf Kiesflächen noch einmal deutlich höher.
 */
const BELAG = 0.18;
const STRASSE = 0.3;

/* ------------------------------------------------------------------ */
/* Geometrie-Werkzeug                                                  */
/* ------------------------------------------------------------------ */

/** Quader von a nach b mit quadratischem Querschnitt d. */
export function balken(a: V3, b: V3, d: number) {
  return ausrichten(new THREE.BoxGeometry(d, 1, d), a, b);
}

/** Rohr von a nach b. */
function rohr(a: V3, b: V3, r: number, n = 10) {
  return ausrichten(new THREE.CylinderGeometry(r, r, 1, n, 1), a, b);
}

function ausrichten(g: Geo, a: V3, b: V3) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  g.scale(1, va.distanceTo(vb), 1);
  g.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(
      OBEN,
      vb.clone().sub(va).normalize(),
    ),
  );
  g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
  return g;
}

/** Quader mit Unterkante auf y. */
export function block(
  x: number,
  y: number,
  z: number,
  b: number,
  h: number,
  t: number,
) {
  return new THREE.BoxGeometry(b, h, t).translate(x, y + h / 2, z);
}

export function zylinder(
  x: number,
  y: number,
  z: number,
  r: number,
  h: number,
  n = 32,
) {
  return new THREE.CylinderGeometry(r, r, h, n, 1).translate(x, y + h / 2, z);
}

/** Liegender Ring (Kranz, Ringbalken). */
function ring(x: number, y: number, z: number, R: number, r: number) {
  return new THREE.TorusGeometry(R, r, 6, 64)
    .rotateX(Math.PI / 2)
    .translate(x, y, z);
}

/** Alle Geometrien in eine; three verlangt einheitlich indiziert oder nicht. */
export function eins(teile: Geo[]) {
  return mergeGeometries(
    teile.map((t) => (t.index ? t.toNonIndexed() : t)),
    false,
  );
}

/**
 * Stützisolator: Kern und Schirme. Schirme sind das, was einen
 * Porzellanisolator sofort als solchen erkennbar macht.
 */
function isolator(
  t: Geo[],
  x: number,
  y: number,
  z: number,
  laenge: number,
  r = 0.12,
) {
  t.push(zylinder(x, y, z, r, laenge, 10));
  const n = Math.max(3, Math.round(laenge / 0.2));
  for (let i = 0; i < n; i++)
    t.push(
      zylinder(x, y + 0.08 + (i * (laenge - 0.2)) / (n - 1), z, r * 2.3, 0.05, 14),
    );
}

/** Gittersäule: vier Eckstiele, Riegel und Diagonalen auf jeder Seite. */
function gitterSaeule(t: Geo[], x: number, z: number, h: number, w: number) {
  const s = w / 2;
  const ecken: [number, number][] = [
    [-s, -s],
    [s, -s],
    [s, s],
    [-s, s],
  ];
  for (const [dx, dz] of ecken)
    t.push(balken([x + dx, 0, z + dz], [x + dx, h, z + dz], 0.22));
  const feld = 1.5;
  for (let y = 0; y < h - 0.01; y += feld) {
    const y2 = Math.min(h, y + feld);
    for (let c = 0; c < 4; c++) {
      const [ax, az] = ecken[c];
      const [bx, bz] = ecken[(c + 1) % 4];
      t.push(balken([x + ax, y2, z + az], [x + bx, y2, z + bz], 0.12));
      t.push(balken([x + ax, y, z + az], [x + bx, y2, z + bz], 0.09));
    }
  }
}

/** Gitterträger zwischen a und b (waagerecht), Höhe und Tiefe w. */
function gitterTraeger(t: Geo[], a: V3, b: V3, w: number) {
  const s = w / 2;
  const laenge = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const n = Math.max(2, Math.round(laenge / 1.5));
  const P = (f: number, dy: number, dq: number): V3 => {
    /* quer zur Trägerachse in der Waagerechten */
    const ux = (b[0] - a[0]) / laenge;
    const uz = (b[2] - a[2]) / laenge;
    return [
      a[0] + (b[0] - a[0]) * f - uz * dq,
      a[1] + dy,
      a[2] + (b[2] - a[2]) * f + ux * dq,
    ];
  };
  for (const [dy, dq] of [
    [s, s],
    [s, -s],
    [-s, s],
    [-s, -s],
  ])
    t.push(balken(P(0, dy, dq), P(1, dy, dq), 0.18));
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    t.push(balken(P(f, -s, s), P(f, s, s), 0.1));
    t.push(balken(P(f, -s, -s), P(f, s, -s), 0.1));
    if (i < n) {
      const f2 = (i + 1) / n;
      t.push(balken(P(f, -s, s), P(f2, s, s), 0.09));
      t.push(balken(P(f, -s, -s), P(f2, s, -s), 0.09));
    }
  }
}

/** Satteldach als Prisma, First entlang x. */
function satteldach(
  x: number,
  y: number,
  z: number,
  laenge: number,
  breite: number,
  hoehe: number,
) {
  const s = new THREE.Shape();
  s.moveTo(-breite / 2, 0);
  s.lineTo(breite / 2, 0);
  s.lineTo(0, hoehe);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: laenge, bevelEnabled: false })
    .translate(0, 0, -laenge / 2)
    .rotateY(Math.PI / 2)
    .translate(x, y, z);
}

/** Zaun: Pfosten und Handlauf (Stahl), Geflecht als eigene Flächen. */
function zaun(b: number, t: number, h = 2.4) {
  const pfosten: Geo[] = [];
  const netz: Geo[] = [];
  const x = b / 2;
  const z = t / 2;
  const seiten: [V3, V3][] = [
    [
      [-x, 0, -z],
      [x, 0, -z],
    ],
    [
      [x, 0, -z],
      [x, 0, z],
    ],
    [
      [x, 0, z],
      [-x, 0, z],
    ],
    [
      [-x, 0, z],
      [-x, 0, -z],
    ],
  ];
  for (const [a, e] of seiten) {
    const len = Math.hypot(e[0] - a[0], e[2] - a[2]);
    const n = Math.round(len / 3);
    for (let i = 0; i <= n; i++) {
      const f = i / n;
      const px = a[0] + (e[0] - a[0]) * f;
      const pz = a[2] + (e[2] - a[2]) * f;
      pfosten.push(block(px, 0, pz, 0.12, h + 0.1, 0.12));
    }
    pfosten.push(balken([a[0], h, a[2]], [e[0], h, e[2]], 0.08));
    const flaeche = new THREE.PlaneGeometry(len, h)
      .rotateY(-Math.atan2(e[2] - a[2], e[0] - a[0]))
      .translate((a[0] + e[0]) / 2, h / 2, (a[2] + e[2]) / 2);
    const uv = flaeche.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (len / 2.4));
    netz.push(flaeche);
  }
  return { pfosten, netz };
}

/** Lichtmast mit Leuchte. */
function lichtmast(t: Geo[], x: number, z: number, h = 10) {
  t.push(zylinder(x, 0, z, 0.1, h, 8));
  t.push(block(x + 0.5, h - 0.2, z, 1.2, 0.2, 0.4));
}

/* ------------------------------------------------------------------ */
/* Texturen                                                            */
/* ------------------------------------------------------------------ */

function zufall(saat: number) {
  let s = saat;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function leinwand(
  b: number,
  h: number,
  malen: (g: CanvasRenderingContext2D, r: () => number) => void,
  saat = 1,
) {
  const c = document.createElement("canvas");
  c.width = b;
  c.height = h;
  malen(c.getContext("2d")!, zufall(saat));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

function koernung(
  g: CanvasRenderingContext2D,
  r: () => number,
  b: number,
  h: number,
  n: number,
  farben: string[],
  groesse = 2,
) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = farben[Math.floor(r() * farben.length)];
    const s = 0.6 + r() * groesse;
    g.fillRect(r() * b, r() * h, s, s);
  }
}

const tex = {
  kies: () =>
    leinwand(256, 256, (g, r) => {
      g.fillStyle = "#EAE2D6";
      g.fillRect(0, 0, 256, 256);
      koernung(g, r, 256, 256, 6000, ["#E0D7CA", "#F1EAE0", "#DCD2C4"]);
    }, 3),
  asphalt: () =>
    leinwand(256, 256, (g, r) => {
      g.fillStyle = "#C4BBAE";
      g.fillRect(0, 0, 256, 256);
      koernung(g, r, 256, 256, 4000, ["#BBB2A4", "#CBC3B7"], 1.4);
    }, 5),
  /* Schalungsbeton: waagerechte Fugen der Schalung, senkrechte Stöße,
     unten etwas Spritzwasser. */
  beton: () =>
    leinwand(512, 256, (g, r) => {
      g.fillStyle = "#E6DED2";
      g.fillRect(0, 0, 512, 256);
      koernung(g, r, 512, 256, 3000, ["#DDD4C7", "#EEE7DD"], 2.5);
      g.fillStyle = "rgba(70,70,65,0.16)";
      for (let y = 0; y < 256; y += 42) g.fillRect(0, y, 512, 1.5);
      for (let x = 0; x < 512; x += 128) g.fillRect(x, 0, 1.5, 256);
      g.fillStyle = "rgba(60,60,55,0.25)";
      for (let x = 0; x < 512; x += 32)
        for (let y = 21; y < 256; y += 42) g.fillRect(x + 16, y, 2, 2);
      const v = g.createLinearGradient(0, 180, 0, 256);
      v.addColorStop(0, "rgba(80,78,70,0)");
      v.addColorStop(1, "rgba(80,78,70,0.28)");
      g.fillStyle = v;
      g.fillRect(0, 180, 512, 76);
    }, 7),
  /* Container: Trapezblech mit Ober- und Untergurt. */
  container: () =>
    leinwand(512, 256, (g) => {
      g.fillStyle = "#E3E6E4";
      g.fillRect(0, 0, 512, 256);
      for (let x = 0; x < 512; x += 9) {
        g.fillStyle = "#C8CDCB";
        g.fillRect(x, 0, 3, 256);
        g.fillStyle = "#F4F6F5";
        g.fillRect(x + 3, 0, 1, 256);
      }
      g.fillStyle = "#B9BEBC";
      g.fillRect(0, 0, 512, 7);
      g.fillRect(0, 244, 512, 12);
    }),
  /* Klimagerät: Rahmen, zwei Lüfter mit Gitter. */
  klima: () =>
    leinwand(256, 256, (g) => {
      g.fillStyle = "#B7BCBF";
      g.fillRect(0, 0, 256, 256);
      g.strokeStyle = "#8C9296";
      g.lineWidth = 6;
      g.strokeRect(3, 3, 250, 250);
      for (const cy of [70, 186]) {
        g.fillStyle = "#3F4549";
        g.beginPath();
        g.arc(128, cy, 52, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = "#9AA0A4";
        g.lineWidth = 2;
        for (let r = 10; r < 52; r += 8) {
          g.beginPath();
          g.arc(128, cy, r, 0, Math.PI * 2);
          g.stroke();
        }
      }
    }),
  /* Silofolie: Bahnen, Falten und Altreifen als Beschwerung. */
  folie: () =>
    leinwand(512, 256, (g, r) => {
      g.fillStyle = "#2E3632";
      g.fillRect(0, 0, 512, 256);
      g.strokeStyle = "rgba(120,130,125,0.25)";
      g.lineWidth = 1;
      for (let i = 0; i < 70; i++) {
        g.beginPath();
        const x = r() * 512;
        g.moveTo(x, 0);
        g.bezierCurveTo(x + 20, 80, x - 20, 170, x + 10, 256);
        g.stroke();
      }
      for (let x = 20; x < 512; x += 40)
        for (let y = 24; y < 256; y += 48) {
          g.fillStyle = "#15181A";
          g.beginPath();
          g.arc(x + (y % 96 ? 20 : 0), y, 9, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#2E3632";
          g.beginPath();
          g.arc(x + (y % 96 ? 20 : 0), y, 4, 0, Math.PI * 2);
          g.fill();
        }
    }, 11),
  /* Fassade: Putz, Fensterband, Sockel. */
  fassade: () =>
    leinwand(512, 256, (g) => {
      g.fillStyle = "#E2E0D8";
      g.fillRect(0, 0, 512, 256);
      g.fillStyle = "#A9A79F";
      g.fillRect(0, 226, 512, 30);
      for (let x = 24; x < 500; x += 64) {
        g.fillStyle = "#59626B";
        g.fillRect(x, 90, 40, 70);
        g.fillStyle = "#8F9AA4";
        g.fillRect(x + 3, 93, 16, 64);
        g.fillStyle = "#C5C9CB";
        g.fillRect(x, 88, 40, 3);
        g.fillRect(x + 19, 90, 2, 70);
      }
    }),
  /* BHKW-Container: Lüftungslamellen. */
  lamellen: () =>
    leinwand(512, 256, (g) => {
      g.fillStyle = "#5C6E61";
      g.fillRect(0, 0, 512, 256);
      for (let y = 40; y < 200; y += 7) {
        g.fillStyle = "#3E4C43";
        g.fillRect(40, y, 180, 3);
        g.fillRect(300, y, 180, 3);
      }
      g.fillStyle = "#4A5A4F";
      g.fillRect(0, 248, 512, 8);
    }),
  /* Zaungeflecht: transparent, nur die Drähte. */
  zaun: () =>
    leinwand(64, 64, (g) => {
      g.clearRect(0, 0, 64, 64);
      g.strokeStyle = "rgba(140,148,153,0.85)";
      g.lineWidth = 3;
      for (let i = -64; i < 128; i += 32) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i + 64, 64);
        g.stroke();
        g.beginPath();
        g.moveTo(i + 64, 0);
        g.lineTo(i, 64);
        g.stroke();
      }
    }),
  /**
   * Modultisch: 2 Reihen × 38 Module hochkant, je 6 × 10 Zellen, silberne
   * Busbars, heller Aluminiumrahmen.
   */
  modul: () =>
    leinwand(2048, 256, (g) => {
      g.fillStyle = "#D5D9DD";
      g.fillRect(0, 0, 2048, 256);
      const mb = 2048 / 38;
      const mh = 128;
      for (let r = 0; r < 2; r++)
        for (let m = 0; m < 38; m++) {
          const x0 = m * mb + 1.5;
          const y0 = r * mh + 2;
          const w = mb - 3;
          const h = mh - 4;
          const v = g.createLinearGradient(x0, y0, x0 + w, y0 + h);
          v.addColorStop(0, "#3C6496");
          v.addColorStop(1, "#24426E");
          g.fillStyle = v;
          g.fillRect(x0, y0, w, h);
          g.strokeStyle = "rgba(160,178,200,0.35)";
          g.lineWidth = 1;
          for (let k = 1; k < 6; k++) {
            g.beginPath();
            g.moveTo(x0 + (w * k) / 6, y0);
            g.lineTo(x0 + (w * k) / 6, y0 + h);
            g.stroke();
          }
          for (let k = 1; k < 10; k++) {
            g.beginPath();
            g.moveTo(x0, y0 + (h * k) / 10);
            g.lineTo(x0 + w, y0 + (h * k) / 10);
            g.stroke();
          }
        }
    }),
};

/** Material mit eigener Wiederholung derselben Textur. */
function mitTextur(
  t: THREE.Texture,
  rx: number,
  ry: number,
  p: THREE.MeshStandardMaterialParameters = {},
) {
  const k = t.clone();
  k.repeat.set(rx, ry);
  k.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: k, roughness: 0.9, ...p });
}

/* Einmal angelegt, von allen Kraftwerken geteilt. */
const T = {
  kies: tex.kies(),
  asphalt: tex.asphalt(),
  beton: tex.beton(),
  container: tex.container(),
  klima: tex.klima(),
  folie: tex.folie(),
  fassade: tex.fassade(),
  lamellen: tex.lamellen(),
  zaun: tex.zaun(),
  modul: tex.modul(),
};

/* Farben wie bei einem Architekturmodell, nicht wie in echt: helle,
   warme Flächen, die zum Boden passen, und je Kraftwerk ein Akzent
   (Module tiefblau, Biogas salbeigrün, Trafos schieferblau, Dächer und
   Isolatoren im Rot der Marke). Mit echtem Kies und Asphalt standen die
   Kraftwerke im Abendlicht als dunkelbraune Flecken auf dem Feld. */
export const mat = {
  hell: new THREE.MeshStandardMaterial({ color: "#F4F0E9", roughness: 0.62 }),
  beton: new THREE.MeshStandardMaterial({ color: "#E2D9CC", roughness: 0.9 }),
  dunkel: new THREE.MeshStandardMaterial({ color: "#3A4047", roughness: 0.7 }),
  stahl: new THREE.MeshStandardMaterial({
    color: "#8E979E",
    roughness: 0.5,
    metalness: 0.3,
  }),
  verzinkt: new THREE.MeshStandardMaterial({
    color: "#A9B0B4",
    roughness: 0.55,
    metalness: 0.2,
  }),
  alu: new THREE.MeshStandardMaterial({
    color: "#CDD2D6",
    roughness: 0.4,
    metalness: 0.25,
  }),
  porzellan: new THREE.MeshStandardMaterial({
    color: "#C9603F",
    roughness: 0.3,
  }),
  trafo: new THREE.MeshStandardMaterial({ color: "#5A6B82", roughness: 0.55 }),
  rippe: new THREE.MeshStandardMaterial({ color: "#4A5A70", roughness: 0.6 }),
  membran: new THREE.MeshStandardMaterial({ color: "#AFC09F", roughness: 0.85 }),
  membranHell: new THREE.MeshStandardMaterial({
    color: "#DCE3D2",
    roughness: 0.85,
  }),
  dach: new THREE.MeshStandardMaterial({ color: "#D06A48", roughness: 0.8 }),
  /* Nicht metallisch: Ohne Umgebungskarte spiegelt ein metallisches
     Material nichts und bleibt schwarz. */
  modul: new THREE.MeshStandardMaterial({
    map: T.modul,
    roughness: 0.32,
    metalness: 0,
  }),
  container: mitTextur(T.container, 1, 1, { roughness: 0.6 }),
  klima: mitTextur(T.klima, 1, 1, { roughness: 0.6 }),
  fassade: mitTextur(T.fassade, 1, 1),
  lamellen: mitTextur(T.lamellen, 1, 1, { roughness: 0.7 }),
  folie: mitTextur(T.folie, 3, 1, { roughness: 0.45 }),
  betonWand: mitTextur(T.beton, 1, 1),
  betonTank: mitTextur(T.beton, 6, 1),
  /* Zaungeflecht geblendet statt per alphaTest: Mit alphaTest fallen
     die Drähte in den kleinen Mipmap-Stufen unter die Schwelle und
     blinken beim Fahren an und aus (Moiré). Geblendet mitteln die
     Mipmaps sie zu einem ruhigen, halbtransparenten Grau. */
  zaun: new THREE.MeshStandardMaterial({
    map: T.zaun,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    roughness: 0.6,
    metalness: 0.2,
  }),
};

const kies = (b: number, t: number) =>
  mitTextur(T.kies, b / 8, t / 8, { roughness: 1 });
const asphalt = (b: number, t: number) =>
  mitTextur(T.asphalt, b / 10, t / 10, { roughness: 0.95 });

/* ------------------------------------------------------------------ */
/* Solarpark                                                           */
/* ------------------------------------------------------------------ */

/** 13 Reihen Modultische, 25° nach Süden geneigt, Wechselrichter, Zaun. */
export function solarpark(): Teil[] {
  const paneele: Geo[] = [];
  const gestell: Geo[] = [];
  const neigung = THREE.MathUtils.degToRad(25);
  for (let r = 0; r < 13; r++) {
    const z = -78 + r * 13;
    for (const x of [-46, 0, 46]) {
      paneele.push(
        new THREE.BoxGeometry(42, 0.12, 6.4)
          .rotateX(neigung)
          .translate(x, 2.2, z),
      );
      for (const dx of [-18, -6, 6, 18]) {
        gestell.push(block(x + dx, 0, z - 2.2, 0.18, 3.6, 0.18));
        gestell.push(block(x + dx, 0, z + 2.2, 0.18, 1.4, 0.18));
        gestell.push(balken([x + dx, 1.4, z + 2.2], [x + dx, 3.6, z - 2.2], 0.12));
      }
    }
  }
  const stationen = [-50, 50].map((x) => block(x, 0, 92, 6, 2.8, 2.6));
  const wege = [block(0, 0, 92, 150, BELAG, 4), block(0, 0, 112, 5, BELAG, 36)];
  const z = zaun(160, 200);
  return [
    { geo: eins(paneele), mat: mat.modul, wirft: true },
    { geo: eins([...gestell, ...z.pfosten]), mat: mat.verzinkt, wirft: true },
    { geo: eins(z.netz), mat: mat.zaun },
    { geo: eins(stationen), mat: mat.container, wirft: true },
    { geo: eins(wege), mat: kies(150, 40) },
  ];
}

/* ------------------------------------------------------------------ */
/* Batteriespeicher                                                    */
/* ------------------------------------------------------------------ */

/**
 * BESS: 4 Reihen × 6 Container (40 ft), Klimageräte an den Stirnseiten,
 * Kabelpritschen, je Reihe eine Station aus Wechselrichter und
 * Transformator, Mittelspannungsstation, Zaun, Lichtmasten, Zufahrt.
 */
export function speicher(): Teil[] {
  const container: Geo[] = [];
  const klima: Geo[] = [];
  const fundament: Geo[] = [];
  const stahl: Geo[] = [];
  const trafo: Geo[] = [];
  const rippen: Geo[] = [];
  const porzellan: Geo[] = [];
  const reihen = [-30, -12, 6, 24];
  for (const z of reihen) {
    for (let c = 0; c < 6; c++) {
      const x = -46 + c * 16;
      fundament.push(block(x, 0, z, 13.6, 0.3, 3.0));
      container.push(block(x, 0.3, z, 12.2, 2.9, 2.44));
      for (const s of [-1, 1])
        klima.push(block(x + s * 6.55, 0.55, z, 0.9, 2.1, 1.9));
    }
    stahl.push(block(-6, 0.3, z + 2.1, 96, 0.12, 0.6));
    for (let x = -52; x <= 42; x += 4)
      stahl.push(block(x, 0, z + 2.1, 0.08, 0.3, 0.08));
    /* Station am Reihenende */
    fundament.push(block(50.5, 0, z, 12, 0.3, 3.4));
    container.push(block(47, 0.3, z, 6, 2.6, 2.4));
    trafo.push(block(53.6, 0.3, z, 2.6, 2.3, 2.0));
    for (let i = 0; i < 7; i++)
      for (const s of [-1, 1])
        rippen.push(block(53.6 - 1.05 + i * 0.35, 0.55, z + s * 1.15, 0.06, 1.7, 0.3));
    for (const dz of [-0.6, 0, 0.6]) isolator(porzellan, 53.6, 2.6, z + dz, 0.7, 0.06);
  }
  const ms = [block(-50, 0, -38, 9, 3.2, 4)];
  const kiesflaeche = [block(0, 0, 0, 124, BELAG, 86)];
  const zufahrt = [block(0, 0, 76.5, 7, BELAG, 67)];
  const z = zaun(124, 86);
  const masten: Geo[] = [];
  for (const [x, zz] of [
    [-60, -41],
    [60, -41],
    [-60, 41],
    [60, 41],
  ])
    lichtmast(masten, x, zz);
  return [
    { geo: eins(container), mat: mat.container, wirft: true },
    { geo: eins(klima), mat: mat.klima, wirft: true },
    { geo: eins(fundament), mat: mat.beton, wirft: true },
    { geo: eins([...stahl, ...z.pfosten, ...masten]), mat: mat.verzinkt, wirft: true },
    { geo: eins(trafo), mat: mat.trafo, wirft: true },
    { geo: eins(rippen), mat: mat.rippe, wirft: true },
    { geo: eins(porzellan), mat: mat.porzellan },
    { geo: eins(ms), mat: mat.fassade, wirft: true },
    { geo: eins(z.netz), mat: mat.zaun },
    { geo: eins(kiesflaeche), mat: kies(124, 86) },
    { geo: eins(zufahrt), mat: asphalt(7, 66) },
  ];
}

/* ------------------------------------------------------------------ */
/* Biogasanlage                                                        */
/* ------------------------------------------------------------------ */

/**
 * Zwei Fermenter mit Doppelmembrandach, Gärrestlager mit Zeltdach,
 * Treppenturm mit Laufstegen, Gasleitungen auf einer Rohrbrücke,
 * BHKW-Container mit Abgaskamin und Notkühlern, Gasfackel, Feststoff-
 * eintrag, zwei Fahrsilos unter Folie, Technikgebäude mit Satteldach.
 */
export function biogas(): Teil[] {
  const tankWand: Geo[] = [];
  const membran: Geo[] = [];
  const membranHell: Geo[] = [];
  const dunkel: Geo[] = [];
  const stahl: Geo[] = [];
  const hell: Geo[] = [];
  const betonWand: Geo[] = [];
  const folie: Geo[] = [];

  const fermenter: [number, number][] = [
    [-30, -16],
    [4, -26],
  ];
  for (const [x, z] of fermenter) {
    tankWand.push(zylinder(x, 0, z, 13, 6.5, 64));
    dunkel.push(ring(x, 6.5, z, 13.05, 0.22));
    /* Doppelmembran: flache Halbkugel, 5,5 m Stich */
    membran.push(
      new THREE.SphereGeometry(13, 48, 14, 0, Math.PI * 2, 0, Math.PI / 2)
        .scale(1, 0.42, 1)
        .translate(x, 6.5, z),
    );
    /* Schauglas-Bühne und Rührwerksstützen am Rand */
    for (let k = 0; k < 4; k++) {
      const w = (k / 4) * Math.PI * 2 + 0.4;
      stahl.push(
        block(x + Math.cos(w) * 13.4, 0, z + Math.sin(w) * 13.4, 0.5, 6.8, 0.5),
      );
    }
  }
  /* Gärrestlager mit Zeltdach */
  tankWand.push(zylinder(-4, 0, 24, 17, 5, 72));
  dunkel.push(ring(-4, 5, 24, 17.05, 0.22));
  membranHell.push(new THREE.ConeGeometry(17.1, 4.2, 72, 1).translate(-4, 7.1, 24));
  stahl.push(zylinder(-4, 5, 24, 0.15, 4.6, 8));

  /* Treppenturm zwischen den Fermentern, Laufstege zu beiden Rändern */
  gitterSaeule(stahl, -13, -30, 8, 2.4);
  stahl.push(block(-13, 8, -30, 3, 0.15, 3));
  stahl.push(balken([-13, 7.6, -30], [-19, 6.8, -22], 0.25));
  stahl.push(balken([-13, 7.6, -30], [-8, 6.8, -27], 0.25));
  for (let i = 0; i < 9; i++)
    stahl.push(block(-11.4, i * 0.85, -30 + 1.2 - i * 0.3, 0.9, 0.08, 0.3));

  /* Rohrbrücke: von den Fermentern zum BHKW */
  const pfad: V3[] = [
    [-16, 3.4, -4],
    [12, 3.4, -4],
    [30, 3.4, 4],
  ];
  for (let i = 0; i < pfad.length - 1; i++) {
    for (const dz of [-0.35, 0.35]) {
      const a: V3 = [pfad[i][0], pfad[i][1], pfad[i][2] + dz];
      const b: V3 = [pfad[i + 1][0], pfad[i + 1][1], pfad[i + 1][2] + dz];
      hell.push(rohr(a, b, 0.16));
    }
    const len = Math.hypot(pfad[i + 1][0] - pfad[i][0], pfad[i + 1][2] - pfad[i][2]);
    const n = Math.round(len / 6);
    for (let k = 0; k <= n; k++) {
      const f = k / n;
      const px = pfad[i][0] + (pfad[i + 1][0] - pfad[i][0]) * f;
      const pz = pfad[i][2] + (pfad[i + 1][2] - pfad[i][2]) * f;
      stahl.push(block(px, 0, pz, 0.2, 3.2, 0.2));
      stahl.push(block(px, 3.15, pz, 0.2, 0.12, 1.2));
    }
  }

  /* BHKW: Container, Notkühler auf dem Dach, Kamin mit Schalldämpfer */
  const bhkw = [block(36, 0.25, 6, 12.2, 2.9, 2.9), block(36, 0.25, 12, 12.2, 2.9, 2.9)];
  const kuehler: Geo[] = [];
  for (const z of [6, 12]) {
    kuehler.push(block(34, 3.15, z, 6, 0.9, 2.4));
    stahl.push(rohr([41.5, 0, z + 1.6], [41.5, 11, z + 1.6], 0.3));
    dunkel.push(zylinder(41.5, 5.5, z + 1.6, 0.65, 2.6, 16));
  }
  hell.push(block(36, 0, 9, 14, 0.25, 10));

  /* Gasfackel */
  dunkel.push(block(48, 0, -22, 2.2, 1.2, 2.2));
  stahl.push(rohr([48, 1.2, -22], [48, 8.5, -22], 0.25));
  dunkel.push(zylinder(48, 8.5, -22, 0.5, 1.3, 16));

  /* Entschwefelung / Gasspeicher-Behälter */
  hell.push(zylinder(22, 0, -10, 1.6, 5.5, 24));
  hell.push(zylinder(26, 0, -10, 1.6, 5.5, 24));

  /* Feststoffeintrag am ersten Fermenter */
  stahl.push(block(-12, 0, -4, 6, 3.2, 3.2));
  stahl.push(balken([-12, 3.2, -4], [-17, 5.5, -9], 0.6));

  /* Fahrsilos: drei Wände, zwei Kammern, Silage unter Folie */
  for (const z of [32, 44, 56])
    betonWand.push(block(-44, 0, z, 34, 3, 0.6));
  betonWand.push(block(-61, 0, 44, 0.6, 3, 24.6));
  for (const z of [38, 50])
    folie.push(
      new THREE.CylinderGeometry(5.4, 5.4, 32, 28, 1, false, -Math.PI / 2, Math.PI)
        .rotateZ(Math.PI / 2)
        .scale(1, 0.55, 1)
        .translate(-43, 0, z),
    );

  /* Technikgebäude */
  const haus = [block(26, 0, 32, 16, 4.5, 9)];
  const dach = [satteldach(26, 4.5, 32, 16.8, 9.8, 2.8)];

  const hof = [block(0, 0, 8, 136, BELAG, 104)];

  return [
    { geo: eins(tankWand), mat: mat.betonTank, wirft: true },
    { geo: eins(membran), mat: mat.membran, wirft: true },
    { geo: eins(membranHell), mat: mat.membranHell, wirft: true },
    { geo: eins(dunkel), mat: mat.dunkel, wirft: true },
    { geo: eins(stahl), mat: mat.verzinkt, wirft: true },
    { geo: eins(hell), mat: mat.hell, wirft: true },
    { geo: eins(bhkw), mat: mat.lamellen, wirft: true },
    { geo: eins(kuehler), mat: mat.klima, wirft: true },
    { geo: eins(betonWand), mat: mat.betonWand, wirft: true },
    { geo: eins(folie), mat: mat.folie, wirft: true },
    { geo: eins(haus), mat: mat.fassade, wirft: true },
    { geo: eins(dach), mat: mat.dach, wirft: true },
    { geo: eins(hof), mat: asphalt(136, 104) },
  ];
}

/* ------------------------------------------------------------------ */
/* Umspannwerk                                                         */
/* ------------------------------------------------------------------ */

/** Lokale Lage des Abspannportals, an dem die Freileitung endet. */
export const PORTAL = { x: 60, leiterY: 15.6, erdseilY: 18.6 };

/**
 * Freiluft-Umspannwerk 110/20 kV: Abspannportal in Gitterbauweise,
 * zwei Schaltfelder mit je drei Phasen (Überspannungsableiter,
 * Spannungswandler, Trenner, Leistungsschalter, Stromwandler, Trenner),
 * Rohr-Sammelschiene auf Stützisolatoren unter einem zweiten Portal,
 * zwei Transformatoren mit Radiatoren, Ausdehnungsgefäß und Durchführungen,
 * Brandschutzwand, Betriebsgebäude, Blitzschutzmasten, Zaun.
 */
export function umspannwerk(): Teil[] {
  const gitter: Geo[] = [];
  const stahl: Geo[] = [];
  const porzellan: Geo[] = [];
  const alu: Geo[] = [];
  const dunkel: Geo[] = [];
  const trafo: Geo[] = [];
  const rippen: Geo[] = [];
  const beton: Geo[] = [];

  /* Abspannportal: zwei Gittersäulen, Gitterträger, Abspannketten */
  for (const z of [-15, 15]) gitterSaeule(gitter, PORTAL.x, z, 18, 1.4);
  gitterTraeger(gitter, [PORTAL.x, 18, -15], [PORTAL.x, 18, 15], 1.2);
  gitter.push(balken([PORTAL.x, 18.6, -15], [PORTAL.x, 18.6, 15], 0.1));
  for (const z of [-11, -8.5, 8.5, 11])
    porzellan.push(
      ...(() => {
        const t: Geo[] = [];
        isolator(t, PORTAL.x, PORTAL.leiterY, z, 2.4, 0.07);
        return t;
      })(),
    );

  /* Zwei Schaltfelder × drei Phasen */
  const felder = [-9, 9];
  const phasen = [-2.4, 0, 2.4];
  const sockel = (x: number, z: number, h: number) =>
    stahl.push(block(x, 0, z, 0.4, h, 0.4));
  for (const c of felder) {
    for (const dp of phasen) {
      const z = c + dp;
      /* Überspannungsableiter mit Steuerring */
      sockel(50, z, 2.6);
      isolator(porzellan, 50, 2.6, z, 2.8, 0.1);
      alu.push(ring(50, 5.5, z, 0.45, 0.04));
      /* Spannungswandler */
      sockel(45, z, 2.6);
      isolator(porzellan, 45, 2.6, z, 2.0, 0.14);
      dunkel.push(zylinder(45, 4.6, z, 0.45, 0.9, 16));
      /* Trenner: zwei Säulen, Messer */
      for (const dx of [-1.4, 1.4]) {
        sockel(38 + dx, z, 2.6);
        isolator(porzellan, 38 + dx, 2.6, z, 2.0, 0.12);
      }
      alu.push(balken([36.6, 4.7, z], [39.4, 4.7, z], 0.1));
      /* Leistungsschalter */
      sockel(31, z, 2.8);
      isolator(porzellan, 31, 2.8, z, 2.8, 0.17);
      alu.push(zylinder(31, 5.6, z, 0.32, 0.8, 16));
      /* Stromwandler */
      sockel(24, z, 2.6);
      isolator(porzellan, 24, 2.6, z, 2.2, 0.15);
      dunkel.push(zylinder(24, 4.8, z, 0.55, 1.1, 16));
      /* Trenner zur Sammelschiene */
      for (const dx of [-1.4, 1.4]) {
        sockel(16 + dx, z, 2.6);
        isolator(porzellan, 16 + dx, 2.6, z, 2.0, 0.12);
      }
      alu.push(balken([14.6, 4.7, z], [17.4, 4.7, z], 0.1));
      /* Seile/Rohre zwischen den Geräten */
      const kopf: V3[] = [
        [PORTAL.x, PORTAL.leiterY - 0.2, z],
        [50, 5.6, z],
        [45, 5.6, z],
        [39.4, 4.8, z],
        [36.6, 4.8, z],
        [31, 6.4, z],
        [24, 5.9, z],
        [17.4, 4.8, z],
        [14.6, 4.8, z],
        [2, 9, z],
      ];
      for (let i = 0; i < kopf.length - 1; i++)
        if (i !== 2 && i !== 6) alu.push(rohr(kopf[i], kopf[i + 1], 0.05, 6));
    }
    /* Antriebskasten des Leistungsschalters */
    dunkel.push(block(31, 0, c - 4.2, 1.2, 1.6, 0.8));
  }

  /* Rohr-Sammelschiene längs z auf Stützisolatoren, Portal darüber */
  for (const x of [-0.5, 2, 4.5]) {
    alu.push(rohr([x, 9.2, -24], [x, 9.2, 24], 0.1, 8));
    for (let z = -21; z <= 21; z += 7) {
      stahl.push(block(x, 0, z, 0.4, 5.4, 0.4));
      isolator(porzellan, x, 5.4, z, 3.6, 0.13);
    }
  }
  for (const z of [-26, 26]) gitterSaeule(gitter, 2, z, 13, 1.2);
  gitterTraeger(gitter, [2, 13, -26], [2, 13, 26], 1.0);

  /* Transformatoren */
  for (const z of [-17, 17]) {
    beton.push(block(-30, 0, z, 11, 0.5, 8));
    dunkel.push(block(-30, 0.02, z, 11.6, 0.3, 8.6));
    trafo.push(block(-30, 0.5, z, 6.5, 4.2, 3.6));
    trafo.push(block(-30, 4.7, z, 6.8, 0.25, 3.9));
    for (const s of [-1, 1]) {
      for (let i = 0; i < 18; i++)
        rippen.push(block(-33 + i * 0.35, 0.9, z + s * 2.6, 0.06, 3.3, 1.3));
      rippen.push(block(-30, 4.0, z + s * 2.0, 6.2, 0.12, 0.25));
    }
    /* Ausdehnungsgefäß */
    trafo.push(rohr([-33.2, 6.4, z + 1.2], [-28.8, 6.4, z + 1.2], 0.55, 16));
    stahl.push(block(-32.5, 4.95, z + 1.2, 0.15, 1.0, 0.15));
    stahl.push(block(-29.5, 4.95, z + 1.2, 0.15, 1.0, 0.15));
    /* Durchführungen: Ober- und Unterspannung */
    for (const dz of [-1.1, 0, 1.1]) {
      isolator(porzellan, -27.8, 4.95, z + dz, 2.6, 0.12);
      isolator(porzellan, -32.4, 4.95, z + dz * 0.8, 1.0, 0.09);
      alu.push(rohr([-27.8, 7.6, z + dz], [-0.5 + (dz + 1.1) * 2.27, 9.2, z * 0.6], 0.04, 6));
    }
  }
  /* Brandschutzwand */
  beton.push(block(-30, 0, 0, 12, 7.5, 0.5));

  /* Blitzschutzmasten */
  for (const [x, z] of [
    [68, -46],
    [68, 46],
    [-68, -46],
    [-68, 46],
  ])
    stahl.push(
      new THREE.CylinderGeometry(0.1, 0.32, 22, 10).translate(x, 11, z),
    );

  /* Betriebsgebäude mit Attika, Schaltcontainer Mittelspannung */
  const haus = [block(-58, 0, -30, 14, 4.6, 26)];
  dunkel.push(block(-58, 4.6, -30, 14.4, 0.5, 26.4));
  const container = [block(-58, 0, 18, 12.2, 3, 3), block(-58, 0, 24, 12.2, 3, 3)];

  const z = zaun(150, 100);
  const flaeche = [block(0, 0, 0, 150, BELAG, 100)];
  const wege = [block(0, 0, -42, 146, STRASSE, 5), block(-44, 0, 0, 5, STRASSE, 80)];

  return [
    { geo: eins(gitter), mat: mat.verzinkt, wirft: true },
    { geo: eins([...stahl, ...z.pfosten]), mat: mat.verzinkt, wirft: true },
    { geo: eins(porzellan), mat: mat.porzellan, wirft: true },
    { geo: eins(alu), mat: mat.alu, wirft: true },
    { geo: eins(dunkel), mat: mat.dunkel, wirft: true },
    { geo: eins(trafo), mat: mat.trafo, wirft: true },
    { geo: eins(rippen), mat: mat.rippe, wirft: true },
    { geo: eins(beton), mat: mat.betonWand, wirft: true },
    { geo: eins(haus), mat: mat.fassade, wirft: true },
    { geo: eins(container), mat: mat.container, wirft: true },
    { geo: eins(z.netz), mat: mat.zaun },
    { geo: eins(flaeche), mat: kies(150, 100) },
    { geo: eins(wege), mat: asphalt(146, 80) },
  ];
}
