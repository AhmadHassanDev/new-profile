import type { Metadata } from "next";
import { Figtree, Unbounded } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ahmed Hassan — UX research, UI design & front-end",
  description:
    "Ahmed Hassan is a designer and front-end developer: UX research, UI design and front-end development, from the first interview to the shipped interface.",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${unbounded.variable} antialiased`}>
      <body className="min-h-full">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
