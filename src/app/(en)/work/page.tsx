import type { Metadata } from "next";
import WorkView, { WORK_DESCRIPTION } from "@/views/WorkView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Work", description: WORK_DESCRIPTION.en, path: "/work" });

export default function WorkPage() {
  return <WorkView lang="en" />;
}
