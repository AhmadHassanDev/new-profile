import type { Metadata } from "next";
import NotFoundView from "@/views/NotFoundView";

export const metadata: Metadata = { title: "404" };

export default function NotFound() {
  return <NotFoundView lang="en" />;
}
