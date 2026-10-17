import { ImageResponse } from "next/og";
import { company, kennzahlen } from "@/content/site";

/**
 * Vorschaubild für geteilte Links (WhatsApp, LinkedIn, Signal, Slack).
 *
 * Bewusst kein Foto: Ein Landschaftsbild sagt in der kleinen Kachel eines
 * Messengers nichts und wird zudem stark beschnitten. Hier stehen Name,
 * Leistungsversprechen und die vier Kennzahlen — lesbar auch dann, wenn
 * die Vorschau auf Daumennagelgröße schrumpft.
 *
 * Generiert zur Bauzeit aus denselben Stammdaten wie die Seite, damit
 * eine geänderte Zahl nicht zwei Stellen braucht.
 */
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${company.legalName} | Wind turbine acquisition, service and operation`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0B1826",
          padding: "68px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Wortmarke */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 10, height: 42, background: "#0E6BE0" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 27,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: 2,
                lineHeight: 1.15,
              }}
            >
              {company.wordmark.first}
            </span>
            <span
              style={{
                fontSize: 27,
                fontWeight: 400,
                color: "#8CBAF3",
                letterSpacing: 2,
                lineHeight: 1.15,
              }}
            >
              {company.wordmark.second}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.12,
              letterSpacing: -1.6,
              maxWidth: 940,
            }}
          >
            We buy, operate and maintain wind turbines.
          </span>
          <span
            style={{
              marginTop: 24,
              fontSize: 27,
              color: "rgba(255,255,255,0.66)",
              lineHeight: 1.45,
              maxWidth: 860,
            }}
          >
            Acquisition, service, monitoring and repowering. Across Germany,
            with our own service crews and planning office.
          </span>
        </div>

        {/* Kennzahlen */}
        <div
          style={{
            display: "flex",
            gap: 56,
            borderTop: "1px solid #1E3548",
            paddingTop: 30,
          }}
        >
          {kennzahlen.map((k) => (
            <div
              key={k.label}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span
                style={{ fontSize: 46, fontWeight: 700, color: "#FFFFFF" }}
              >
                {k.value}
              </span>
              <span
                style={{
                  fontSize: 19,
                  color: "rgba(255,255,255,0.52)",
                  marginTop: 4,
                }}
              >
                {k.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
