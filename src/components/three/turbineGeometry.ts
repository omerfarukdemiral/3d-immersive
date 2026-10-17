import * as THREE from "three";

/**
 * Prozedurale Geometrie einer Windkraftanlage.
 *
 * Bewusst kein GLTF-Download: Die Anlage ist geometrisch einfach genug,
 * um sie im Code zu erzeugen. Das spart den kompletten Modell-Download
 * (Budget war < 2 MB – wir landen bei 0), hält die Polygonzahl niedrig
 * und erlaubt es, jedes Bauteil einzeln zu animieren, was der
 * Explosionsdarstellung im Anatomie-Abschnitt zugrunde liegt.
 *
 * Maßstab: 1 Einheit = 1 Meter, angelehnt an eine 1-MW-Klasse-Anlage
 * (Nabenhöhe ~60 m, Rotordurchmesser ~60 m) – die Größenordnung der
 * NEG Micon NM60, einer typischen Altanlage dieser Klasse.
 */

export const DIMENSIONS = {
  towerHeight: 60,
  towerBaseRadius: 2.1,
  towerTopRadius: 1.15,
  nacelleLength: 7.2,
  nacelleHeight: 2.9,
  nacelleWidth: 2.9,
  hubRadius: 1.35,
  bladeLength: 29,
  bladeRootChord: 2.9,
  bladeMaxChord: 3.7,
  bladeTipChord: 0.55,
} as const;

/**
 * Ein Rotorblatt als geloftete Fläche.
 *
 * Über die Blattlänge laufen drei Größen gleichzeitig:
 *  - Chord (Profiltiefe) steigt kurz nach der Wurzel auf ihr Maximum
 *    und läuft dann zur Spitze hin aus,
 *  - Dicke nimmt stetig ab,
 *  - Twist dreht das Profil zur Spitze hin flacher.
 * Genau dieses Zusammenspiel macht die Silhouette erkennbar; eine
 * simple verjüngte Box sieht sofort nach Platzhalter aus.
 */
export function createBladeGeometry(
  segments = 26,
  profilePoints = 14,
): THREE.BufferGeometry {
  const { bladeLength, bladeRootChord, bladeMaxChord, bladeTipChord } =
    DIMENSIONS;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const chordAt = (t: number) => {
    // Anstieg bis ~18 % der Länge, danach Auslauf zur Spitze
    if (t < 0.18) {
      const k = t / 0.18;
      return bladeRootChord + (bladeMaxChord - bladeRootChord) * k;
    }
    const k = (t - 0.18) / 0.82;
    return bladeMaxChord + (bladeTipChord - bladeMaxChord) * Math.pow(k, 0.85);
  };

  const thicknessAt = (t: number) => {
    const rel = 0.42 - 0.3 * Math.pow(t, 0.65); // Wurzel dick, Spitze dünn
    return Math.max(rel, 0.075);
  };

  const twistAt = (t: number) =>
    THREE.MathUtils.degToRad(16 * (1 - t) * (1 - t));

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const span = t * bladeLength;
    const chord = chordAt(t);
    const thick = thicknessAt(t) * chord;
    const twist = twistAt(t);

    for (let j = 0; j < profilePoints; j++) {
      const a = (j / profilePoints) * Math.PI * 2;

      // Tragflächenähnliches Profil: Oberseite gewölbter als Unterseite
      const cx = Math.cos(a) * (chord * 0.5);
      const camber = Math.sin(a) > 0 ? 1.25 : 0.8;
      const cy = Math.sin(a) * (thick * 0.5) * camber;

      const x = cx * Math.cos(twist) - cy * Math.sin(twist);
      const y = cx * Math.sin(twist) + cy * Math.cos(twist);

      // Y = Spannweite (Blatt zeigt nach oben), X/Z = Profilebene
      positions.push(x, span, y);

      const n = new THREE.Vector3(x, 0, y).normalize();
      normals.push(n.x, n.y * 0.15, n.z);
      uvs.push(j / profilePoints, t);
    }
  }

  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < profilePoints; j++) {
      const a = i * profilePoints + j;
      const b = i * profilePoints + ((j + 1) % profilePoints);
      const c = (i + 1) * profilePoints + j;
      const d = (i + 1) * profilePoints + ((j + 1) % profilePoints);
      indices.push(a, c, b, b, c, d);
    }
  }

  // Spitze schließen
  const tipIndex = positions.length / 3;
  positions.push(0, bladeLength, 0);
  normals.push(0, 1, 0);
  uvs.push(0.5, 1);
  for (let j = 0; j < profilePoints; j++) {
    const a = segments * profilePoints + j;
    const b = segments * profilePoints + ((j + 1) % profilePoints);
    indices.push(a, tipIndex, b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  /**
   * Zwei Materialgruppen statt eines aufgesetzten Rings: Die letzten
   * Segmente bilden die rote Spitzenmarkierung, die jede Anlage nach
   * Luftfahrtauflage trägt. Über Geometriegruppen sitzt sie exakt auf
   * dem Blattprofil – ein separates Mesh würde an der gewölbten
   * Oberfläche sichtbar aufliegen.
   */
  const indicesPerSegment = profilePoints * 6;
  const tipStartSegment = Math.max(0, segments - Math.round(segments * 0.13));
  const splitAt = tipStartSegment * indicesPerSegment;

  geo.clearGroups();
  geo.addGroup(0, splitAt, 0);
  geo.addGroup(splitAt, indices.length - splitAt, 1);

  return geo;
}

/** Leicht konischer Turm. */
export function createTowerGeometry(): THREE.BufferGeometry {
  const { towerHeight, towerBaseRadius, towerTopRadius } = DIMENSIONS;
  const geo = new THREE.CylinderGeometry(
    towerTopRadius,
    towerBaseRadius,
    towerHeight,
    28,
    1,
    true,
  );
  geo.translate(0, towerHeight / 2, 0);
  return geo;
}

/** Fundamentsockel. */
export function createFoundationGeometry(): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(3.4, 4.1, 1.6, 24);
  geo.translate(0, 0.8, 0);
  return geo;
}

/**
 * Maschinenhaus: Kapsel statt Box – die abgerundete Form entspricht
 * eher der realen Gondelverkleidung und wirkt weniger nach Prototyp.
 */
export function createNacelleGeometry(): THREE.BufferGeometry {
  const { nacelleLength, nacelleHeight } = DIMENSIONS;
  const geo = new THREE.CapsuleGeometry(
    nacelleHeight / 2,
    nacelleLength - nacelleHeight,
    6,
    18,
  );
  geo.rotateZ(Math.PI / 2);
  return geo;
}

/** Nabe mit konischer Spinnerkappe. */
export function createHubGeometry(): THREE.BufferGeometry {
  const { hubRadius } = DIMENSIONS;
  const geo = new THREE.SphereGeometry(hubRadius, 20, 16);
  geo.scale(1.35, 1, 1);
  return geo;
}

export function createSpinnerGeometry(): THREE.BufferGeometry {
  const { hubRadius } = DIMENSIONS;
  const geo = new THREE.ConeGeometry(hubRadius * 0.92, hubRadius * 1.7, 20);
  geo.rotateZ(-Math.PI / 2);
  return geo;
}
