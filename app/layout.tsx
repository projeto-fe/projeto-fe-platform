import type { Metadata, Viewport } from "next";
import { Poppins, Open_Sans } from "next/font/google";

import { SCRIPT_DO_TEMA } from "@/components/shell/tema";
import { Toaster } from "@/components/ui/toaster";
import { enderecoDoPortal } from "@/lib/ambiente";
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

const DESCRICAO = "Portal da equipe do Instituto Projeto Fé: cadastro das crianças, estrutura das áreas e o ranking do IDE JOGAI.";

export const metadata: Metadata = {
  // Resolve os caminhos relativos de opengraph-image e icon.
  metadataBase: new URL(enderecoDoPortal()),
  applicationName: "Portal Projeto Fé",
  title: {
    // Quem abre várias abas precisa distinguir uma da outra pela primeira
    // palavra, então o nome da tela vem antes do nome do portal.
    default: "Portal Projeto Fé · Instituto Projeto Fé",
    template: "%s · Portal Projeto Fé",
  },
  description: DESCRICAO,
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Portal Projeto Fé",
    title: "Portal Projeto Fé",
    description: DESCRICAO,
    locale: "pt_BR",
  },
  // Sem isto, "Adicionar à Tela de Início" no iPhone abre num modo que não
  // sabe da área segura do aparelho: a barra inferior do celular (que já
  // reserva espaço pra essa área) fica sem o respiro, cortada pelo indicador
  // de início. `viewportFit: "cover"` no viewport, ao lado disto, é o que
  // ativa `env(safe-area-inset-bottom)` de verdade no modo instalado.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Projeto Fé",
  },
};

export const viewport: Viewport = {
  themeColor: marca.azul,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_DO_TEMA }} />
      </head>
      <body className={`${poppins.variable} ${openSans.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
