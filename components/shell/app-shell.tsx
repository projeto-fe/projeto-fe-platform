"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/marca/logo";
import { MenuDaConta } from "@/components/shell/menu-da-conta";
import { NAVEGACAO } from "@/components/shell/navegacao";
import { cn } from "@/lib/utils";

type Props = {
  usuario: { nome: string; papel: string; isAdmin: boolean };
  children: React.ReactNode;
};

function estaAtivo(href: string, caminho: string) {
  return href === "/" ? caminho === "/" : caminho.startsWith(href);
}

export function AppShell({ usuario, children }: Props) {
  const caminho = usePathname();
  const permitidos = NAVEGACAO.filter((i) => !i.somenteAdmin || usuario.isAdmin);
  const itens = permitidos.filter((i) => !i.somenteCelular);
  const noCelular = permitidos.filter((i) => i.noCelular).slice(0, 5);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[236px_1fr]">
      {/* Barra lateral: só no desktop. No celular, a barra inferior assume. */}
      <aside className="hidden border-r border-line bg-surface-raised md:flex md:flex-col">
        <div className="border-b border-line px-4 py-3.5">
          <Logo />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {(["operacao", "administracao"] as const).map((grupo) => {
            const doGrupo = itens.filter((i) => i.grupo === grupo);
            if (doGrupo.length === 0) return null;

            return (
              <div key={grupo} className="contents">
                <span className="px-2.5 pt-3 pb-1.5 font-display text-[0.625rem] font-semibold tracking-[0.14em] text-ink-subtle uppercase">
                  {grupo === "operacao" ? "Operação" : "Administração"}
                </span>
                {doGrupo.map((item) => {
                  const ativo = estaAtivo(item.href, caminho);
                  const Icone = item.icone;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={ativo ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-semibold transition-colors",
                        ativo
                          ? "bg-brand-soft text-brand-ink"
                          : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
                      )}
                    >
                      <Icone className={cn("size-[17px]", ativo ? "text-brand" : "text-ink-subtle")} />
                      {item.rotulo}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="border-t border-line p-1.5">
          <MenuDaConta nome={usuario.nome} papel={usuario.papel} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {children}

        {/* Barra inferior: só no celular. Cinco itens alcançáveis com o polegar. */}
        <nav className="sticky bottom-0 grid grid-cols-5 border-t border-line bg-surface-raised pb-[env(safe-area-inset-bottom)] md:hidden">
          {noCelular.map((item) => {
            const ativo = estaAtivo(item.href, caminho);
            const Icone = item.icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 py-2 font-display text-[0.625rem] font-semibold",
                  ativo ? "text-brand-ink" : "text-ink-muted",
                )}
              >
                <Icone className={cn("size-5", ativo ? "text-brand" : "text-ink-subtle")} />
                {item.rotuloCurto}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
