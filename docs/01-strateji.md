# 01 · Strateji — "Bir sahne, bir gün"

Bu doküman, sitenin **neden böyle kurulduğunu** anlatır. Kod ayrıntıları
`03-tricks.md`'de, kullandığımız promptlar `02-promptlar.md`'de.

---

## 1. Fikir: tek nesne, sabit sahne, akan metin

Referans: oryzo.ai mantığı. Sahnede **tek bir nesne** durur, kamera onun
etrafında dolaşır, metin bölüm bölüm akar. Bizde nesne bir rüzgâr türbini,
scroll ise **bu türbinin bir günü**: sabah 06:25 → öğle → akşam → gece
03:10 → ertesi sabah.

Gün fikri süs değil, içerikten çıkıyor:

| Saat | Bölüm | Sahnede ne oluyor |
|---|---|---|
| 06:25 | Giriş | Şafak, tek türbin, rotor yavaş |
| 13:00 | Anatomie | Kamera gondolun içine girer, kabuk saydamlaşır, 5 parça |
| 15:20 | Leistungen | 4 hizmet = türbinin etrafında ~95°'lik bir yay üzerinde 4 bakış açısı |
| 17:40 | Netz | 5 santral sırayla yerden yükselir; direkler ve kablolar scroll'la uzar, kamera düz bir rayda yakından geçer |
| 18:30 | Ankauf | Gün batımı, zaman çizelgesi |
| 03:10 | Monitoring | Gece, ikaz feneri yanıp söner, sensörler mavi |
| 06:20 | Repowering | Türbin 60 m'den 120 m'ye büyür |
| 07:00 | Kontakt | Kamera uzaklaşır, 140 türbinlik filo belirir |

İlk sürümde 12 bölüm vardı (52 ekran yüksekliği). Metin ağırlıklı ve
3D'de bir şey değiştirmeyen bölümler alt sayfalara gitti. Kalan 8 bölümün
her biri ya ışığı/rengi (saat), ya açıyı, ya da ölçeği değiştiriyor.
Santral bölümü ilk sürümde 09:20'deydi ve öğlen ışığında "beyaz"
kalıyordu; şimdi 17:40'ın sıcak ışığında, daha sık dizili ve daha az
direkle. Renkler gerçekçi değil; bir mimari maket gibi açık ve sıcak
yüzeyler, her santralde tek bir vurgu rengi var.

**Kural:** Hareket bir şey anlatır ya da yoktur. Zıplama, keyfi zoom,
geri scroll'da kaybolan efekt yok.

## 2. Tek kaynak: anlatı zamanı `T`

Bütün site tek bir sayıya bağlı:

```
scrollY ──(yumuşatma)──▶ T ──▶ saat, gökyüzü, ışık, sis
                           ├──▶ kamera konumu
                           ├──▶ sahne durumu (rotor, filo, santraller…)
                           └──▶ metin blokları (opacity / translate)
```

- `T`'nin tam sayı kısmı = bölüm indeksi, kesirli kısmı = bölüm içindeki yol.
- Her şey `T` üzerinde **destek noktaları** (keyframe) olarak yazılır:
  `[T, değer]` çiftleri, aralarında smootherstep.
- Bir sayfanın bütün koreografisi **tek dosyada**: `partitur.ts`
  ("partisyon"). Kamera, rotor devri, filo, santraller, gökyüzü — hepsi
  orada. Sahne kodu sayfayı tanımıyor, sadece partisyonu çalıyor.

Bu ayrım projenin en önemli kararı: koreografi değişikliği = veri
değişikliği. Yeni bir bölüm eklemek için shader'a dokunmuyorsun.

## 3. Sticky bölümler + takt'lar

Her bölüm `hoehe` kadar ekran yüksekliğinde (ör. 4.6 vh) bir kutu; içinde
`position: sticky` bir sahne. Sahne kutunun `1 - 1/hoehe` kadarında
"sabit" durur, son bir ekran yüksekliğinde sıradaki bölüm içeri kayar.
**Kamera geçişleri tam bu kayma aralığına** denk gelir — okurken kamera
durur, geçerken uçar.

Bölüm içindeki metin blokları `data-takt="0.22 0.44"` ile işaretli:
sabit sahnenin %22'sinde girer, %44'ünde çıkar. Kamera keyframe'leri de
aynı birimle yazılır (`tAus("lage", 0.22)`), böylece metin ve kamera
kendiliğinden senkron kalır.

## 4. Metin DOM'da, 3D sadece "zugabe"

- Bütün metin SSR ile HTML'de. SEO ve ekran okuyucu her cümleyi alır.
- 3D sahne `next/dynamic` + `ssr: false`. WebGL yoksa CSS gradyan
  gökyüzü kalır, metin eksiksiz akar.
- Döngü sadece `style` yazar, içerik silmez.
- `prefers-reduced-motion`: yumuşatma ve kaydırma ofsetleri kapanır.

## 5. Model indirmeden 3D

Hiç GLTF yok. Türbin, 5 santral ve elektrik direkleri **prosedürel**:

- Türbin: kanat loft edilmiş yüzey (chord + kalınlık + twist aynı anda
  değişiyor — basit konik kutu hemen "placeholder" görünür).
- Santraller: kutu, silindir, küre parçası ve türbin parçalarının
  birleşimi (`mergeGeometries`).
- Elektrik direkleri: 4 ana dikme + kuşaklar + çapraz bağlantılar +
  2 travers, tek geometri; tüm direkler tek `InstancedMesh`.
- Kablolar: tek `LineSegments`, `setDrawRange` ile scroll'a göre uzar.

Sonuç: model indirme 0 MB, her parça ayrı animasyonlanabilir.

## 6. Bağımlılık disiplini

GSAP yok, ScrollTrigger yok. Tek `requestAnimationFrame` döngüsü;
smooth scroll için Lenis var ama **kendi rAF'i kapalı**, aynı döngünün
başında sürülüyor (ilk sürümde Lenis yoktu ve mouse tekerleğinde metin
ile sahne kopuyordu — bkz. `03-tricks.md` #1). React bu döngüde
**render etmez**;
paylaşılan durum düz bir mutable obje (`lauf`). 60 fps'te React state
güncellemek tam israf.

## 7. Aşamalı çalışma (phase-gated)

Projeyi tek promptta değil, her fazdan sonra **durup onay alarak**
yürüttük:

0. Keşif — mevcut kod, içerik, kısıtlar
1. Partisyon dokümanı — hangi saat, hangi bölüm, kamera nerede (kod yok)
2. İskelet — sticky bölümler, boş sahne, `T` akıyor
3. Koreografi — kamera, ışık, sahne durumları
4. Cilalama — dikey ekran, reduced-motion, WebGL kaybı, performans

Bu sıralama, AI ile çalışırken "güzel ama dağınık" sonuçtan kaçınmanın
yolu. Promptlar `02-promptlar.md`'de.
