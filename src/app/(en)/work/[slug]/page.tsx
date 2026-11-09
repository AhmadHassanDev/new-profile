import type { Metadata } from "next";
import CaseView, { caseMetadata, caseStaticParams } from "@/views/CaseView";

export const generateStaticParams = caseStaticParams;

type Props = { params: Promise<{ slug: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return caseMetadata({ lang: "en", params });
}

export default function CasePage({ params }: Props) {
  return <CaseView lang="en" params={params} />;
}
