import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Google only shows square favicons, sized in multiples of 48px; the logo itself is wider than it's tall,
// so this sets it on a square of the site's dark ground
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

const logo = await readFile(join(process.cwd(), "public/logo.svg"));

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0d" }}>
        {/* The mark sits low in its own viewBox; lift it to the optical centre */}
        <img src={`data:image/svg+xml;base64,${logo.toString("base64")}`} width={146} height={114} alt="" style={{ marginTop: -16 }} />
      </div>
    ),
    size,
  );
}
