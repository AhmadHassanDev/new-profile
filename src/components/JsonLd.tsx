/**
 * Structured data for search engines and AI assistants, as a native script tag (the Next.js JSON-LD guide's
 * recommendation). Several nodes share one @graph so their @id links resolve together. `<` is escaped so
 * no string in the data can close the tag.
 */
export default function JsonLd({ graph }: { graph: object[] }) {
  const data = { "@context": "https://schema.org", "@graph": graph };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
