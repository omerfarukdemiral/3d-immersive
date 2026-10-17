# 02 · Örnek promptlar

Bu sitenin yapımında kullandığımız prompt yapısının sadeleştirilmiş hâli.
Hepsi Claude Code ile, mevcut bir Next.js projesinin içinde çalıştırıldı.
Köşeli parantezleri kendi projenle doldur.

> **Ana fikir:** Tek dev prompt yerine faz faz ilerle ve her fazdan sonra
> **dur, onay iste** de. AI'ın en sık hatası, onay vermediğin kararları
> kod içinde sessizce vermesi.

---

## Faz 0 — Keşif

```text
Bu repo [sektör] alanında bir firmanın sitesi. Ana sayfayı scroll'a bağlı,
immersive bir 3D deneyime çevireceğiz. Referans: oryzo.ai (tek nesne,
sabit sahne, kamera nesnenin etrafında dolaşır, metin bölüm bölüm akar).

Bu fazda KOD YAZMA. Şunları çıkar:
1. Mevcut içerik: hangi bölümler, hangi sayılar, hangi CTA'lar var?
2. Mevcut 3D/animasyon altyapısı (three, R3F, sticky pattern var mı?)
3. İçerikten çıkan, süs olmayan bir "hikâye ekseni" önerisi
   (ör. bir günün saatleri, bir ürünün yaşam döngüsü, bir yolculuk).
4. Riskler: performans, mobil, erişilebilirlik, SEO.

Bitince dur ve onayımı bekle.
```

## Faz 1 — Partisyon (sadece doküman)

```text
Onaylanan eksen: "[Bir türbin, bir gün]". docs/partitur.md dosyasını yaz:

- Her bölüm için: saat, bölüm yüksekliği (viewport cinsinden), metin
  blokları ve hangi aralıkta görünür oldukları (0–1),
  kamera konumu + bakış noktası, sahnede ne değişiyor.
- Her sahne değişikliğinin içerikte bir dayanağı olsun. Dayanağı yoksa
  o hareketi koyma.
- Gökyüzü/ışık/sis renklerini saatin fonksiyonu olarak tanımla.

Kod yok. Bitince dur.
```

## Faz 2 — İskelet

```text
docs/partitur.md'ye göre iskeleti kur:

- Tek rAF döngüsü: scrollY → exponential smoothing → anlatı zamanı T
  (tam sayı = bölüm, kesir = bölüm içi yol). GSAP EKLEME.
  Smooth scroll için Lenis kullan ama autoRaf: false; lenis.raf()'i
  aynı döngünün başında çağır, sonra scrollY'yi oku. İkinci bir
  smoothing katmanı EKLEME (metin ile 3D kopar).
- Keyframe'ler arası monoton kübik (Fritsch–Carlson) interpolasyon;
  segment başına smootherstep KULLANMA (her keyframe'de durur).
- Paylaşılan durum için mutable bir modül objesi (`lauf`). React bu
  döngüde render etmesin, sadece style yazılsın.
- Her bölüm sticky; içindeki öğeler data-takt="a b" ile girip çıksın.
- Metin SSR'da tam olsun. 3D canvas next/dynamic ssr:false.
  WebGL yoksa CSS gradyan kalsın.
- Sahnede şimdilik sadece zemin + gökyüzü + tek nesne.

Koreografi yok. Bitince dur.
```

## Faz 3 — Koreografi

```text
Partisyonu koda dök. Bütün koreografi tek dosyada olsun: partitur.ts.

- Spur tipi: number | [T, değer][] ; aralarında smootherstep.
- Kamera: [T, {pos, blick, fov, versatz}] — `versatz` görüntüyü yatayda
  kaydırır (setViewOffset), böylece nesne metnin yanında durur.
- Kamera geçişleri bölümler arası kayma aralığına düşsün; metin
  okunurken kamera dursun.
- Sahne durumu (rotor devri, kabuk opaklığı, filo yüksekliği…) tek bir
  Szenenzustand objesinde, her alanın bir varsayılanı olsun.

Bitince dur, ekran görüntüleriyle göster.
```

## Faz 4 — Cilalama

```text
- Dikey ekran: metin altta, nesne üst yarıda; kamerayı oranla geri çek.
- prefers-reduced-motion: yumuşatma ve kaydırma ofsetleri kapalı.
- webglcontextlost olursa Canvas'ı yeniden kur.
- Performans: aynı geometriden çok varsa InstancedMesh, sabit parçalar
  mergeGeometries ile tek draw call.
- Her bölümde bir ekran görüntüsü al, metin ile 3D çakışıyor mu bak.
```

---

## Prosedürel model promptları

### Türbin (model indirmeden)

```text
GLTF kullanmadan, three.js ile prosedürel bir rüzgâr türbini üret.
Ölçek 1 birim = 1 m, göbek yüksekliği 60 m, rotor çapı 60 m.
Kanat basit konik kutu OLMASIN: kesit profili boyunca
chord (kökten %18'e kadar artıp uca doğru azalan), kalınlık (kökte kalın)
ve twist (uca doğru düzleşen) aynı anda değişsin — loft edilmiş yüzey.
Kule konik, gondol, göbek ve spinner ayrı geometriler olsun ki her
parçayı ayrı animasyonlayabilelim.
```

### 5 santral + elektrik hattı

```text
Sahneye ana türbinin batısına sıralı 5 santral ekle, hepsi prosedürel:
rüzgâr parkı (3 türbin), güneş parkı (25° eğimli panel sıraları),
batarya depolama (konteyner sıraları + klima üniteleri),
biogaz (3 fermentör + membran kubbe, BHKW, baca),
trafo merkezi (portal direkler, baralar, 3 trafo).

Santralleri kafes elektrik direkleriyle bağla:
- Direk: 4 ana dikme, kuşaklar, çapraz bağlantılar, 2 travers — tek
  geometri, bütün direkler tek InstancedMesh.
- Kablolar: sarkmalı (parabol), tek LineSegments; geometriyi
  açıklık → parça → kablo sırasıyla yaz ki setDrawRange ile hattı
  scroll'a göre uzatabilelim.

Tek bir spur yönetsin: kraftwerke (0–5). i. santral değer i'yi geçince
yerden yükselsin, değer [i, i+1) aralığındayken zemininde kırmızı bir
halka yansın ve metindeki karttan ona bir kılavuz çizgisi çekilsin.
```

### Anonimleştirme (bu repo böyle çıktı)

```text
Bu projeyi markadan arındırarak public paylaşılabilir bir demo kopya
yap. Sektör kalabilir. Firma adı, kişiler, adres, telefon, e-posta,
vergi/ticaret sicil no, gerçek proje yerleri, logolar ve müşteri
fotoğrafları gitsin; yerine açıkça kurgusal (Musterwerk / Max Mustermann
/ Musterstadt) veriler gelsin. Koddaki yorumlarda da müşteri izi kalmasın.
En sonda grep ile doğrula.
```
