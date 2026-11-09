import type { Metadata } from "next";
import WorkView, { WORK_DESCRIPTION } from "@/views/WorkView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "الشغل", description: WORK_DESCRIPTION.ar, path: "/work", lang: "ar" });

export default function ArabicWorkPage() {
  return <WorkView lang="ar" />;
}
