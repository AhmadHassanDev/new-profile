import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // AVIF where the browser takes it (about a quarter smaller than WebP), WebP everywhere else
    formats: ["image/avif", "image/webp"],
    // Covers rarely change: keep the resized images cached for a month
    minimumCacheTTL: 2678400,
  },
  // Crawlers and apps that only look for /favicon.ico get the square icon
  async redirects() {
    return [{ source: "/favicon.ico", destination: "/icon", permanent: true }];
  },
  experimental: {
    // The Tailwind CSS is small, so it ships inside the page: the first paint doesn't wait on a stylesheet
    inlineCss: true,
    // Turbopack's file-system cache misses edits to the hand-written rules in globals.css (Tailwind's own
    // classes update, those don't): restored on Vercel, each deploy shipped the previous deploy's CSS, and
    // dev needed `rm -rf .next` after every change. Builds and restarts start cold instead, and correct.
    turbopackFileSystemCacheForBuild: false,
    turbopackFileSystemCacheForDev: false,
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
