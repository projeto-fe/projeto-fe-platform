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
import { Paginacao } from "@/components/ui/paginacao";
import { carregarRanking } from "@/lib/ranking";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

import { estornarLancamento } from "./actions";
import { BotaoDeLancarPonto } from "./lancador";
import { MotivosDialogo } from "./motivos-dialogo";

export const metadata: Metadata = {
  title: "IDE JOGAI",
  description: "Lançamento de pontos e ranking do ano, com o histórico de quem lançou o quê.",
};

function quando(iso: string) {
  const data = new Date(iso);
  const hoje = new Date();
  const mesmoDia = data.toDateString() === hoje.toDateString();
  const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (mesmoDia) return `Hoje, ${hora}`;
  return `${data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}, ${hora}`;
}

const POR_PAGINA = 20;

export default async function Jogai({
  searchParams,
}: {
  searchParams: Promise<{ paginaExtrato?: string; paginaRanking?: string }>;
}) {
  const pessoa = await exigirPessoaLogada();
  const supabase = await criarClienteDoServidor();
  const { paginaExtrato, paginaRanking } = await searchParams;

  const paginaDoExtrato = Math.max(1, Number(paginaExtrato) || 1);
  const inicioDoExtrato = (paginaDoExtrato - 1) * POR_PAGINA;
  const paginaDoRanking = Math.max(1, Number(paginaRanking) || 1);
  const inicioDoRanking = (paginaDoRanking - 1) * POR_PAGINA;

  const [criancas, motivos, atividades, rankingCompleto, eventos, equipe, motivosUsados] =
    await Promise.all([
      supabase.from("criancas").select("id, nome_completo").eq("ativo", true).order("nome_completo"),
      supabase.from("motivos_pontuacao").select("id, rotulo, valor, ativo").order("ordem"),
      supabase.from("areas").select("id, nome").eq("tipo", "atividade").eq("ativo", true).order("nome"),
      carregarRanking(),
      supabase
        .from("pontuacao_eventos")
        .select("id, crianca_id, motivo_id, valor_aplicado, lancado_por, lancado_em, estorna_evento_id", {
          count: "exact",
        })
        .order("lancado_em", { ascending: false })
        .range(inicioDoExtrato, inicioDoExtrato + POR_PAGINA - 1),
      supabase.from("perfis").select("id, nome"),
      supabase.from("pontuacao_eventos").select("motivo_id").not("motivo_id", "is", null),
    ]);

  const linhasDoRanking = rankingCompleto.slice(inicioDoRanking, inicioDoRanking + POR_PAGINA);
  const totalDoRanking = rankingCompleto.length;
  const totalPaginasDoRanking = Math.max(1, Math.ceil(totalDoRanking / POR_PAGINA));
  const totalDoExtrato = eventos.count ?? 0;
  const totalPaginasDoExtrato = Math.max(1, Math.ceil(totalDoExtrato / POR_PAGINA));

  // Barra de proporção do ranking compara sempre com o maior de todos, não
  // só o maior da página em tela, senão a barra muda de escala a cada página.
  const maiorDoRanking = rankingCompleto[0]?.pontos ?? 0;

  const idsDeMotivosUsados = new Set((motivosUsados.data ?? []).map((e) => e.motivo_id));
  const todosOsMotivos = (motivos.data ?? []).map((m) => ({
    ...m,
    temHistorico: idsDeMotivosUsados.has(m.id),
  }));
  const motivosAtivos = todosOsMotivos.filter((m) => m.ativo);

  const nomeDaPessoa = new Map((equipe.data ?? []).map((p) => [p.id, p.nome]));
  const nomeDaCrianca = new Map((criancas.data ?? []).map((c) => [c.id, c.nome_completo]));
  const rotuloDoMotivo = new Map(todosOsMotivos.map((m) => [m.id, m.rotulo]));
  const listaDeEventos = eventos.data ?? [];
  const estornados = new Set(
    listaDeEventos.map((e) => e.estorna_evento_id).filter(Boolean) as string[],
  );

  const podeEstornar = pessoa.isAdmin || pessoa.coordenaAlgumaArea;

  function hrefDoExtrato(pagina: number) {
    const parametros = new URLSearchParams();
    if (pagina > 1) parametros.set("paginaExtrato", String(pagina));
    if (paginaDoRanking > 1) parametros.set("paginaRanking", String(paginaDoRanking));
    const query = parametros.toString();
    return query ? `/jogai?${query}` : "/jogai";
  }

  function hrefDoRanking(pagina: number) {
    const parametros = new URLSearchParams();
    if (paginaDoExtrato > 1) parametros.set("paginaExtrato", String(paginaDoExtrato));
    if (pagina > 1) parametros.set("paginaRanking", String(pagina));
    const query = parametros.toString();
    return query ? `/jogai?${query}` : "/jogai";
  }

  return (
    <>
      <CabecalhoDaPagina
        titulo="IDE JOGAI"
        descricao="Lance pontos pelo catálogo de motivos e acompanhe o ranking do ano."
        acao={
          <div className="flex items-center gap-2">
            {pessoa.isAdmin ? <MotivosDialogo motivos={todosOsMotivos} /> : null}
            <BotaoDeLancarPonto
              criancas={criancas.data ?? []}
              motivos={motivosAtivos}
              atividades={atividades.data ?? []}
            />
          </div>
        }
      />

      <CorpoDaPagina>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <Card>
            <CardHeader>
              <CardHeading>
                <CardTitle>Últimos lançamentos</CardTitle>
                <CardDescription>{totalDoExtrato} no total</CardDescription>
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

            <Paginacao
              paginaAtual={paginaDoExtrato}
              totalDePaginas={totalPaginasDoExtrato}
              criarHref={hrefDoExtrato}
            />
            <CardNota>
              Cada ponto é um registro, não um número que muda. Estornar cria um lançamento
              contrário e mantém os dois visíveis, para que sempre dê para explicar à criança por
              que a pontuação dela é essa.
            </CardNota>
          </Card>

          <Card>
            <CardHeader>
              <CardHeading>
                <CardTitle>Ranking do ano</CardTitle>
              </CardHeading>
              <Badge>
                {totalDoRanking} {totalDoRanking === 1 ? "criança" : "crianças"}
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
                    <Posicao numero={inicioDoRanking + indice + 1} />
                    <LinhaTexto principal={linha.nome_completo} secundario={linha.nome_publico} />
                    <Barra
                      proporcao={maiorDoRanking > 0 ? linha.pontos / maiorDoRanking : 0}
                      className="hidden sm:block"
                    />
                    <Numero>{linha.pontos}</Numero>
                  </Linha>
                ))}
              </Lista>
            )}

            <Paginacao
              paginaAtual={paginaDoRanking}
              totalDePaginas={totalPaginasDoRanking}
              criarHref={hrefDoRanking}
            />
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
