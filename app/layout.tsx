import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Sans_Thai } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-sans",
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ["thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-thai",
});

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
      className={`${ibmPlexSans.variable} ${ibmPlexSansThai.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
