# 03 · Trick'ler — Three.js, prosedürel model, scroll

Her trick için: **ne**, **neden**, **nerede** (dosya).

---

## Scroll ve zaman

### 1. Scroll'u yumuşat — ama tek yerde
İlk sürümde 3D sahne kendi exponential smoothing'ini kullanıyordu,
sayfa ise native scroll ediyordu. Mouse tekerleği kademeli olduğu için
metin her tıkta 100 px zıplıyor, sahne arkasından 100 ms geç
kayıyordu. Ölçümde karelerin %93'ünde sayfa duruyor, sonra tek karede
sıçrıyordu.

Çözüm: Lenis, **kendi rAF'i olmadan**, ana döngünün başında:
```ts
const lenis = new Lenis({ autoRaf: false, lerp: 0.085 });
// her karede:
lenis.raf(now);          // önce scroll'u ilerlet
const y = scrollY;       // sonra oku → DOM ve 3D aynı değeri görür
```
İkinci bir smoothing yok. İki ayrı rAF olsaydı (Lenis'in ve bizimki)
sıraya göre 1 kare kayma olurdu. Touch'ta Lenis devreye girmez; iOS/Android
zaten momentumlu scroll ediyor. `prefers-reduced-motion` → Lenis hiç
kurulmaz.
→ `src/components/erlebnis/Erlebnis.tsx`

### 2. Her şeyi tek sayıya bağla: `T`
`T = bölümIndeksi + bölümİçiİlerleme`. Kamera, gökyüzü, rotor, santraller
hep `T`'nin fonksiyonu. Geri scroll'da her şey birebir geri sarılır —
"tetiklenip biten" animasyon yok.
→ `src/components/erlebnis/partitur.ts`

### 3. Keyframe = `[T, değer]` + monoton kübik spline
İlk sürümde her iki keyframe arası ayrı bir smootherstep'ti. Sorun: hız
**her keyframe'de sıfıra iniyor**, kamera ara noktalardan geçerken
"dur-kalk" yapıyordu.

Çözüm: Fritsch–Carlson monoton kübik Hermite.
- Ara noktalardan hız sürekli geçer (C¹).
- Monoton olduğu için asla hedefi aşmaz (overshoot yok — Catmull-Rom'un
  aksine kamera zemine gömülmez).
- İki eşit keyframe = gerçek duruş, yumuşak giriş/çıkışla. Yani "okurken
  dur" davranışı korunur.

```ts
// iç noktada teğet: komşu eğimler zıt işaretliyse 0, değilse
m = 3*(h0+h1) / ((2*h1+h0)/d0 + (h1+2*h0)/d1);
```
Kamera konumu, bakış noktası, fov, versatz — her alan ayrı eğri.
→ `src/components/erlebnis/zeitachse.ts` (`kurve`), `Szene.tsx`

### 4. Kamera okurken durur, geçerken uçar
Bölüm `hoehe` vh yüksekliğinde, sahne `1 - 1/hoehe` oranında sabit.
Kamera keyframe'lerini takt'ın ilk %30'una koy, kalanında sabit tut.
Kullanıcı okurken hiçbir şey kaymaz.
→ `src/app/(site)/_start/partitur.ts` (`netzKamera`)

### 5. React'i döngüden çıkar
Paylaşılan durum düz bir mutable obje (`lauf`). rAF döngüsü ve
R3F `useFrame` ona yazar/okur, React 60 kez/sn render etmez.
→ `src/components/erlebnis/lauf.ts`

---

## Kamera ve kompozisyon

### 6. `setViewOffset` ile nesneyi metnin yanına it
```ts
cam.setViewOffset(w, h, -versatz * w, hoch * h, w, h);
```
Kamera hâlâ nesneye bakar, ama görüntü yatayda kayar. Metin solda,
nesne sağda; perspektif bozulmaz (lookAt'i kaydırmaktan çok daha temiz).
→ `src/components/erlebnis/Szene.tsx` (`Kamerafuehrung`)

### 7. Dikey ekranda kamerayı oranla geri çek
`weg.multiplyScalar((1 + (1/aspekt - 1) * 0.55) * weite)` — dar ekranda
nesne kadraja sığar, `hoch` ile üst yarıya alınır.

### 8. Sayfa değişiminde kamera 1 sn'de süzülür
Son kamera durumu saklanır, yeni sayfanın ilk konumuna scroll'dan
bağımsız `lerp` edilir. Sayfalar arası geçiş de tek sahne gibi hissettirir.

---

## Gökyüzü ve ışık

### 9. Saat → gökyüzü paleti
24 saatlik keyframe listesi (üst, ufuk, zemin, güneş rengi, güneş gücü).
Gökyüzü küresi basit bir gradient shader; sis rengi = ufuk rengi, böylece
zemin ufka dikişsiz erir.
→ `zeitachse.ts` (`himmelUm`), `Szene.tsx` (`Himmel`)

### 10. Zemin = ölçü ızgarası shader'ı
`fwidth` ile anti-aliased 20 m / 100 m ızgara, mesafeyle söner. Boşlukta
dönen kamera "yüzer"; ızgara harekete referans verir.
→ `Szene.tsx` (`Boden`)

### 11. Gece metni otomatik açılır
`istNacht(uhr)` → `data-nacht` attribute → CSS renkleri değişir.

---

## Prosedürel model (GLTF yok)

### 12. Kanat = loft
Kesit profili boyunca chord, kalınlık ve twist aynı anda değişir.
Basit konik kutu hemen "placeholder" görünür; bu üçlü silüeti gerçek yapar.
→ `src/components/three/turbineGeometry.ts`

### 13. "Balken" helper'ı: iki nokta arası kutu
```ts
function balken(a, b, d) {
  const g = new BoxGeometry(d, dist(a, b), d);
  g.applyQuaternion(fromUnitVectors(UP, normalize(b - a)));
  g.translate(...midpoint(a, b));
  return g;
}
```
Kafes elektrik direği, trafo portalı, çit — hepsi bu tek fonksiyonla.
→ `src/components/erlebnis/Kraftwerke.tsx`

### 14. `mergeGeometries` → malzeme başına tek draw call
Her santral, malzeme başına tek mesh. Güneş parkındaki 39 tablo + 156
ayak = 2 draw call.

### 15. Aynı nesneden çok varsa `InstancedMesh`
140 türbinlik filo = 2 draw call (direk+gondol, rotor). Rotorlar
matrislerle döner. Elektrik direkleri de tek InstancedMesh.
→ `Flotte.tsx`, `Kraftwerke.tsx`

### 16. "Yerden yükselme" = `scale.y`
Santral grubunun `scale.y`'si 0→1. Ucuz, okunur, geri sarılabilir.
Filo için her instance'a gecikme (`verzug`) eklenir → dalga gibi yükselir.

### 17. Kablo sarkması = parabol
```ts
y = lerp(a.y, b.y, t) - sag * 4 * t * (1 - t);
```
Gerçek catenary'e görsel olarak yeterince yakın, maliyeti sıfır.

### 18. Kablo "çekilir": `setDrawRange`
Tüm kablolar tek `LineSegments`. Vertex'leri **açıklık → parça → kablo**
sırasıyla yaz; sonra:
```ts
seile.geometry.setDrawRange(0, segmentSayısı * PRO_STUECK);
```
Hat scroll'la direkten direğe uzar. Ek geometri yok, ek draw call yok.

### 19. Tek spur, beş santral
`kraftwerke` değeri 0–5: i'yi geçince i. santral yükselir, [i, i+1)
aralığında kırmızı halka yanar. Direkler de "hatta vardıkları" değerde
(`a`) yükselir. Bir sayı, bütün sahne.
→ `kraftwerkOrte.ts` (`trasse[].a`)

### 20. Model dosyası yok = SSR'dan güvenli veri
Konum verisi `"use client"` olmayan ayrı dosyada (`kraftwerkOrte.ts`).
Böylece sunucu tarafındaki partisyon kameraları aynı veriden hesaplar,
client sahnesi aynı veriden geometriyi kurar.

### 21. Gölge kamerası bakılan yeri takip etsin
Directional light'ın gölge kamerası sabit bir kutu (±180 m). Başta
ana türbine sabitti; 2 km ötedeki santraller hiç gölge düşürmüyordu ve
"zemine yapıştırılmış kutu" gibi görünüyordu. Şimdi her karede kameranın
bakış noktasına taşınıyor. Taşırken ışık uzayındaki texel ızgarasına
yuvarlanmalı, yoksa gölge kenarları kayarken titrer (bkz. #26).
→ `Szene.tsx` (`Licht`)

### 22. Kamerayı güneşle aynı yöne koyma
Gölgeler açıldı ama yine görünmüyordu: sabah güneşi güneydoğudan,
kamera da güneydoğudan bakıyordu. Önden aydınlatma, bütün gölgeleri
nesnelerin arkasına düşürür ve sahne düz görünür. Kamerayı güneybatıya
aldık; ışık yandan geldi ve her nesnenin yanına gölgesi düştü. Aynı
geometri, sıfır maliyet, en büyük gerçekçilik farkı.

### 23. Simsiyah paneller: metalness + envMap yok
`metalness: 0.35` ve çok koyu bir mavi kullanılmıştı. Sahnede
`environment` olmadığı için metal yüzeyin yansıtacağı bir şey yok,
sonuç simsiyah. Çözüm: `metalness: 0`, düşük roughness ve rengi
dokudan almak.

### 24. Canvas ile prosedürel dokular
Model yok, ama doku da indirmiyoruz: `<canvas>`'a çizip
`CanvasTexture` yapıyoruz. Tek bir doku, `clone()` + farklı
`repeat` ile birçok malzemede kullanılıyor.
- Güneş paneli: 2×38 modül, her biri 6×10 hücre, bus-bar ve çerçeve
- Kalıp izli beton: kalıp derzleri, ankraj delikleri, altta kir
- Oluklu konteyner sacı, klima ızgarası, BHKW panjuru
- Silaj brandası: kıvrımlar ve üstünde ağırlık lastikleri
- Çit örgüsü: şeffaf PNG gibi, `alphaTest` ile
→ `src/components/erlebnis/kraftwerkBauten.ts`

### 25. "Kutu" ile "tesis" arasındaki fark detay sayısında
Gerçekçilik shader'dan önce **parça sayısıyla** geliyor:
- Konteynerin uçlarında klima ünitesi, altında beton temel
- İzolatör = gövde + her 20 cm'de bir disk (bunu gören beyin hemen
  "porselen izolatör" diyor)
- Trafo = tank + 2×18 radyatör kanadı + genleşme tankı + buşingler
- Kafes portal = 4 dikme + her 1.5 m'de kuşak ve çapraz
Hepsi `mergeGeometries` ile malzeme başına tek draw call.

### 26. Hareket ederken titreme: üç ayrı kaynak
Kamera hareket ederken sahne "karıncalanıyordu". Tek bir sebep yoktu:

1. **alphaTest + mipmap = yanıp sönen teller.** Çit örgüsü
   `alphaTest` ile kesiliyordu. Uzakta mipmap alfa değerini ortalayınca
   teller eşiğin altına düşüp her karede görünüp kayboluyordu (moiré).
   Çözüm: `transparent: true, depthWrite: false`, alphaTest yok.
   Mipmap teli artık yarı saydam, sakin bir griye ortalıyor.
2. **Z-fighting.** Çakıl plakasının üstü 0.06 m'de, zemindeki gölge
   düzlemi 0.05 m'de. Near=1, far=20000 ile 300 m'de derinlik hassasiyeti
   ~5 mm; 1 cm fark yetmiyor. Çözüm: kaplamalar 0.18 m, yollar 0.30 m.
3. **Gölge kenarı kayması.** Gölge kamerasını dünya x/z'de yuvarlamak
   yetmiyor; ışık eğik geldiği için ızgara ışığın texel'lerine denk
   gelmiyor. Yuvarlamayı ışık uzayında yap:
   ```ts
   const toLight = sunDir.normalize();
   const right = cross(UP, toLight).normalize();  // three'nin lookAt ekseni
   const up = cross(toLight, right);
   const a = round(dot(target, right) / texel) * texel;
   const b = round(dot(target, up) / texel) * texel;
   center = right*a + up*b + toLight*dot(target, toLight);
   ```
   Ayrıca kutu ±180 → ±140 m, harita 2048 → 4096: texel 17 cm → 7 cm.

### 27. Tempo: bölümler arasına "nefes payı"
Sticky yapıda iki bölüm arasındaki kamera uçuşu, sonraki bölümün
içeri kaydığı **1 ekran yüksekliğine** sıkışıyor. Santrallerden
türbine 2 km'lik dönüş tek tekerlek hamlesinde geçiyordu.

Çözüm: her sabit bölümün altına `margin-bottom: 0.75 × 100svh`.
Bu boşlukta metin yok, sadece 3D kamera uçuyor; geçiş 1.75 ekrana
yayılıyor. Anlatı zamanı boşluğu da sayacak şekilde hesaplanıyor:
```ts
anteil = (scrollY - top[i]) / (top[i + 1] - top[i]);   // boşluk dahil
halt   = (hoehe - 1) / (hoehe + LUFT);                  // sabit kalma oranı
```
Metin zamanlaması etkilenmiyor (o sadece sabit kısma bakıyor).
Lenis tarafında da `wheelMultiplier` 0.9 → 0.75 ve `lerp` 0.085 → 0.075.
→ `partitur.ts` (`LUFT`, `haltAnteil`), `Erlebnis.tsx`, `erlebnis.css`

### 28. İlk görünümde takılma: ön ısıtma
Ölçümde scroll sırasında 305 ms'lik bir "long task" vardı: santraller
ilk kez ekrana girdiğinde three shader programlarını (gölge varyantları
dahil) derliyor ve canvas dokularını GPU'ya yüklüyordu. Görünmez nesneler
hiç render edilmediği için bu iş açılışta yapılmıyordu.

Çözüm: Canvas açılınca **tek bir kare** her şey görünürken render et,
sonra eski görünürlüğü geri yükle:
```ts
scene.traverse(o => { if (!o.visible) { hidden.push(o); o.visible = true; } });
gl.render(scene, camera);
hidden.forEach(o => (o.visible = false));
```
Sonuç: tam sayfa scroll'da long task 305 ms → 0.

Bu yetmedi: frustum dışındaki nesneleri three yine atlıyor. 1 km
uzaktaki santraller ön ısıtma karesinde kadraj dışında kaldığı için
derlenmiyordu. Aynı karede `frustumCulled`'ı da geçici olarak kapat.
→ `Szene.tsx` (`Vorwaermen`)

### 29. Ana iş parçacığı: önce oku, sonra yaz
rAF döngüsü önce stil yazıp sonra `getBoundingClientRect` okuyordu.
Her karede zorunlu stil + layout hesabı demek. Okumaları karenin
başına aldık (layout önceki kareden temiz). Ayrıca:
- `:root`'a yazılan CSS değişkenleri (gökyüzü rengi) bütün sayfanın
  stilini geçersiz kılıyor → sadece değişince yaz.
- Sayaç `textContent`'i değişmese de yazılıyordu → karşılaştır, sonra yaz.

### 30. Adaptif DPR'ı yukarı-aşağı oynatma
`PerformanceMonitor` FPS'e göre pixel ratio'yu artırıp azaltıyordu.
Her değişiklik çizim tamponunu yeniden oluşturuyor, bu da kendi başına
bir takılma. Artık sadece bir kez ve sadece aşağı iniyor.

### 31. Zemin ızgarası: mesafeye değil piksel yoğunluğuna göre sön
Uzakta 100 m'lik hücreler birkaç piksele iniyor, çizgiler birbirine
giriyor ve kamera hareket ettikçe bütün ekranda moiré oluşuyor.
Shader içinde `fwidth` ile hücrenin ekrandaki boyutunu ölçüp,
yoğunlaşınca ızgarayı söndürüyoruz:
```glsl
vec2 w = fwidth(p / cell);
line *= 1.0 - smoothstep(0.08, 0.3, max(w.x, w.y));
```

### 32. Okurken güneş dönmesin
Saat scroll'a bağlı olduğu için güneş, metin okunurken de yavaşça
dönüyordu. Güneş dönünce her gölge kenarı gölge haritasında kayıyor,
yani titriyor. Gökyüzü rengi akmaya devam ediyor; ama güneşin **yönü**
sabit bölümde duruyor, sadece bölüm geçişlerinde (kamera zaten
uçarken) dönüyor.
→ `zeitachse.ts` (`sonnenUhrAus`), `lauf.sonnenUhr`

### 33. CSS `transition` scroll'a bağlı sahnede düşman
İki zaman tabanlı geçiş scroll'dan bağımsız oynuyordu:
- Metnin arkasındaki "veil" bölüm değişince 700 ms'de beliriyordu; hızlı
  scroll'da geç, yavaşta erken. Artık opaklığını rAF döngüsü yazıyor:
  bölümün sabit kısmı bitince, kayma mesafesi boyunca karışıyor.
- Kökteki `.erlebnis { transition: color 700ms }`: gece/gündüz değişince
  rengi miras alan **her kelime** için ayrı bir animasyon başladı.
  Ölçüm: 204 ms donma. Transition kaldırıldı; renk değişimi bölümler
  arası boşluğa, ekranda metin yokken denk geliyor.

### 34. Kamera hızını ölç, sonra boşluk ver
`?debug` ile kamera durumu `window.__kamera`'ya açılıyor. Sayfayı 50 px
adımlarla gezip her adımda kameranın aldığı yolu ölçüyoruz:
```js
for (let y = 0; y <= max; y += 50) {
  scrollTo(0, y); await frame(); await frame();
  d = |pos - prevPos| + 0.5 * |target - prevTarget|;   // m / 50px
}
```
İlk ölçüm: 4 bakış bölümünde **79 m / 100 px** (90°'lik dönüş tek
tekerlek hamlesinde). Düzeltmeler:
- Uzun yol alan bölüm uzun olsun, duruşlar kısa, uçuşlar uzun.
- Bölüm başına `luft`: uzun geçişlere (gece → repowering, repowering →
  kapanış) daha fazla boşluk.
- Türbin içindeki uçuşlar takt'ın %30'u yerine çoğunluğunu alıyor.
Sonuç: tepe hız 79 → 39 m / 100 px.

### 35. Beklerken geri kayma = "git gel"
Okuma sırasında kameraya küçük bir kayma (drift) vermek güzel durur.
Ama kayma, kameranın sonra gideceği yönün tersineyse monoton kübik
eğri o noktada durur ve geri döner: türbin ekranda ileri geri sallanır.
Kural: bekleme ya tam durur (iki aynı keyframe) ya da sonraki uçuşun
yönünde kayar. Ölçmek için sayfayı 10 px adımlarla gez, kameranın
hareket yönünü kaydet; 400 px içinde yön tersine dönüyorsa (`dot < -0.3`)
orada sekme var. Aynı ölçümde görüş yönünün dönüşünü de topla
(derece / 100 px): metre tek başına yanıltır, gondolun 15 m yakınında
küçük bir yol büyük bir dönüş demek.
Sonuç: canlı sürümde 2 sekme → 0; en hızlı dönüş 113 → 46°/100 px
(gondoldan kuleye inişte kamera artık türbinin etrafından dolaşmıyor).

Kamera yönü tek başına yetmedi. Santral bölümünde kamera her santralin
z konumunu takip ediyordu (±35 m zikzak). Kameranın yönü hiç tersine
dönmüyordu, ama zemin ekranda her santralde aşağı-yukarı sallanıyordu.
Bunu görmek için dünya noktalarını kameranın her adımında ekrana
yansıt (projeksiyon) ve ekrandaki y yönünün kaç kez döndüğünü say:
13 → 0. Çözüm: kamera düz bir rayda gidiyor (`NETZ_Z`), dönüş uçuşunda
her eksen tek yönde değişiyor. Kamera dönüşe başlamadan önce yerinde durup
doğuya dönüyor, sonra ileri uçuyor. Santraller kameranın arkasında
iniyor; böylece ekranda hiçbir şey geri kaymıyor.
→ `_start/partitur.ts`

### 36. Park eden rotor geri dönmesin
Rotor, scroll'la "Y" konumuna park ediyor: `açı = serbest + (hedef −
serbest) · park`. Yavaş scroll'da serbest açı hedefi geçerse karışım
rotoru geri çeker. Çözüm: park sürerken serbest açıyı hedefte kırp
(`min(serbest, hedef)`), rotor hedefte frenlenir.
→ `Anlage.tsx`

### 37. scrollY yerine Lenis'in kendi değeri
`scrollY` cihaz pikseline yuvarlanır. Lenis'in yavaşlayan kuyruğunda
değer tam piksellerle sıçrar, aradaki karelerde durur; gondol yakınında
kamera titrer. `lenis.scroll` ondalıklıdır, sahne onu okur.
→ `Erlebnis.tsx`

### 38. Flat ölçekli instance'ı gizle
Henüz yükselmemiş direk `scale.y = 0.0001` ile duruyordu; traversler
zeminde düz siyah bir "X" olarak görünüyordu. Yükselmemiş instance'ın
ölçeği tamamen 0.

Daha iyisi: hiç ezme. Ezilmiş geometri alçak akşam güneşinde çizgili
gölge bırakıyordu. Santraller ve direkler artık kendi yükseklikleri
kadar zeminin altından yukarı kayıyor (`position.y = -(1 - h) * yükseklik`).
Opak zemin, altta kalan kısmı zaten gizliyor.

Kırmızı halkayı da spur değerine değil, metindeki takta bağla. Yoksa
santraller dönüşte inerken spur her santralden bir kez daha geçiyor ve
halkalar sırayla yanıp sönüyor.
→ `Kraftwerke.tsx`

---

## 3D ↔ DOM

### 39. 3D noktadan HTML karta kılavuz çizgisi
Her frame anchor `project(camera)` ile ekran koordinatına çevrilir,
`lauf.anker[id]`'ye yazılır; DOM tarafında `data-teil=id` olan kartın
kenarından SVG path çizilir.
→ `Anlage.tsx`, `Kraftwerke.tsx` (yazan), `Erlebnis.tsx` (çizen)

### 40. Metin her zaman HTML'de
3D yalnızca süs. WebGL yoksa CSS gradyan kalır; `webglcontextlost` olursa
Canvas `key` değiştirilerek yeniden kurulur.

---

## Performans notları

- Adaptif DPR: drei `PerformanceMonitor` FPS 50'nin altına düşünce
  pixel ratio'yu 0.25'lik adımlarla 1'e kadar indirir, toparlanınca
  geri çıkarır. Ruckeln yerine biraz daha yumuşak görüntü.
- Gölge kamerası kameranın baktığı noktanın etrafında (±140 m); odaktaki
  santral gölge atar, uzaktakiler atmaz.
- Geometriler modül seviyesinde bir kez kurulur; sayfa değişiminde
  yeniden oluşturulmaz.
