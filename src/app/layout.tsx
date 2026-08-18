import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Orbitron } from "next/font/google";
import { LockPage } from "@/components/LockPage";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const brand = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-brand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sirius Dashboard",
  description: "Painel analitico de uso do Sirius.",
};

export const viewport: Viewport = {
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${brand.variable}`}>
      <body>
        <LockPage />
        {children}
      </body>
    </html>
  );
}
