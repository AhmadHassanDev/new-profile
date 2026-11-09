import type { Metadata } from "next";
import HomeView from "@/views/HomeView";
import { AR, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ description: AR.description, path: "/", lang: "ar" });

export default function ArabicHome() {
  return <HomeView lang="ar" />;
}
