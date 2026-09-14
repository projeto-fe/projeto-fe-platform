import type { Metadata } from "next";
import { Undo2 } from "lucide-react";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { estornarLancamento } from "./actions";
import { Lancador } from "./lancador";

export const metadata: Metadata = { title: "IDE JOGAI" };

function quando(iso: string) {
  const data = new Date(iso);
  const hoje = new Date();
  const mesmoDia = data.toDateString() === hoje.toDateString();
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (mesmoDia) return `Hoje, ${hora}`;
  return `${data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}, ${hora}`;
}

export default async function Jogai() {
  const pessoa = await exigirPessoaLogada();
  const supabase = await criarClienteDoServidor();

  const [criancas, motivos, atividades, ranking, eventos, equipe] = await Promise.all([
    supabase.from("criancas").select("id, nome_completo").eq("ativo", true).order("nome_completo"),
    supabase.from("motivos_pontuacao").select("id, rotulo, valor").eq("ativo", true).order("ordem"),
    supabase.from("areas").select("id, nome").eq("tipo", "atividade").eq("ativo", true).order("nome"),
    supabase
      .from("ranking_interno")
      .select("crianca_id, nome_completo, nome_publico, pontos")
      .order("pontos", { ascending: false }),
    supabase
      .from("pontuacao_eventos")
      .select("id, crianca_id, motivo_id, valor_aplicado, lancado_por, lancado_em, estorna_evento_id")
      .order("lancado_em", { ascending: false })
      .limit(25),
    supabase.from("perfis").select("id, nome"),
  ]);

  const nomeDaPessoa = new Map((equipe.data ?? []).map((p) => [p.id, p.nome]));
  const nomeDaCrianca = new Map((criancas.data ?? []).map((c) => [c.id, c.nome_completo]));
  const rotuloDoMotivo = new Map((motivos.data ?? []).map((m) => [m.id, m.rotulo]));

  const linhasDoRanking = ranking.data ?? [];
  const maior = linhasDoRanking[0]?.pontos ?? 0;
  const estornados = new Set(
    (eventos.data ?? []).map((e) => e.estorna_evento_id).filter(Boolean) as string[],
  );

  const podeEstornar = pessoa.isAdmin || pessoa.coordenaAlgumaArea;

  return (
    <>
      <CabecalhoDaPagina titulo="IDE JOGAI" />

      <CorpoDaPagina>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="flex flex-col gap-4">
            <Lancador
              criancas={criancas.data ?? []}
              motivos={motivos.data ?? []}
              atividades={atividades.data ?? []}
            />

            <Card>
              <CardHeader>
                <CardTitle>Últimos lançamentos</CardTitle>
              </CardHeader>

              {(eventos.data ?? []).length === 0 ? (
                <CardBody>
                  <p className="text-sm text-ink-muted">Nenhum ponto lançado ainda.</p>
                </CardBody>
              ) : (
                <ul className="flex flex-col">
                  {(eventos.data ?? []).map((evento) => {
                    const ehEstorno = Boolean(evento.estorna_evento_id);
                    const foiEstornado = estornados.has(evento.id);
                    const positivo = evento.valor_aplicado > 0;

                    return (
                      <li
                        key={evento.id}
                        className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
                      >
                        <span
                          className={cn(
                            "min-w-11 rounded-sm px-2 py-1 text-center font-display text-[0.9375rem] font-semibold tabular-nums",
                            positivo
                              ? "bg-positive-soft text-positive-strong"
                              : "bg-negative-soft text-negative-strong",
                            foiEstornado && "opacity-50",
                          )}
                        >
                          {positivo ? "+" : ""}
                          {evento.valor_aplicado}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block truncate text-sm font-semibold",
                              foiEstornado && "text-ink-muted line-through",
                            )}
                          >
                            {nomeDaCrianca.get(evento.crianca_id) ?? "Criança removida"}
                          </span>
                          <span className="block truncate text-xs text-ink-muted">
                            {ehEstorno
                              ? "Estorno"
                              : (rotuloDoMotivo.get(evento.motivo_id ?? "") ?? "Motivo removido")}
                            {" · "}
                            {nomeDaPessoa.get(evento.lancado_por) ?? "Pessoa removida"}
                            {" · "}
                            {quando(evento.lancado_em)}
                          </span>
                        </span>

                        {foiEstornado ? (
                          <Badge variant="negative">estornado</Badge>
                        ) : podeEstornar && !ehEstorno ? (
                          <form action={estornarLancamento}>
                            <input type="hidden" name="evento_id" value={evento.id} />
                            <input type="hidden" name="crianca_id" value={evento.crianca_id} />
                            <button
                              type="submit"
                              aria-label="Estornar este lançamento"
                              className="grid size-8 place-items-center rounded-sm text-ink-subtle hover:bg-negative-soft hover:text-negative-strong"
                            >
                              <Undo2 className="size-4" aria-hidden />
                            </button>
                          </form>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}

              <CardBody className="border-t border-line">
                <p className="text-xs text-ink-muted">
                  Cada ponto é um registro, não um número que muda. Estornar cria um lançamento
                  contrário e mantém os dois visíveis, para que sempre dê para explicar à criança
                  por que a pontuação dela é essa.
                </p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ranking do ano</CardTitle>
              <span className="flex-1" />
              <Badge variant="brand">
                {linhasDoRanking.length}{" "}
                {linhasDoRanking.length === 1 ? "criança" : "crianças"}
              </Badge>
            </CardHeader>

            {linhasDoRanking.length === 0 ? (
              <CardBody>
                <p className="text-sm text-ink-muted">
                  O ranking aparece quando houver crianças cadastradas.
                </p>
              </CardBody>
            ) : (
              <ol className="flex flex-col">
                {linhasDoRanking.map((linha, indice) => (
                  <li
                    key={linha.crianca_id}
                    className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
                  >
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full font-display text-[0.625rem] font-semibold tabular-nums",
                        indice === 0
                          ? "bg-brand text-action-ink"
                          : indice < 3
                            ? "bg-brand-soft text-brand-ink"
                            : "bg-surface-sunken text-ink-muted",
                      )}
                    >
                      {indice + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {linha.nome_completo}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {linha.nome_publico}
                      </span>
                    </span>

                    <span className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-surface-sunken sm:block">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{
                          width: `${maior > 0 ? Math.max(0, Math.round((linha.pontos / maior) * 100)) : 0}%`,
                        }}
                      />
                    </span>

                    <span className="w-12 shrink-0 text-right font-display text-[0.9375rem] font-semibold tabular-nums">
                      {linha.pontos}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            <CardBody className="border-t border-line">
              <p className="text-xs text-ink-muted">
                Aqui a equipe vê o nome real. Na página pública, em{" "}
                <span className="font-semibold">/ranking</span>, aparece só o nome abreviado.
              </p>
            </CardBody>
          </Card>
        </div>
      </CorpoDaPagina>
    </>
  );
}
