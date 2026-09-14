import type { Metadata } from "next";

import { Logo } from "@/components/marca/logo";
import { criarClienteAdministrativo } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ranking IDE JOGAI",
  description: "Ranking do IDE JOGAI, a gamificação do Instituto Projeto Fé.",
  robots: { index: true, follow: true },
};

// Página aberta: revalida sozinha, não é gerada a cada visita.
export const revalidate = 300;

type Linha = { nome_jogador: string; pontos: number };

/**
 * Única página sem login do sistema.
 *
 * Renderizada no servidor e exibindo apenas nome de jogador e pontuação
 * (ADR 0006). Nenhuma credencial de banco chega ao navegador, então não
 * existe caminho entre quem visita e a tabela de crianças.
 */
export default async function RankingPublico() {
  const supabase = criarClienteAdministrativo();

  const { data } = await supabase
    .from("ranking_interno")
    .select("nome_jogador, pontos")
    .order("pontos", { ascending: false })
    .limit(50);

  const linhas: Linha[] = data ?? [];
  const podio = linhas.slice(0, 3);
  const demais = linhas.slice(3);
  const maior = linhas[0]?.pontos ?? 0;
  const ordemDoPodio = [1, 0, 2];
  const alturas = [112, 88, 74];

  return (
    <main className="min-h-dvh bg-surface-inverse">
      <header className="flex flex-col gap-6 px-5 pt-6 pb-5 md:px-8">
        <Logo claro />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-inverse md:text-4xl">
            IDE JOGAI
          </h1>
          <p className="mt-1.5 text-sm text-ink-inverse/60">
            Ranking de {new Date().getFullYear()}
          </p>
        </div>
      </header>

      <div className="px-5 pb-10 md:px-8">
        {linhas.length === 0 ? (
          <p className="rounded-md border border-ink-inverse/10 bg-ink-inverse/5 px-4 py-6 text-center text-sm text-ink-inverse/60">
            O ranking começa assim que os primeiros pontos forem lançados.
          </p>
        ) : (
          <>
            <div className="mx-auto grid max-w-lg grid-cols-3 items-end gap-2.5">
              {ordemDoPodio.map((indice, posicaoVisual) => {
                const linha = podio[indice];
                if (!linha) return <span key={indice} />;
                const primeiro = indice === 0;
                return (
                  <div key={linha.nome_jogador} className="flex flex-col items-center gap-2">
                    <span className="text-center text-sm font-semibold break-words text-ink-inverse">
                      {linha.nome_jogador}
                    </span>
                    <span
                      className={
                        primeiro
                          ? "flex w-full flex-col items-center justify-center gap-0.5 rounded-t-md bg-brand"
                          : "flex w-full flex-col items-center justify-center gap-0.5 rounded-t-md border border-b-0 border-ink-inverse/12 bg-ink-inverse/8"
                      }
                      style={{ height: alturas[posicaoVisual] }}
                    >
                      <span className="font-display text-[0.625rem] font-semibold tracking-wider text-ink-inverse/75">
                        {indice + 1}º
                      </span>
                      <span className="font-display text-xl font-extrabold tabular-nums text-ink-inverse">
                        {linha.pontos}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            {demais.length > 0 ? (
              <ol className="mx-auto mt-0 max-w-lg overflow-hidden rounded-b-md border border-ink-inverse/10 bg-ink-inverse/5">
                {demais.map((linha, indice) => (
                  <li
                    key={linha.nome_jogador}
                    className="flex items-center gap-3 border-b border-ink-inverse/7 px-4 py-2.5 last:border-b-0"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-inverse/10 font-display text-[0.625rem] font-semibold tabular-nums text-ink-inverse/70">
                      {indice + 4}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink-inverse">
                      {linha.nome_jogador}
                    </span>
                    <span className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-ink-inverse/12 sm:block">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${maior > 0 ? Math.round((linha.pontos / maior) * 100) : 0}%` }}
                      />
                    </span>
                    <span className="w-11 shrink-0 text-right font-display text-[0.9375rem] font-semibold tabular-nums text-ink-inverse">
                      {linha.pontos}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </>
        )}

        <p className="mx-auto mt-5 max-w-[52ch] text-center text-xs text-ink-inverse/50">
          Aparecem aqui apenas o nome de jogador e a pontuação. Nenhum nome completo, foto, idade
          ou outro dado das crianças é publicado.
        </p>
      </div>
    </main>
  );
}
