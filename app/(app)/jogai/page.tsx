import type { Metadata } from "next";
import { History, Trophy, Undo2 } from "lucide-react";
import Link from "next/link";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardHeading,
  CardNota,
  CardTitle,
} from "@/components/ui/card";
import { Confirmacao } from "@/components/ui/confirmacao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Barra, Linha, LinhaTexto, Lista, Numero, Posicao } from "@/components/ui/lista";
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
  const listaDeEventos = eventos.data ?? [];
  const estornados = new Set(
    listaDeEventos.map((e) => e.estorna_evento_id).filter(Boolean) as string[],
  );

  const podeEstornar = pessoa.isAdmin || pessoa.coordenaAlgumaArea;

  return (
    <>
      <CabecalhoDaPagina
        titulo="IDE JOGAI"
        descricao="Lance pontos pelo catálogo de motivos e acompanhe o ranking do ano."
      />

      <CorpoDaPagina>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-5">
            <Lancador
              criancas={criancas.data ?? []}
              motivos={motivos.data ?? []}
              atividades={atividades.data ?? []}
            />

            <Card>
              <CardHeader>
                <CardHeading>
                  <CardTitle>Últimos lançamentos</CardTitle>
                  <CardDescription>25 mais recentes</CardDescription>
                </CardHeading>
              </CardHeader>

              {listaDeEventos.length === 0 ? (
                <EstadoVazio
                  compacto
                  icone={History}
                  titulo="Nenhum ponto lançado ainda"
                  descricao="Cada lançamento aparece aqui com criança, motivo, quem lançou e quando."
                />
              ) : (
                <Lista>
                  {listaDeEventos.map((evento) => {
                    const ehEstorno = Boolean(evento.estorna_evento_id);
                    const foiEstornado = estornados.has(evento.id);
                    const positivo = evento.valor_aplicado > 0;
                    const nome = nomeDaCrianca.get(evento.crianca_id) ?? "Criança removida";

                    return (
                      <Linha key={evento.id}>
                        <span
                          className={cn(
                            "min-w-11 rounded-md px-2 py-1 text-center text-md font-semibold",
                            positivo
                              ? "bg-positive-soft text-positive-strong"
                              : "bg-negative-soft text-negative-strong",
                            foiEstornado && "opacity-50",
                          )}
                        >
                          {positivo ? "+" : ""}
                          {evento.valor_aplicado}
                        </span>

                        <LinhaTexto
                          principal={nome}
                          riscado={foiEstornado}
                          secundario={[
                            ehEstorno
                              ? "Estorno"
                              : (rotuloDoMotivo.get(evento.motivo_id ?? "") ?? "Motivo removido"),
                            nomeDaPessoa.get(evento.lancado_por) ?? "Pessoa removida",
                            quando(evento.lancado_em),
                          ].join(" · ")}
                        />

                        {foiEstornado ? (
                          <Badge variant="negative">estornado</Badge>
                        ) : podeEstornar && !ehEstorno ? (
                          <Confirmacao
                            titulo="Estornar este lançamento?"
                            descricao={
                              <>
                                O ponto de <span className="font-semibold text-ink">{nome}</span> não é
                                apagado: um lançamento contrário é criado e os dois ficam visíveis no
                                histórico.
                              </>
                            }
                            rotuloConfirmar="Estornar"
                            perigoso
                            acao={estornarLancamento}
                            campos={{ evento_id: evento.id, crianca_id: evento.crianca_id }}
                            mensagemDeSucesso="Lançamento estornado."
                          >
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Estornar este lançamento"
                              className="hover:bg-negative-soft hover:text-negative-strong"
                            >
                              <Undo2 aria-hidden />
                            </Button>
                          </Confirmacao>
                        ) : null}
                      </Linha>
                    );
                  })}
                </Lista>
              )}

              <CardNota>
                Cada ponto é um registro, não um número que muda. Estornar cria um lançamento
                contrário e mantém os dois visíveis, para que sempre dê para explicar à criança por
                que a pontuação dela é essa.
              </CardNota>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardHeading>
                <CardTitle>Ranking do ano</CardTitle>
              </CardHeading>
              <Badge>
                {linhasDoRanking.length} {linhasDoRanking.length === 1 ? "criança" : "crianças"}
              </Badge>
            </CardHeader>

            {linhasDoRanking.length === 0 ? (
              <EstadoVazio
                compacto
                icone={Trophy}
                titulo="O ranking aparece com as primeiras crianças"
                descricao="Assim que houver cadastro, cada criança entra aqui com a pontuação do ano."
              />
            ) : (
              <Lista ordenada>
                {linhasDoRanking.map((linha, indice) => (
                  <Linha key={linha.crianca_id}>
                    <Posicao numero={indice + 1} />
                    <LinhaTexto principal={linha.nome_completo} secundario={linha.nome_publico} />
                    <Barra proporcao={maior > 0 ? linha.pontos / maior : 0} className="hidden sm:block" />
                    <Numero>{linha.pontos}</Numero>
                  </Linha>
                ))}
              </Lista>
            )}

            <CardNota>
              Aqui a equipe vê o nome real. Na página pública em{" "}
              <Link
                href="/ranking"
                target="_blank"
                className="font-semibold text-brand-ink underline-offset-3 hover:underline"
              >
                /ranking
              </Link>{" "}
              aparece só o nome abreviado.
            </CardNota>
          </Card>
        </div>
      </CorpoDaPagina>
    </>
  );
}
