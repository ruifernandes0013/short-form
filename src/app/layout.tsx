import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Short Form Studio — AI Content Generator",
  description:
    "Upload a video or paste a YouTube link to generate TikTok scripts, Twitter threads, Instagram captions, and YouTube Shorts content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-950 text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
