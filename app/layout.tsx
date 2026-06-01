import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RangerQ - Khao Yai National Park Digital Twin",
  description: "Quantum-Assisted Decision Layer for Khao Yai National Park",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
