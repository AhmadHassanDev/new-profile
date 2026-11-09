import type { Metadata } from "next";
import CaseView, { caseMetadata, caseStaticParams } from "@/views/CaseView";

export const generateStaticParams = caseStaticParams;

type Props = { params: Promise<{ slug: string }> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return caseMetadata({ lang: "ar", params });
}

export default function ArabicCasePage({ params }: Props) {
  return <CaseView lang="ar" params={params} />;
}
