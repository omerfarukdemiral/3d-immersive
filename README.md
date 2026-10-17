# 3D Immersive — "One turbine. One day."

Scroll'a bağlı, tek sahneli, immersive bir 3D web sitesi. Bir rüzgâr
türbininin bir gününü (06:25 → ertesi sabah) anlatır. Yol üstünde
**beş santral** (rüzgâr, güneş, batarya, biogaz, trafo merkezi) yerden
yükselir ve kafes elektrik direkleriyle birbirine bağlanır.

**Canlı:** https://omerfarukdemiral.github.io/3d-immersive/

**Rehber:** https://omerfarukdemiral.github.io/3d-immersive/guide/

**Model dosyası yok.** Türbin, santraller, direkler ve kablolar
tamamen kodla üretiliyor. Model indirme: 0 MB.

> Kurgusal bir demo. "Musterwerk Energie", "Max Mustermann" ve
> "Musterstadt" yer tutucudur; gerçek bir firmayla bağlantısı yoktur.
> Site içeriği İngilizce, kod tanımlayıcıları ve yorumlar Almanca,
> dokümanlar Türkçe.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| 3D | three.js + React Three Fiber |
| Animasyon | Tek `requestAnimationFrame` döngüsü + Lenis (aynı döngüden sürülüyor), GSAP yok |
| Stil | Tailwind 4 + düz CSS |
| Yayın | GitHub Pages (`.github/workflows/pages.yml`) |

## Başlarken

Node 20.9 veya üstü gerekir.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # statik çıktı: out/
npm run lint
npm run typecheck
```

Adrese `?debug` eklersen anlık kamera konumu `window.__kamera`
üzerinden okunabilir. Kamera hareketini ölçmek için kullanılıyor
(bkz. `docs/03-tricks.md`).

## Kendi projen olarak kullanmak

1. **Fork'la ya da kopyala.** Lisans MIT; ticari kullanım dahil serbest.
2. **Firma bilgileri:** `src/content/site.ts` (ad, adres, menü, CTA).
   Sayfa başlığı ve açıklaması `src/app/layout.tsx`'te.
3. **İçerik:** hizmetler `src/content/leistungen.ts`, yazılar
   `src/content/wissen.ts`, ana sayfa metni
   `src/app/(site)/_start/Kapitelfolge.tsx`.
4. **Koreografi:** ana sayfadaki saat, kamera ve sahne durumlarının
   hepsi `src/app/(site)/_start/partitur.ts`'te. Yeni bir alt sayfa
   eklemek için `docs/04-sayfa-api.md`'ye bak; en küçük örnek
   `src/app/(site)/patterns/` (yalnızca `npm run dev`'de açılır).
5. **Yayın:** GitHub'da *Settings → Pages → Source: GitHub Actions*
   seç ve `main`'e push et. Workflow, base path ve site adresini
   repo ayarlarından kendisi alır; repo adını değiştirsen de bir şey
   düzenlemen gerekmez. Başka bir host (Vercel, Netlify, Cloudflare
   Pages) için `npm run build` ve `out/` klasörü yeterli;
   `PAGES_BASE_PATH`'i boş bırak, `NEXT_PUBLIC_SITE_URL`'e alan adını yaz.

## Nereye bakmalı

| Dosya | Ne var |
|---|---|
| `src/app/(site)/_start/partitur.ts` | Ana sayfanın bütün koreografisi: bölümler, saat, kamera, sahne durumları |
| `src/app/(site)/_start/Kapitelfolge.tsx` | Ana sayfanın bütün metni (SSR) |
| `src/components/erlebnis/Erlebnis.tsx` | Scroll → `T` döngüsü, metin animasyonu, HUD, kılavuz çizgiler |
| `src/components/erlebnis/Szene.tsx` | Canvas, kamera, gökyüzü, ışık, zemin ızgarası |
| `src/components/erlebnis/Kraftwerke.tsx` | 5 prosedürel santral + elektrik hattı |
| `src/components/erlebnis/Flotte.tsx` | 140 türbinlik instanced filo |
| `src/components/three/turbineGeometry.ts` | Prosedürel türbin (loft edilmiş kanat) |
| `src/components/erlebnis/zeitachse.ts` | Interpolasyon, saat → gökyüzü paleti |
| `src/components/erlebnis/bausteine/` | Alt sayfaların metin blokları |
| `src/components/seiten/` | Alt sayfalara özel içerik ve sahne eklentileri |

## Dokümanlar

- [`docs/01-strateji.md`](docs/01-strateji.md): fikir, mimari, kararlar
- [`docs/02-promptlar.md`](docs/02-promptlar.md): faz faz örnek promptlar
- [`docs/03-tricks.md`](docs/03-tricks.md): Three.js, prosedürel model ve scroll trick'leri
- [`docs/04-sayfa-api.md`](docs/04-sayfa-api.md): yeni bir alt sayfa eklemek

Aynı dört doküman sitede `/guide/` altında tek sayfa olarak da okunabilir.
`docs/` değişince `npm run rehber` ile `public/guide/index.html`
yeniden üretilir.

`AGENTS.md` ve `CLAUDE.md` Next.js'in AI asistanlar için ürettiği
dosyalar; `next dev` onları yeniden yazar.

## Lisans

[MIT](LICENSE)
