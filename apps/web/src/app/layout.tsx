import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "katex/dist/katex.min.css";
import "./globals.css";

import { Toaster } from "@/shared/ui";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LaTeX Exerciser",
  description: "Practice LaTeX equation input through timed quizzes.",
};

function PageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-neutral-500">
          Loading LaTeX Exerciser...
        </p>
      </section>
    </main>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Suspense fallback={<PageFallback />}>{children}</Suspense>
        <Toaster />
      </body>
    </html>
  );
}