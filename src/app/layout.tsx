import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CueCast - Radio Speaker Countdown",
  description: "Radio speakers timing tool for perfect music cues",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
