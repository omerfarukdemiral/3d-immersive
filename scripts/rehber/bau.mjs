/**
 * Baut den Leitfaden unter /guide aus den vier Dokumenten in docs/.
 * Ergebnis: public/guide/index.html (statisch, Next.js kopiert es beim
 * Export mit). Nach jeder Änderung an docs/ neu bauen: npm run rehber
 */
import { readFileSync, writeFileSync } from "node:fs";
import { Marked } from "marked";

const wurzel = new URL("../../", import.meta.url);
const DOKUMENTE = [
  ["strateji", "01-strateji.md"],
  ["promptlar", "02-promptlar.md"],
  ["tricks", "03-tricks.md"],
  ["sayfa-api", "04-sayfa-api.md"],
];
const REPO = "https://github.com/omerfarukdemiral/3d-immersive/blob/main/docs";

const reiter = Object.fromEntries(DOKUMENTE.map(([k, f]) => [f, k]));

/* Anker aus Überschriften, türkische Buchstaben auf ASCII. */
const anker = (s) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z#0-9]+;/g, "")
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıİ]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

let teile = "";
for (const [id, datei] of DOKUMENTE) {
  const md = readFileSync(new URL(`docs/${datei}`, wurzel), "utf8");
  const vergeben = new Set();
  const marked = new Marked({ gfm: true });
  marked.use({
    renderer: {
      heading(text, tiefe) {
        let a = `${id}-${anker(text)}`;
        while (vergeben.has(a)) a += "-x";
        vergeben.add(a);
        return `<h${tiefe} id="${a}">${text}</h${tiefe}>\n`;
      },
    },
  });
  const html = marked
    .parse(md)
    .replace(/<table>/g, '<div class="tablo"><table>')
    .replace(/<\/table>/g, "</table></div>")
    /* Verweise auf die anderen Dokumente werden Reiter-Links. */
    .replace(/<code>(?:docs\/)?(0[1-4]-[a-z-]+\.md)<\/code>/g, (alles, f) =>
      reiter[f] ? `<a href="#${reiter[f]}">${alles}</a>` : alles,
    );
  teile += `  <article id="${id}" class="sayfa" data-bolum hidden>
    <div class="dosya-bas"><p class="etiket" lang="en">docs/${datei}</p><a href="${REPO}/${datei}">GitHub'da aç</a></div>
${html}  </article>

`;
}

const vorlage = readFileSync(new URL("sablon.html", import.meta.url), "utf8");
writeFileSync(
  new URL("public/guide/index.html", wurzel),
  vorlage.replace("{{DOCS}}", teile),
);
console.log("public/guide/index.html");
