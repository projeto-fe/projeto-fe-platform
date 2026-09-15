import { LogIn } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/marca/logo";
import { Button } from "@/components/ui/button";

/**
 * Casca de toda página sem login (ADR 0013). Cabeçalho único: logo, link
 * entre páginas públicas e botão de entrar. Fundo e tipografia da marca
 * ficam aqui, não repetidos em cada page.tsx.
 */
export default function CascaPublica({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-brand-canvas-deep text-brand-canvas-ink">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-5 pt-6 pb-2 md:px-8 md:pt-8">
        <div className="flex items-center gap-5">
          <Logo claro />
          <nav aria-label="Páginas públicas" className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/ranking" className="text-brand-canvas-ink/70 transition-colors hover:text-brand-canvas-ink">
              Ranking
            </Link>
            <Link href="/agenda" className="text-brand-canvas-ink/70 transition-colors hover:text-brand-canvas-ink">
              Agenda
            </Link>
          </nav>
        </div>
        {/* Sobre o navy da marca, nem primário nem contorno têm contraste:
            os dois puxam cor da interface, que aqui não se aplica. */}
        <Button
          asChild
          size="sm"
          className="border border-brand-canvas-ink/25 bg-transparent text-brand-canvas-ink shadow-none hover:bg-brand-canvas-ink/10"
        >
          <Link href="/login">
            <LogIn aria-hidden />
            Entrar
          </Link>
        </Button>
      </header>

      {children}
    </div>
  );
}
