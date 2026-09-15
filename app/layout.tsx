import type { Metadata, Viewport } from "next";
import { Poppins, Open_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";
import { marca } from "@/lib/brand";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portal Projeto Fé",
    template: "%s · Portal Projeto Fé",
  },
  description: "Plataforma interna do Instituto Projeto Fé, em Marília/SP.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: marca.azul,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${poppins.variable} ${openSans.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
