import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// iOS home screens need a PNG: the favicon's logo, on the site's dark ground
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const logo = await readFile(join(process.cwd(), "public/logo.svg"));

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0d" }}>
        {/* The mark sits low in its own viewBox; lift it to the optical centre */}
        <img src={`data:image/svg+xml;base64,${logo.toString("base64")}`} width={127} height={99} alt="" style={{ marginTop: -14 }} />
      </div>
    ),
    size,
  );
}
