// Turns every image in /covers (PNG, JPG or WebP, any size) into a light, browser-friendly
// project cover: public/work/<name>.webp at exactly 2000 × 1565, plus a tiny blurred preview
// in src/content/covers.json for the card to show while the real one loads.
//
//   npm run covers
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 2000;
const HEIGHT = 1565;
const SOURCE = "covers";
const OUTPUT = "public/work";
const PREVIEWS = "src/content/covers.json";

const files = (await readdir(SOURCE)).filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f)).sort();
await mkdir(OUTPUT, { recursive: true });

const previews = {};
for (const file of files) {
  const name = path.parse(file).name.toLowerCase();
  const input = sharp(path.join(SOURCE, file)).rotate();
  const { width = 0, height = 0 } = await input.metadata();
  if (Math.abs(width / height - WIDTH / HEIGHT) > 0.01) {
    console.warn(`! ${file} is ${width}×${height}, not ${WIDTH}×${HEIGHT}: its edges will be trimmed to fit`);
  }

  const out = path.join(OUTPUT, `${name}.webp`);
  await input
    .clone()
    .resize(WIDTH, HEIGHT, { fit: "cover" })
    .webp({ quality: 80, effort: 6, smartSubsample: true })
    .toFile(out);

  const tiny = await input.clone().resize(20, 16, { fit: "cover" }).webp({ quality: 50 }).toBuffer();
  previews[name] = `data:image/webp;base64,${tiny.toString("base64")}`;

  const kb = ((await stat(out)).size / 1024).toFixed(0);
  console.log(`✓ ${file} → ${out} (${kb} KB)`);
}

await writeFile(PREVIEWS, `${JSON.stringify(previews, null, 2)}\n`);
console.log(`✓ ${Object.keys(previews).length} previews → ${PREVIEWS}`);
