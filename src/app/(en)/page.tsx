import type { Metadata } from "next";
import HomeView from "@/views/HomeView";
import { pageMetadata, SITE_DESCRIPTION } from "@/lib/seo";

// Keeps the site's default title, untouched by the template
export const metadata: Metadata = pageMetadata({ description: SITE_DESCRIPTION, path: "/" });

export default function Home() {
  return <HomeView lang="en" />;
}
