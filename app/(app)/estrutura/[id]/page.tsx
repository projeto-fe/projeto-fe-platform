import type { Metadata } from "next";
import { X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Confirmacao } from "@/components/ui/confirmacao";
import { Iniciais } from "@/components/ui/iniciais";
import { encontrarNo, carregarEstrutura, listarAreas } from "@/lib/estrutura";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { AcoesDoNo } from "../acoes-do-no";
import { desvincularPessoa } from "../actions";
import { CronogramaConteudo, NovoNoDialogo, VincularDialogo } from "../dialogos";
import { EquipeDaAtividadeConteudo } from "../equipe-da-atividade-dialogo";
import { ExcecoesDaAtividade, type ExcecaoDaAtividade } from "../excecoes-da-atividade";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const raizes = await carregarEstrutura();
  const achado = encontrarNo(raizes, id);
  return { title: achado?.no.nome ?? "Estrutura" };
}

export default async function DetalheDoNo({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pessoa = await exigirPessoaLogada();
  const podeEditar = pessoa.isAdmin;

  const raizes = await carregarEstrutura();
  const achado = encontrarNo(raizes, id);
  if (!achado) notFound();
  const { no, caminho } = achado;

  const areas = listarAreas(raizes);
  const supabase = await criarClienteDoServidor();

  const [equipe, excecoesResposta, inscricoesResposta] = await Promise.all([
    supabase.from("perfis").select("id, nome").eq("ativo", true).order("nome"),
    no.tipo === "atividade"
      ? supabase
          .from("atividade_eventos")
          .select("id, data, tipo, hora_inicio, hora_fim, titulo, local")
          .eq("atividade_id", id)
          .order("data", { ascending: false })
      : Promise.resolve({ data: [] as ExcecaoDaAtividade[] }),
    no.tipo === "atividade"
      ? supabase
          .from("crianca_atividades")
          .select("crianca_id, criancas!inner(id, nome_completo, ativo)")
          .eq("atividade_id", id)
          .eq("criancas.ativo", true)
      : Promise.resolve({ data: [] as { crianca_id: string; criancas: { id: string; nome_completo: string } | { id: string; nome_completo: string }[] }[] }),
  ]);

  const excecoes = (excecoesResposta.data ?? []) as ExcecaoDaAtividade[];
  const criancasInscritas = (inscricoesResposta.data ?? [])
    .map((i) => {
      const c = Array.isArray(i.criancas) ? i.criancas[0] : i.criancas;
      return c ? { id: c.id, nome: c.nome_completo } : null;
    })
    .filter((c): c is { id: string; nome: string } => c !== null)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const pai = caminho[caminho.length - 1];
  const atividades = no.filhos.filter((f) => f.tipo === "atividade");
  const subareas = no.filhos.filter((f) => f.tipo === "area");

  return (
    <>
      <CabecalhoDaPagina
        titulo={no.nome}
        voltar={pai ? { href: `/estrutura/${pai.id}`, rotulo: pai.nome } : { href: "/estrutura", rotulo: "Estrutura" }}
        descricao={
          <span className="flex items-center gap-2">
            {caminho.length > 0 ? `${caminho.map((c) => c.nome).join(" / ")} / ` : ""}
            {no.tipo === "area" ? "Área" : "Atividade"}
            {!no.ativo ? <Badge variant="neutral">Desativada</Badge> : null}
          </span>
        }
        acao={
          podeEditar ? (
            <AcoesDoNo
              no={{
                id: no.id,
                nome: no.nome,
                tipo: no.tipo,
                parent_id: no.parent_id,
                descricao_horario: no.descricao_horario,
                ativo: no.ativo,
                temFilhosOuHistorico: no.tipo === "area" ? no.filhos.length > 0 : no.temHistoricoDePresenca,
              }}
              areas={areas}
            />
          ) : undefined
        }
      />

      <CorpoDaPagina>
        {no.tipo === "atividade" ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Cronograma</CardTitle>
              </CardHeader>
              <div className="p-4 pt-0">
                <CronogramaConteudo atividadeId={no.id} horarios={no.horarios} />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipe</CardTitle>
              </CardHeader>
              <div className="p-4 pt-0">
                <EquipeDaAtividadeConteudo
                  atividadeId={no.id}
                  atividadeNome={no.nome}
                  membros={no.membros}
                  pessoas={equipe.data ?? []}
                />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exceções</CardTitle>
              </CardHeader>
              <div className="p-4 pt-0">
                <ExcecoesDaAtividade atividadeId={no.id} excecoes={excecoes} />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crianças inscritas</CardTitle>
                <Badge variant="neutral">{criancasInscritas.length}</Badge>
                {criancasInscritas.length > 0 ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/criancas?atividade=${no.id}`}>Ver na lista</Link>
                  </Button>
                ) : null}
              </CardHeader>
              {criancasInscritas.length > 0 ? (
                <ul className="flex flex-col gap-2 p-4 pt-0">
                  {criancasInscritas.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-2.5">
                      <Iniciais nome={c.nome} tamanho="sm" />
                      <Link href={`/criancas/${c.id}`} className="truncate text-sm font-semibold hover:text-brand-ink">
                        {c.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 pt-0 text-sm text-ink-muted">Nenhuma criança inscrita ainda.</p>
              )}
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Equipe</CardTitle>
                {podeEditar ? <VincularDialogo areaId={no.id} areaNome={no.nome} pessoas={equipe.data ?? []} /> : null}
              </CardHeader>
              {no.membros.length > 0 ? (
                <ul className="flex flex-wrap gap-2 p-4 pt-0">
                  {no.membros.map((m) => (
                    <li
                      key={m.usuario_id}
                      className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1 pr-1.5 pl-1"
                    >
                      <Iniciais nome={m.nome} tamanho="sm" tom={m.papel === "coordenador" ? "marca" : "neutro"} />
                      <span className="truncate text-sm font-semibold">{m.nome}</span>
                      <Badge variant={m.papel === "coordenador" ? "positive" : "neutral"}>
                        {m.papel === "coordenador" ? "Coordenação" : "Voluntário"}
                      </Badge>
                      {podeEditar ? (
                        <Confirmacao
                          titulo={`Remover ${m.nome} de ${no.nome}?`}
                          descricao="A pessoa continua com acesso ao portal, só deixa de ter papel nesta área."
                          rotuloConfirmar="Remover vínculo"
                          perigoso
                          acao={desvincularPessoa}
                          campos={{ usuario_id: m.usuario_id, area_id: no.id }}
                          mensagemDeSucesso="Vínculo removido."
                        >
                          <Button variant="ghost" size="icon-sm" className="size-6 rounded-full text-ink-subtle hover:bg-negative-soft hover:text-negative-strong" aria-label={`Remover ${m.nome}`}>
                            <X className="size-3.5" aria-hidden />
                          </Button>
                        </Confirmacao>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 pt-0 text-sm text-ink-muted">Ninguém vinculado ainda.</p>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividades</CardTitle>
                <Badge variant="neutral">{atividades.length}</Badge>
                {podeEditar ? (
                  <NovoNoDialogo
                    areas={areas}
                    tipoInicial="atividade"
                    areaInicial={no.id}
                    gatilho={<Button variant="ghost" size="sm">Nova atividade</Button>}
                  />
                ) : null}
              </CardHeader>
              {atividades.length > 0 ? (
                <ul className="flex flex-col gap-2 p-4 pt-0">
                  {atividades.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-2.5">
                      <Link href={`/estrutura/${a.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-brand-ink">
                        {a.nome}
                      </Link>
                      {!a.ativo ? <Badge variant="neutral">Desativada</Badge> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 pt-0 text-sm text-ink-muted">Nenhuma atividade nesta área.</p>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subáreas</CardTitle>
                <Badge variant="neutral">{subareas.length}</Badge>
                {podeEditar ? (
                  <NovoNoDialogo
                    areas={areas}
                    tipoInicial="area"
                    areaInicial={no.id}
                    gatilho={<Button variant="ghost" size="sm">Nova subárea</Button>}
                  />
                ) : null}
              </CardHeader>
              {subareas.length > 0 ? (
                <ul className="flex flex-col gap-2 p-4 pt-0">
                  {subareas.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-2.5">
                      <Link href={`/estrutura/${s.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-brand-ink">
                        {s.nome}
                      </Link>
                      {!s.ativo ? <Badge variant="neutral">Desativada</Badge> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 pt-0 text-sm text-ink-muted">Nenhuma subárea aqui.</p>
              )}
            </Card>
          </>
        )}
      </CorpoDaPagina>
    </>
  );
}
