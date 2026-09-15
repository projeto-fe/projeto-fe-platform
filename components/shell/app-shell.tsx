"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/marca/logo";
import { MenuDaConta } from "@/components/shell/menu-da-conta";
import { NAVEGACAO, ROTULO_DO_GRUPO } from "@/components/shell/navegacao";
import { cn } from "@/lib/utils";

type Props = {
  usuario: { id: string; nome: string; papel: string; isAdmin: boolean };
  children: React.ReactNode;
};

function estaAtivo(href: string, caminho: string) {
  return href === "/" ? caminho === "/" : caminho.startsWith(href);
}

/**
 * Casca do sistema: barra lateral num plano abaixo do conteúdo no desktop,
 * barra inferior de cinco destinos no celular. O conteúdo tem largura
 * máxima própria para não esticar tabela e formulário em tela larga.
 */
export function AppShell({ usuario, children }: Props) {
  const caminho = usePathname();
  const permitidos = NAVEGACAO.filter((i) => !i.somenteAdmin || usuario.isAdmin);
  const itens = permitidos.filter((i) => !i.somenteCelular);
  const noCelular = permitidos.filter((i) => i.noCelular).slice(0, 5);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]">
      {/* Barra lateral: só no desktop. No celular, a barra inferior assume. */}
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-surface-nav md:flex md:flex-col">
        <div className="px-5 pt-5 pb-4">
          <Link href="/" className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <Logo />
          </Link>
        </div>

        <nav aria-label="Principal" className="flex flex-1 flex-col gap-5 px-3 pt-1">
          {(["operacao", "administracao"] as const).map((grupo) => {
            const doGrupo = itens.filter((i) => i.grupo === grupo);
            if (doGrupo.length === 0) return null;

            return (
              <div key={grupo} className="flex flex-col gap-0.5">
                <span className="px-2.5 pb-1.5 text-2xs font-semibold tracking-wide text-ink-muted">
                  {ROTULO_DO_GRUPO[grupo]}
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
                        "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-sm font-semibold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-brand",
                        ativo
                          ? "bg-surface-raised text-ink shadow-card"
                          : "text-ink-muted hover:bg-surface-raised/60 hover:text-ink",
                      )}
                    >
                      <Icone
                        className={cn("size-[18px] shrink-0", ativo ? "text-brand" : "text-ink-subtle")}
                        strokeWidth={ativo ? 2.25 : 2}
                        aria-hidden
                      />
                      {item.rotulo}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="p-3">
          <MenuDaConta usuarioId={usuario.id} nome={usuario.nome} papel={usuario.papel} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Barra do topo: só no celular. Logo e conta na mesma linha, uma
            vez só — cada page.tsx não repete mais o logo aqui dentro. */}
        <div className="flex items-center justify-between border-b border-line bg-surface-nav px-4 py-2 md:hidden">
          <Link href="/" className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand">
            <Logo compacto />
          </Link>
          <MenuDaConta usuarioId={usuario.id} nome={usuario.nome} papel={usuario.papel} compacto />
        </div>

        <div className="flex flex-1 flex-col pb-20 md:pb-0">{children}</div>

        {/* Barra inferior: só no celular. Cinco itens alcançáveis com o polegar. */}
        <nav
          aria-label="Principal"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-surface-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {noCelular.map((item) => {
            const ativo = estaAtivo(item.href, caminho);
            const Icone = item.icone;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 pt-2 pb-2.5 text-2xs font-semibold",
                  ativo ? "text-ink" : "text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-12 place-items-center rounded-full transition-colors",
                    ativo && "bg-brand-soft",
                  )}
                >
                  <Icone className={cn("size-5", ativo ? "text-brand" : "text-ink-subtle")} aria-hidden />
                </span>
                {item.rotuloCurto}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
