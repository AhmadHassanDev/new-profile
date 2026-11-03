import { ImageResponse } from "next/og";
import { fontsFor, googleFont } from "@/lib/og-fonts";
import { JOB_TITLE, NAME, OG_ALT, OG_SIZE } from "@/lib/seo";

// The default share card, in the site's own look: dark, the spectrum, the hero's three verbs
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

const BG = "#0a0a0d";
const INK = "#edecf2";
const MUTED = "#8b8a97";
const SPECTRUM = "linear-gradient(90deg, #09c7fb 0%, #c471ed 54%, #f64f59 100%)";
const VERBS = [
  { text: "Research.", color: "#09c7fb" },
  { text: "Design.", color: "#c471ed" },
  { text: "Build.", color: "#f64f59" },
];

export default async function Image() {
  const display = `${NAME.toUpperCase()}${VERBS.map((v) => v.text.toUpperCase()).join("")}`;
  const [unbounded, figtree] = await Promise.all([googleFont("Unbounded", 700, display), googleFont("Figtree", 600, JOB_TITLE)]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: INK,
          padding: "72px 80px 0",
          fontFamily: "Figtree",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30, fontWeight: 600, color: MUTED }}>
          <div style={{ width: 56, height: 3, background: SPECTRUM }} />
          {JOB_TITLE}
        </div>

        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Unbounded", fontWeight: 700, textTransform: "uppercase" }}>
          <div style={{ fontSize: 112, lineHeight: 0.95, letterSpacing: "-0.03em" }}>{NAME}</div>
          <div style={{ display: "flex", gap: 24, marginTop: 36, fontSize: 52, letterSpacing: "-0.02em" }}>
            {VERBS.map((verb) => (
              <span key={verb.text} style={{ color: verb.color }}>
                {verb.text}
              </span>
            ))}
          </div>
        </div>

        {/* The spectrum, as the card's floor */}
        <div style={{ display: "flex", height: 10, margin: "0 -80px", background: SPECTRUM }} />
      </div>
    ),
    {
      ...size,
      fonts: fontsFor([
        { name: "Unbounded", data: unbounded, weight: 700, style: "normal" },
        { name: "Figtree", data: figtree, weight: 600, style: "normal" },
      ]),
    },
  );
}
