# 04 · Sayfa API'si — yeni bir alt sayfa eklemek

Bu belge ortak sahne ile tek tek sayfalar arasındaki sözleşmedir. Bir
alt sayfa eklemek ya da değiştirmek için bilmen gereken her şey burada.

Kısaca: bir sayfa iki şey verir. Bir **Partitur** (sahne, kamera ve HUD
ne yapacak) ve **Bausteine**'den kurulmuş metni. Sahne, üst bar, HUD,
bölüm rayı ve sayfa geçişi layout'a aittir; sayfa bunlara dokunmaz.

---

## 1. Ortak dosyalar

Bunlar sahnenin parçası. Bir sayfa için değiştirmen gerekmez; bir şey
eksikse sayfaya özel kopya yazmak yerine buraya genel olarak ekle.

| Dosya | İçerik |
|---|---|
| `src/app/(site)/layout.tsx` | tüm sayfaların çerçevesi: canvas ile `Erlebnis` |
| `src/components/erlebnis/Erlebnis.tsx` | rAF döngüsü: scroll → T, takt'lar, HUD, bölüm rayı, sayfa geçişi |
| `src/components/erlebnis/Szene.tsx` | canvas, kamera (geçiş dahil), gökyüzü, ışık, zemin, `zusatz` |
| `src/components/erlebnis/Anlage.tsx` | tek türbin, ankerler, çizgi çizimi |
| `src/components/erlebnis/Flotte.tsx` | 140 türbin + 9 planlama silueti |
| `src/components/erlebnis/Kraftwerke.tsx` | beş santral ve enerji hattı |
| `src/components/erlebnis/Karte.tsx` | zemindeki Almanya haritası |
| `src/components/erlebnis/partitur.ts` | tipler + yardımcılar (`zeitraster`, `stellung`) |
| `src/components/erlebnis/zeitachse.ts` | eğriler, saat, gökyüzü (`klemm`, `zahl`, `istNacht` …) |
| `src/components/erlebnis/lauf.ts` | ortak durum (`lauf`), kayıt (`buehne`) |
| `src/components/erlebnis/rundgang.ts` | sayfa sırası, kapıdaki ölçü |
| `src/components/erlebnis/bausteine/*` | Bausteine |
| `src/components/erlebnis/erlebnis.css` | tüm stiller, `.erlebnis` altında |
| `src/app/(site)/page.tsx`, `src/app/(site)/_start/*` | ana sayfa |

Sayfaya özel stil: kendi klasöründe bir CSS modülü
(`seite.module.css`), sınıflar yalnızca sayfanın kök elemanı altında.
Token'lar (`--tinte`, `--papier`, `--signal`, `--text`, `--text-2`,
`--text-3`, `--linie`, `--horizont`, `--rand`) `.erlebnis` altında her
yerde kullanılabilir; gece modunda `--text*` kendiliğinden açık renge
döner.

---

## 2. Bir sayfanın dosyaları

```
src/app/(site)/<yol>/
  page.tsx          server: metadata + Bausteine'den metin + <Buehne />
  partitur.ts       Partitur ("use client" yok; server ve client okur)
  Buehne.tsx        "use client": Partitur'u kaydeder (aşağıda)
  Hoehenring.tsx    isteğe bağlı, "use client": canvas'a ek R3F bileşeni
  seite.module.css  isteğe bağlı
```

Neden üç dosya: Partitur fonksiyon (HUD formatlayıcı) ve bileşen
(`zusatz`) içerebilir. Bunlar server'dan client'a geçirilemez. Server
`partitur.ts`'ten yalnızca veriyi okur (bölümler, yükseklikler), client
nesnenin tamamını `Buehne.tsx` üzerinden alır.

`Buehne.tsx` hep aynıdır:

```tsx
"use client";

import Anmeldung from "@/components/erlebnis/bausteine/Anmeldung";
import { partitur } from "./partitur";

/** Meldet die Partitur dieser Seite an der Bühne an. */
export default function Buehne() {
  return <Anmeldung partitur={partitur} />;
}
```

Dinamik sayfalar (`/services/[slug]`, `/insights/[slug]`): her slug için
bir Partitur, modül seviyesinde bir `Map<string, Partitur>` içinde. Her
render'da yeniden kurma: sahne sayfa değişimini nesnenin kimliğinden
anlar. `Buehne.tsx` slug'ı prop olarak alır. Örnek:
`src/app/(site)/services/[slug]/Buehne.tsx`.

Uzun sayfaların Partitur'u ve parçaları `src/components/seiten/<konu>/`
altında da durabilir; yönlendirme klasöründe kalan tek şey `page.tsx` ve
`Buehne.tsx` olur.

---

## 3. Sahne nasıl oynar

1. `(site)/layout.tsx`, `Erlebnis`'i canvas, üst bar, bölüm rayı ve HUD
   ile render eder. Sayfalar arasında geçerken layout yerinde kalır;
   canvas hiç yeniden kurulmaz.
2. Sayfa `<Buehne />` render eder → `Anmeldung` Partitur'u bir layout
   effect'te `buehne.setzen` ile kaydeder.
3. `Erlebnis` sayfadaki tüm `[data-kapitel]` bölümlerini toplar, ölçer
   ve döngüyü başlatır: yumuşatılmış scroll (Lenis) → **anlatı zamanı
   T** → takt'lar, HUD, gökyüzü, sahne.
4. **Sayfa geçişi:** yeni sayfa en üstten başlar (`#anker` ya da
   ileri/geri hariç). Kamera, saat ve sahne durumu scroll'dan bağımsız
   olarak yaklaşık **1 sn** içinde eski sayfanın son konumundan yenisinin
   ilk konumuna geçer. Bu sürede `lauf.wechsel` 0 → 1 gider.

**Anlatı zamanı T:** tam sayı kısmı bölümün indeksi (HTML sırasıyla),
kesir kısmı bölüm içindeki yol (0–1, bölümün tüm uzunluğu boyunca).
`hoehe` ekran yüksekliğindeki sabit bir sahne, yolunun
`(hoehe − 1) / (hoehe + luft)` kadarında yerinde durur ("Halt").
Kalan kısımda sahne dışarı kayar, `luft` (varsayılan `LUFT` = 1 ekran)
boyunca boşluk geçer ve sonraki bölüm içeri girer; kamera uçuşları
burada olur. Takt'lar (`data-takt`) yalnızca Halt boyunca 0–1 sayar;
`tAus(id, q)` aynı q'yu T'ye çevirir.

Geliştirme modunda HTML'deki bölümler bölüm listesiyle uyuşmazsa konsol
uyarır: `[Bühne] Abschnitte im HTML (…) passen nicht zur Partitur …`.

---

## 4. Partitur

Tip: `@/components/erlebnis/partitur` içindeki `Partitur`.

| Alan | Tip | Zorunlu | Anlamı |
|---|---|---|---|
| `id` | `string` | evet | tekil, en iyisi yol (`"/patterns"`) |
| `name` | `string` | evet | sayfa adı (Auftakt'taki Marke'de) |
| `bewegung` | `"L0" \| "L1" \| "L2" \| "L3"` | evet | hareket seviyesi, bkz. 4.6 |
| `kapitel` | `Kapiteldef[]` | evet | bölümler, **HTML sırasıyla** |
| `kamera` | `Punkt<Stellung>[]` | evet | en az bir konum; L0/L1'de yalnızca ilki geçerli |
| `himmel` | `Himmelsquelle` | evet | saat nereden gelir |
| `spuren` | `Partial<Record<keyof Szenenzustand, Spur>>` | hayır | sahne durumu T üzerinden |
| `fokus` | `Fokus[]` | hayır | parça parlar + kılavuz çizgi |
| `hud` | `(T, k: HudKontext) => HudWert` | hayır | HUD'daki ölçü |
| `nebel` | `[nah, fern]` | hayır | sis, metre; varsayılan `[600, 5200]` |
| `zusatz` | `ComponentType` | hayır | canvas'ta sayfaya özel R3F bileşeni |

### 4.1 Kapitel

```ts
type Kapiteldef = {
  id: string;      // bölümün id'si ve data-kapitel değeri
  titel: string;   // sağdaki bölüm rayı, HUD'da "03 / 05 Titel"
  hoehe?: number;  // yalnızca sabit sahne (Kapitel): ekran yüksekliği
  uhr?: number;    // saat (24 üstü = ertesi gün), himmel "kapitel" için
  marke?: string;  // Marke'deki bilgi: "Height 0 m", "Heading 090°"
  luft?: number;   // bu bölümden sonraki boşluk, ekran (varsayılan LUFT = 1)
};
```

- **Sabit sahne** (`Kapitel` bileşeni): `hoehe` ver (yoksa 2 kullanılır).
  Pratik kural: `1 + 0,6 × takt sayısı`, en az 1,6. Bir takt
  ~0,5–0,7 ekran scroll ister, daha azında acele hissi verir.
- **Akan bölüm** (`Datenblatt`, `Abspann`): `hoehe` yok; sahne gerçek
  yüksekliği ölçer.
- `luft`: sonraki bölüme kamera yolu çok uzunsa artır.
- Sayfa uzunluğuna dikkat: ana sayfa ~38 ekran ve zaten uzun sayılır.
  Alt sayfalar için kaba sınır: L3 ≤ 12, L2 ≤ 8 ekran sabit sahne.

### 4.2 Kamera

```ts
type Stellung = {
  pos: number[];    // kamera konumu [x, y, z], metre
  blick: number[];  // hedef nokta
  fov: number;      // varsayılan 36
  versatz: number;  // görüntüyü yana kaydır (genişlik oranı), + = türbin sağa
  hoch: number;     // dikey ekran: görüntüyü yüksekliğin bu oranı kadar kaldır (varsayılan 0,16)
  weite: number;    // dikey ekran: ek geri çekilme (varsayılan 1)
  dreh: number;     // dikey ekran: kule ekseni etrafında dönüş (derece)
};
```

Dünya: 1 birim = 1 m. Kule tabanı orijinde, göbek ~60 m'de (`massstab`
2 → 120 m), rotor **+x**'e bakar. Doğu = +x, güney = +z. Güneş sabah
doğuda, öğlen güneyde; pozitif z'deki kameralar türbini gündüz ışıkta
görür.

```ts
import { stellung, zeitraster } from "@/components/erlebnis/partitur";
const { tAus, index } = zeitraster(kapitel);

kamera: [
  stellung(tAus("aufstieg", 0), [62, 3, 74], [0, 14, 0], { versatz: 0.2 }),
  stellung(tAus("aufstieg", 1), [46, 64, 54], [0, 60, 0], { versatz: 0.2 }),
  stellung(index("daten"), [180, 60, 160], [0, 45, 0]),
]
```

İki konum arasında yumuşak geçiş yapılır. Bir **duruş** için iki aynı
konum koy; hareket o zaman aralarında kalır. Metin solda
(`seite="links"`) → `versatz` pozitif (0,16–0,25), metin sağda → negatif.
Dikey ekranda `versatz` kapalıdır; metin altta, türbin üstte durur
(`hoch`).

### 4.3 Gökyüzü

```ts
{ quelle: "kapitel" }            // kapitel[].uhr'dan (ana sayfa gibi)
{ quelle: "spur", uhr: Spur }    // kendi eğrin: [[t, 3 + 10/60], [t2, 7]]
{ quelle: "fest", uhr: 13 }      // sabit saat
{ quelle: "echt" }               // gerçek saat, Europe/Berlin (iletişim, formlar)
```

Saatler: 06:25 sabah (ufukta sıcak), 13:00 öğle (açık, serin),
18:30–19:30 akşam. 20:18'den sonra ve 05:30'dan önce gece
(`istNacht`, kökte `data-nacht="1"`): metin açık renge döner, uçuş
ikaz ışıkları ve ölçüm noktaları yanar. Renk değişimini sahne kendisi
yapar.

### 4.4 Spuren (sahne durumu)

Bir `Spur` ya bir sayıdır ya da `[T, değer][]` listesidir (aralarda
yumuşak, ilk noktadan önce ve sondan sonra sabit).

| Spur | Varsayılan | Anlamı |
|---|---|---|
| `drehzahl` | 9 | rotor devri, dev/dk (HUD sağda gösterir) |
| `massstab` | 1 | 1 = 60 m sınıfı, 2 = 120 m sınıfı |
| `parken` | 0 | 1 = rotor Y konumunda kilitli (bir kanat dik) |
| `huelle` | 1 | nasel kabuğunun opaklığı; 0,12 aktarma organlarını gösterir |
| `geist` | 0 | 120 m sınıfının silueti (repowering) |
| `flotte` | 0 | 140 türbin: 0 yerin altında, 1 ayakta |
| `markiert` | 0 | filoda kaç türbin sinyal kırmızısı (0–140) |
| `planung` | 0 | dokuz planlama projesi kırmızı tel siluet olarak |
| `linien` | 0 | **çizgi çizimi**: 1 = yalnızca kenarlar |
| `anlage` | 1 | 0 = **yalnızca temel** (404) |
| `karte` | 0 | zeminde çizgi olarak **Almanya haritası** |
| `raster` | 1 | zemindeki ölçü ızgarası (0 = kapalı, ör. haritanın altında) |
| `kraftwerke` | 0 | beş santral: i → i. santral yükselir, i ile i+1 arasında odakta (0–5) |

Örnekler: `spuren: { linien: 1, drehzahl: 0 }` (Standards),
`spuren: { anlage: 0 }` (404). Harita için:
`spuren: { karte: [[0, 0], [0.4, 1]], raster: 0.3 }`, yerden yüksek bir
kamera ve `nebel: [4000, 16000]`; yoksa harita siste kaybolur.

**Harita:** türbin orijinde durur. Bir harita birimi (SVG,
`viewBox 0 0 560 759`) 6 m'dir; tüm Almanya ~3,4 × 4,6 km eder. Harita
üzerindeki bir nokta için `@/components/erlebnis/Karte` içinden
`karteNachWelt(x, y)` (SVG koordinatı → zemindeki `THREE.Vector3`).

### 4.5 Fokus ve kılavuz çizgiler

```ts
fokus: [{ id: "getriebe", von: tAus("teile", 0.2), bis: tAus("teile", 0.4) }]
```

`von` ile `bis` arasında parça sinyal renginde parlar (dördünden biriyse:
`nabe`, `getriebe`, `generator`, `turm`) ve ankerden
`data-teil="<id>"` taşıyan metin bloğuna kırmızı bir kılavuz çizgi
çekilir. 4.9'daki tüm id'ler için anker vardır; diğerlerinde
yalnızca çizgi çıkar, parlama olmaz.

### 4.6 Hareket seviyeleri

| Seviye | Sahne | Metin |
|---|---|---|
| **L3** | Partitur'daki tam koreografi | takt'lar |
| **L2** | L3 gibi, ama az durak (2–5 kamera konumu) | takt'lar |
| **L1** | T = 0'daki karede durur (ilk konum, Spuren T = 0'da), rotor durur, perde %62 | akar (Datenblatt) |
| **L0** | L1 gibi, perde %50, ikaz ışığı yanıp sönmez; hiçbir şey kendiliğinden hareket etmez | akar |

L0/L1'de sahne `lauf.szeneT = 0` okur; HUD yine gerçek T'yi alır
(ör. okuma ilerlemesi için). `prefers-reduced-motion`: yumuşatılmış
scroll yok, takt'lar kaymaz, sayfa geçişi anında, rotor %35 hızda.

### 4.7 HUD formatlayıcı

```ts
type HudKontext = { uhr: number; kapitel: number; anteil: number; szene: Szenenzustand };
type HudWert = { wert: string; etikett?: string; einheit?: string; notiz?: string };
```

Sol altta `[ETIKETT] Wert[einheit] [NOTIZ]` olarak görünür, boş
parçalar atlanır. Mobilde üst barda (logonun yanında) yalnızca
`Wert einheit` durur. `hud` yoksa sahne saati ve
"Musterstadt · 51.16° N 10.45° E" gösterir.

**Her karede** çağrılır: ucuz tut, gereksiz nesne kurma. DOM yalnızca
değer değişince yazılır.

```ts
// kuledeki yükseklik
hud: (T) => ({ etikett: "Height", wert: String(Math.round(zahl(hoehe, T))), einheit: "m",
               notiz: "Hub height of this turbine" }),

// adım ve süre
hud: (T) => {
  const s = schrittBei(T);  // sayfanın kendi fonksiyonu
  return { etikett: "Step", wert: `${s + 1}/5`, notiz: ablauf[s].dauer };
},

// örnek bir gecenin saati
hud: (_T, k) => ({ wert: uhrText(k.uhr), notiz: "Sample night" }),

// okuma ilerlemesi (L1 yazı)
hud: (T, k) => ({ etikett: "Section", wert: `${k.kapitel + 1}/4`,
                  notiz: `${Math.round((T / 4) * 100)} %` }),
```

Uydurma ölçüm değeri gösterme. Temsili bir değer ise öyle adlandır
("Hub height of this turbine", "Sample night").

### 4.8 Zusatz (sayfaya özel sahne)

`zusatz`, canvas'ta türbin ve filonun yanında render edilen bir R3F
bileşenidir. Sayfa geçişinde kaldırılır ve yeniden kurulur. Örnek:
`src/app/(site)/patterns/Hoehenring.tsx`.

```tsx
"use client";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { lauf } from "@/components/erlebnis/lauf";
import { klemm } from "@/components/erlebnis/zeitachse";

/* three-Objekte auf MODULEBENE — nicht in useMemo/useRef (Lint, s. 7). */
const mat = new THREE.MeshBasicMaterial({ color: "#E0472A", transparent: true, opacity: 0, depthWrite: false });
const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.05, 6, 64), mat);
ring.rotation.x = Math.PI / 2;

export default function Hoehenring() {
  /* Kamera aus dem Frame-Zustand, nicht aus useThree. */
  useFrame(({ camera }) => {
    mat.opacity = lauf.wechsel * 0.9;   // mit dem Seitenwechsel einblenden
    ring.position.y = klemm(camera.position.y, 1, 60);
  });
  return <primitive object={ring} />;
}
```

Bir Zusatz'ın `lauf`'tan okuyabilecekleri:

| Alan | Anlamı |
|---|---|
| `lauf.T` | sayfanın anlatı zamanı |
| `lauf.szeneT` | sahnenin anlatı zamanı (L0/L1: 0) |
| `lauf.uhr` | saat (gece renkleri için `istNacht(lauf.uhr)`) |
| `lauf.szene` | güncel sahne durumu (tüm Spuren, yumuşatılmış) |
| `lauf.wechsel` | sayfa geçişinden sonraki saniyede 0 → 1 |
| `lauf.ruhig` | reduced motion |
| `lauf.anker[id]` | ankerlerin ekran konumu `{x, y, da}` (4.9) |
| `lauf.partitur` | güncel Partitur |

Zusatz yalnızca `lauf.anker` içine, kendi kayıtlarını yazabilir (sayfa
önekli id'ler, ör. `standards-gondel`). Böylece metin tarafı `fokus` ile
oraya kılavuz çizgi çekebilir. Parçalara aynı anda birden fazla etiket
için `@react-three/drei`'deki `Html` uygundur (`pointer-events: none`,
`aria-hidden`); metin yine de SSR HTML'inde bulunmalı.

Türbin `massstab` ile büyür; ona bağlı her şey yükseklikleri
`lauf.szene.massstab` ile çarpar.

### 4.9 Ankerler

`lauf.anker[id] = { x, y, da }`: CSS pikseli olarak ekran konumu, `da` =
kameranın önünde mi. Her karede yenilenir (`Anlage.tsx`).

| id | Yer |
|---|---|
| `rotorblaetter` | üst kanadın ortası (dönerek) |
| `spitze` | üst kanadın ucu (dönerek) |
| `nabe` | göbeğin önü |
| `getriebe` | naseldeki dişli kutusu |
| `generator` | naseldeki jeneratör |
| `gondel` | nasel çatısı |
| `turm` | kule, 24 m |
| `fuss` | kapıdaki kule tabanı |
| `fundament` | temelin kenarı |

---

## 5. Takt attribute'ları (metin)

| Attribute | Nerede | Etkisi |
|---|---|---|
| `data-takt="a b"` | sabit sahnedeki blok | sabit yolun a ile b arası (0–1) görünür; opaklık + 26 px kayma. `a ≤ 0`: baştan görünür; `b ≥ 1`: sona kadar kalır. İç içe kullanılabilir (maddeleri sırayla gelen liste). |
| `data-strecke="a b"` | `e-fuellung` taşıyan eleman | a ile b arasında `scaleX` 0 → 1 (çubuklar, zaman çizelgeleri) |
| `data-zahl="96"` | takt içinde | takt girerken 0'dan sayar |
| `data-mass="60"` | metin | `60 × massstab` gösterir (60 → 120) |
| `data-upm` | metin | güncel rotor devri |
| `data-teil="id"` | takt | bu id'li `fokus` için kılavuz çizginin hedefi |
| `data-zeilen` | `Zeilen` üzerinden | kelime kelime giriş |

**Başlık açılışı** (`Zeilen`): yalnızca sayfanın büyük anları için
(Auftakt'taki H1, en fazla bir iki başlık daha). Her yerde kullanılırsa
etkisini kaybeder. `kante` tek bir sayıyı ya da kelimeyi bir kenarın
arkasından yükseltir (`zahl` ile ayrıca sayar).

Sahnedeki yerleşim: bir sahnenin çocukları üst üste durur (grid), her
blok `e-block`. Geniş blok: `e-block e-block-breit`. Tam genişlikte
zaman çizelgesi için `seite="unten"` + `e-block e-block-voll`.

---

## 6. Bausteine

Hepsi `@/components/erlebnis/bausteine`'den (server bileşeni,
`Anmeldung` hariç).

| Baustein | Props | Amaç |
|---|---|---|
| `Kapitel` | `partitur, id, seite?: "links" \| "rechts" \| "unten", children` | sabit sahne (sticky, `hoehe` ve `luft` Partitur'dan) |
| `Auftakt` | `partitur, kapitel, titel, lead?, takt? = "0 0.15", angabe?, children?` (butonlar) | ilk takt: Marke "01 · ölçü · sayfa adı", kelime kelime H1, lead |
| `Marke` | `partitur, id, angabe?, children?` | "03 — 15:20 — Ad"; bilgi = `angabe` › `kapitel.marke` › `uhr` |
| `Zeilen` | `as?, className, text, kante?, auftakt?, zahl?` | kelime kelime başlık |
| `Weiter` | `href, children` | oklu metin linki |
| `Datenblatt` | `partitur, id, etikett?, titel?, children` | kâğıt zeminde akan bölüm |
| `Abschnitt` | `titel, etikett?, children?` | Datenblatt içinde ara başlık |
| `Tabelle` | `nr?, titel?, zeilen: {schluessel, wert}[]` | anahtar-değer / özellik bloğu |
| `Liste` | `punkte: {titel, text?}[]` | 01, 02 … numaralı liste |
| `Fragen` | `fragen: {q, a}[]` | `<details>` ile SSS |
| `Abspann` | `partitur, pfad, titel, lead?, id? = "abspann", marke? = "Contact", weiter? = true \| false \| Station` | kapı + CTA + iletişim + footer |
| `Tuer` | `station` | "NEXT — SERVICES · HEADING …" (Abspann içinde) |
| `Anmeldung` | `partitur` | client: Partitur'u kaydeder (yalnızca `Buehne.tsx`'te) |

Kapı sonraki durağı `rundgang.ts`'ten alır: `/` → `/services` →
`/services/acquisition` → `/services/maintenance` →
`/services/monitoring` → `/services/planning-repowering` →
`/references` → `/company` → `/company/team` → `/company/standards` →
`/company/partners-investors` → `/company/careers` → `/insights` →
`/contact` → `/`. `/insights/…` yazıları `/contact`'a, `/contact/…`
formları ana sayfaya gider. Listede olmayan bir yol için kapı çıkmaz;
yeni bir sayfa tura girecekse onu `rundgang` dizisine ekle.

**Metin için CSS sınıfları** (`erlebnis.css`): `e-titel` +
`e-titel-xl|l|m|s`, `e-text`, `e-lead`, `e-klein`, `e-etikett`,
`e-riesig` (büyük rakam), `e-liste` (çizgili liste), `e-liste-gross`,
`e-schritte` (numaralı satırlar), `e-zitat`, `e-knoepfe` + `e-knopf` /
`e-knopf-voll`, `e-fakten` / `e-spez` / `e-mass` (değer satırları),
`e-fussnote`, `e-signal`, `tnum` (eşit genişlikte rakam), `e-jahre` +
`e-fuellung` (`data-strecke` ile çubuk), `e-zeitleiste` (beş adım,
ana sayfadaki örnek gibi).

Kenarlar: sahnelerdeki, Datenblatt'taki ve Abspann'daki metin üst barın
altında ve HUD'ın üstünde yumuşakça kaybolur (`e-fliesst` ya da
`e-buehne`; Bausteine bunu kendisi koyar). Bausteine dışındaki kendi
akan alanların, bölümün iç elemanında `className="e-fliesst"` alır.

---

## 7. Örnek: en küçük L2 sayfa

Yalnızca geliştirme modunda **`/patterns`** altında çalışır (build'de
404, `noindex`). Dosyalar `src/app/(site)/patterns/` içinde: yeni bir
sayfaya buradan kopyalayarak başla.

- `partitur.ts`: üç bölüm (`aufstieg` sabit sahne `hoehe: 4`, `daten`
  Datenblatt, `abspann`), `zeitraster` ile kamera yolu, bir `drehzahl`
  Spur'u, yükseklik gösteren `hud`, `zusatz: Hoehenring`.
- `Buehne.tsx`: bölüm 2'deki gibi.
- `Hoehenring.tsx`: bölüm 4.8'deki gibi.
- `page.tsx`: `<Buehne />`, ardından HTML'de Partitur'daki sırayla
  `Kapitel` (içinde `Auftakt` ve `data-takt` blokları), `Datenblatt`
  (`Abschnitt`, `Fragen`, `Tabelle`, `Liste`) ve `Abspann`.

Örnek sayfa ayrıca production build'de `notFound()` çağırır ve
`robots: noindex` koyar; gerçek sayfaların buna ihtiyacı yok.

Gerçek sayfaların metadata'sı: `title`, `description` ve
`alternates.canonical` (sayfanın kendi yolu). İçerik dosyalarında `seo`
alanı varsa (`src/content/leistungen.ts`, `src/content/wissen.ts`) oradan
al.

Metin `src/content/*.ts` içinde durur; sayfa onu okur, kendisi metin
tutmaz. Takt metni: başlık ≤ ~9 kelime, gövde ≤ ~45 kelime; daha uzun
içerik Datenblatt'a gider (kısaltma, taşı).

---

## 8. Kod kuralları

- **Yorumlar ve tanımlayıcılar Almanca**, mevcut dosyaların üslubunda.
  Yorum *neden*i açıklar.
- **Yeni npm bağımlılığı yok.** Scroll için Lenis zaten var (sahne
  yönetir); `@react-three/drei` kurulu.
- **`useFrame` içinde değiştirilen three nesneleri** (materyal,
  geometri, vektör, renk, mesh) **modül seviyesinde** kurulur,
  `useMemo`/`useState` içinde değil: `react-hooks/immutability` lint
  kuralı hook değerlerinin değiştirilmesini yasaklar. `useRef` yalnızca
  JSX nesnelerine ref için.
- **Kamera ve `size`'ı `useFrame` durumundan al**
  (`useFrame(({ camera, size }) => …)`), `useThree`'den değil.
- Her karede değişen React state yok. Karede yalnızca `lauf` oku, three
  nesnelerine ve DOM stillerine yaz.
- **Erişilebilirlik:** tüm metin SSR HTML'inde (server bileşenleri),
  hareket yalnızca opaklık/transform ile. `prefers-reduced-motion`'ı
  sahne halleder; kendi CSS animasyonların bir
  `@media (prefers-reduced-motion: reduce)` dalı ister. Başlık
  hiyerarşisi: tam bir `h1` (Auftakt'ta), altında `h2`/`h3`.

---

## 9. Kontrol

1. `npm run typecheck` temiz.
2. `npx eslint <kendi dosyaların>` temiz.
3. `npm run dev`, sayfayı aç. Konsolda `[Bühne]` uyarısı ve hata yok
   (R3F'ten gelen "THREE.Clock … deprecated" uyarısı bilinen bir durum).
4. Her bölümü masaüstünde (1440×900) **ve** mobilde (390×844) baştan
   sona scroll et. Bak: metin hiç logo/HUD altına girmiyor, türbin metnin
   arkasında kalmıyor, gece bölümlerinde metin açık renk, yatay taşma yok.
5. Sayfa geçişi: ana sayfadan (logo linki) kendi sayfana ve geri. Kamera
   uçar, sayfa en üstten başlar, bölüm rayı kendi bölümlerini gösterir.
