import type { Metadata } from "next";
import { Trophy } from "lucide-react";

import { carregarRanking } from "@/lib/ranking";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  // Página pública: não leva o sufixo do portal interno.
  title: { absolute: "Ranking IDE JOGAI · Instituto Projeto Fé" },
  description: "Ranking do ano do IDE JOGAI, a gamificação do Instituto Projeto Fé, em Marília/SP.",
  robots: { index: true, follow: true },
};

/**
 * Renderizada sob demanda, não durante o build.
 *
 * Gerar esta página no build exigiria a chave de serviço na hora de compilar,
 * e construir o site não deveria precisar da credencial que dá acesso total
 * ao banco. Além disso o ranking muda ao longo do ano: prender o conteúdo ao
 * momento do deploy entregaria pontuação velha até alguém publicar de novo.
 *
 * O custo é uma consulta por visita, irrelevante na escala deste projeto.
 */
export const dynamic = "force-dynamic";

/**
 * Renderizada no servidor e exibindo apenas o nome abreviado e a pontuação
 * (ADR 0006). Nenhuma credencial de banco chega ao navegador, então não
 * existe caminho entre quem visita e a tabela de crianças. Cabeçalho e fundo
 * vêm da casca pública (ADR 0013).
 */
export default async function RankingPublico() {
  const ranking = await carregarRanking();
  const linhas = ranking.slice(0, 50).map((r) => ({ nome_publico: r.nome_publico, pontos: r.pontos }));
  const podio = linhas.slice(0, 3);
  const demais = linhas.slice(3);
  const maior = linhas[0]?.pontos ?? 0;
  const ordemDoPodio = [1, 0, 2];
  const alturas = [120, 96, 80];

  return (
    <main>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-1 px-5 pt-4 pb-6 md:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight">IDE JOGAI</h1>
        <p className="text-base text-brand-canvas-ink/60">Ranking de {new Date().getFullYear()}</p>
      </div>

      <div className="mx-auto w-full max-w-2xl px-5 pb-12 md:px-8">
        {linhas.length === 0 ? (
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-lg border border-brand-canvas-ink/10 bg-brand-canvas-ink/5 px-6 py-12 text-center">
            <span
              className="grid size-12 place-items-center rounded-full bg-brand-canvas-ink/10 text-brand-canvas-ink/70"
              aria-hidden
            >
              <Trophy className="size-6" strokeWidth={1.75} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-md font-semibold">O ranking começa com os primeiros pontos lançados</p>
              <p className="text-sm text-brand-canvas-ink/60">
                Assim que a equipe lançar os primeiros pontos, a lista aparece aqui.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mx-auto grid max-w-lg grid-cols-3 items-end gap-3">
              {ordemDoPodio.map((indice, posicaoVisual) => {
                const linha = podio[indice];
                if (!linha) return <span key={indice} />;
                const primeiro = indice === 0;
                return (
                  <div key={`${linha.nome_publico}-${indice}`} className="flex flex-col items-center gap-2.5">
                    <span className="text-center text-sm font-semibold break-words">{linha.nome_publico}</span>
                    <span
                      className={cn(
                        "flex w-full flex-col items-center justify-center gap-0.5 rounded-t-lg",
                        primeiro
                          ? "bg-brand text-brand-canvas-ink"
                          : "border border-b-0 border-brand-canvas-ink/12 bg-brand-canvas-ink/8",
                      )}
                      style={{ height: alturas[posicaoVisual] }}
                    >
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          primeiro ? "text-brand-canvas-ink/80" : "text-brand-canvas-ink/60",
                        )}
                      >
                        {indice + 1}º
                      </span>
                      <span className="font-display text-2xl font-bold">{linha.pontos}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            {demais.length > 0 ? (
              <ol className="mx-auto max-w-lg divide-y divide-brand-canvas-ink/8 overflow-hidden rounded-b-lg border border-brand-canvas-ink/10 bg-brand-canvas-ink/5">
                {demais.map((linha, indice) => (
                  <li
                    key={`${linha.nome_publico}-${indice + 3}`}
                    className="flex min-h-13 items-center gap-3 px-4 py-2.5"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-canvas-ink/10 text-xs font-bold text-brand-canvas-ink/70">
                      {indice + 4}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">{linha.nome_publico}</span>
                    <span
                      className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-brand-canvas-ink/12 sm:block"
                      aria-hidden
                    >
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{
                          width: `${maior > 0 ? Math.round((linha.pontos / maior) * 100) : 0}%`,
                        }}
                      />
                    </span>
                    <span className="w-12 shrink-0 text-right font-display text-md font-semibold">
                      {linha.pontos}
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </>
        )}

        <p className="mx-auto mt-6 max-w-[52ch] text-center text-xs leading-relaxed text-brand-canvas-ink/50">
          O nome aparece abreviado de propósito. Nenhum sobrenome completo, foto, idade, endereço
          ou atividade das crianças é publicado aqui.
        </p>
      </div>
    </main>
  );
}
