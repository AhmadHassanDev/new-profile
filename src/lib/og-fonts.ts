/**
 * The site's own typefaces for generated images. next/font keeps its files to itself and ImageResponse
 * can't read woff2, so each face is fetched from Google Fonts as TTF, cut down to just the characters
 * drawn. Cached, so a build fetches it once; if Google can't be reached the image falls back to the
 * default face instead of failing.
 */
export async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  "use cache";
  try {
    const query = `family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(`https://fonts.googleapis.com/css2?${query}`).then((res) => res.text());
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

type Font = { name: string; data: ArrayBuffer; weight: 600 | 700; style: "normal" };

/** ImageResponse's `fonts`, skipping any face that didn't load */
export const fontsFor = (faces: (Omit<Font, "data"> & { data: ArrayBuffer | null })[]) =>
  faces.filter((face): face is Font => face.data !== null);
