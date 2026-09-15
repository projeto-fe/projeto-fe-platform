"use client";

import { ArrowUpRight, ChevronRight, Network, Plus, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Confirmacao } from "@/components/ui/confirmacao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Iniciais } from "@/components/ui/iniciais";
import { Linha, LinhaTexto, Lista } from "@/components/ui/lista";
import type { NoDaEstrutura } from "@/lib/estrutura";
import { cn } from "@/lib/utils";

import { desvincularPessoa } from "./actions";
import { AcoesDoNo } from "./acoes-do-no";
import { CronogramaDialogo, NovoNoDialogo, VincularDialogo } from "./dialogos";
import { EquipeDaAtividadeDialogo } from "./equipe-da-atividade-dialogo";

type Pessoa = { id: string; nome: string };
type Area = { id: string; nome: string };

function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
}

export function Arvore({
  raizes,
  pessoas,
  areas,
  podeEditar,
}: {
  raizes: NoDaEstrutura[];
  pessoas: Pessoa[];
  /** Todas as áreas (inclusive subáreas), para escolher onde criar atividade. */
  areas: Area[];
  podeEditar: boolean;
}) {
  if (raizes.length === 0) {
    return (
      <Card>
        <EstadoVazio
          icone={Network}
          titulo="Nenhuma área ainda"
          descricao="Comece pelas grandes frentes do projeto, como Educacional ou Esportiva. Depois crie as atividades dentro de cada uma."
          acao={
            podeEditar ? (
              <NovoNoDialogo
                areas={areas}
                gatilho={
                  <Button>
                    <Plus aria-hidden />
                    Criar a primeira área
                  </Button>
                }
              />
            ) : undefined
          }
        />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {raizes.map((no) => (
        <Card key={no.id}>
          <BlocoDeArea no={no} pessoas={pessoas} areas={areas} podeEditar={podeEditar} nivel={0} />
        </Card>
      ))}
    </div>
  );
}

function BlocoDeArea({
  no,
  pessoas,
  areas,
  podeEditar,
  nivel,
}: {
  no: NoDaEstrutura;
  pessoas: Pessoa[];
  areas: Area[];
  podeEditar: boolean;
  nivel: number;
}) {
  const [aberto, setAberto] = React.useState(nivel === 0);

  const coordenador = no.membros.find((m) => m.papel === "coordenador");
  const atividades = no.filhos.filter((f) => f.tipo === "atividade");
  const subareas = no.filhos.filter((f) => f.tipo === "area");

  const resumo = [
    coordenador ? `Coordenação: ${coordenador.nome}` : "Sem coordenação",
    plural(atividades.length, "atividade", "atividades"),
    subareas.length > 0 ? plural(subareas.length, "subárea", "subáreas") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const raiz = nivel === 0;

  return (
    <div className={cn(!raiz && "border-l border-line pl-4", !no.ativo && "opacity-60")}>
      <div className={cn("flex w-full items-center gap-2", raiz ? "pr-5" : "pr-2")}>
        <button
          type="button"
          onClick={() => setAberto((antes) => !antes)}
          aria-expanded={aberto}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-brand-soft",
            raiz ? "py-4 pl-5" : "rounded-md py-2.5 pl-2",
          )}
        >
          <ChevronRight
            className={cn(
              "size-4 shrink-0 text-ink-subtle transition-transform duration-150 ease-out-soft",
              aberto && "rotate-90",
            )}
            aria-hidden
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className={cn("truncate font-semibold", raiz ? "text-md" : "text-base")}>{no.nome}</span>
            <span className="truncate text-xs text-ink-muted">{resumo}</span>
          </span>
        </button>
        <Link
          href={`/estrutura/${no.id}`}
          aria-label={`Abrir ${no.nome}`}
          className="grid size-8 shrink-0 place-items-center rounded-md text-ink-subtle outline-none transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
        {podeEditar ? (
          <AcoesDoNo
            no={{
              id: no.id,
              nome: no.nome,
              tipo: "area",
              parent_id: no.parent_id,
              descricao_horario: no.descricao_horario,
              ativo: no.ativo,
              temFilhosOuHistorico: no.filhos.length > 0,
            }}
            areas={areas}
          />
        ) : null}
        {!no.ativo ? <Badge variant="neutral">Desativada</Badge> : null}
      </div>

      {aberto ? (
        <div className={cn("flex flex-col", raiz && "border-t border-line")}>
          {/* Equipe da área */}
          <div className={cn("flex flex-col gap-3 py-4", raiz ? "px-5" : "px-2")}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Equipe</span>
              {podeEditar ? (
                <VincularDialogo areaId={no.id} areaNome={no.nome} pessoas={pessoas} />
              ) : null}
            </div>

            {no.membros.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {no.membros.map((membro) => (
                  <li
                    key={membro.usuario_id}
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1 pr-1.5 pl-1"
                  >
                    <Iniciais nome={membro.nome} tamanho="sm" tom={membro.papel === "coordenador" ? "marca" : "neutro"} />
                    <span className="truncate text-sm font-semibold">{membro.nome}</span>
                    <Badge variant={membro.papel === "coordenador" ? "positive" : "neutral"}>
                      {membro.papel === "coordenador" ? "Coordenação" : "Voluntário"}
                    </Badge>
                    {podeEditar ? (
                      <Confirmacao
                        titulo={`Remover ${membro.nome} de ${no.nome}?`}
                        descricao="A pessoa continua com acesso ao portal, só deixa de ter papel nesta área. Você pode vincular de novo depois."
                        rotuloConfirmar="Remover vínculo"
                        perigoso
                        acao={desvincularPessoa}
                        campos={{ usuario_id: membro.usuario_id, area_id: no.id }}
                        mensagemDeSucesso="Vínculo removido."
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-6 rounded-full text-ink-subtle hover:bg-negative-soft hover:text-negative-strong"
                          aria-label={`Remover ${membro.nome} de ${no.nome}`}
                        >
                          <X className="size-3.5" aria-hidden />
                        </Button>
                      </Confirmacao>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-muted">
                Ninguém vinculado ainda.{podeEditar ? " Vincule quem coordena e quem ajuda nesta área." : ""}
              </p>
            )}
          </div>

          {/* Atividades */}
          <div className={cn("flex flex-col border-t border-line", !raiz && "rounded-md")}>
            <div className={cn("flex items-center justify-between gap-3 pt-4 pb-2", raiz ? "px-5" : "px-2")}>
              <span className="text-sm font-semibold">
                Atividades{" "}
                <span className="font-normal text-ink-muted">{atividades.length > 0 ? atividades.length : ""}</span>
              </span>
              {podeEditar ? (
                <NovoNoDialogo
                  areas={areas}
                  tipoInicial="atividade"
                  areaInicial={no.id}
                  gatilho={
                    <Button variant="ghost" size="sm">
                      <Plus aria-hidden />
                      Nova atividade
                    </Button>
                  }
                />
              ) : null}
            </div>

            {atividades.length > 0 ? (
              <Lista className={cn("border-t border-line", !raiz && "mx-2")}>
                {atividades.map((atividade) => (
                  <Linha key={atividade.id} className={cn(raiz ? "px-5" : "px-2", !atividade.ativo && "opacity-60")}>
                    <LinhaTexto
                      principal={
                        <Link href={`/estrutura/${atividade.id}`} className="hover:text-brand-ink">
                          {atividade.nome}
                        </Link>
                      }
                      secundario={[
                        plural(atividade.inscritos, "criança inscrita", "crianças inscritas"),
                        atividade.horarios.length > 0
                          ? plural(atividade.horarios.length, "horário fixo", "horários fixos")
                          : atividade.descricao_horario,
                        atividade.membros.length > 0
                          ? plural(atividade.membros.length, "pessoa vinculada", "pessoas vinculadas")
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                    {podeEditar ? (
                      <EquipeDaAtividadeDialogo
                        atividadeId={atividade.id}
                        atividadeNome={atividade.nome}
                        membros={atividade.membros}
                        pessoas={pessoas}
                      />
                    ) : null}
                    {podeEditar ? (
                      <CronogramaDialogo
                        atividadeId={atividade.id}
                        atividadeNome={atividade.nome}
                        horarios={atividade.horarios}
                      />
                    ) : null}
                    {podeEditar ? (
                      <AcoesDoNo
                        no={{
                          id: atividade.id,
                          nome: atividade.nome,
                          tipo: "atividade",
                          parent_id: atividade.parent_id,
                          descricao_horario: atividade.descricao_horario,
                          ativo: atividade.ativo,
                          temFilhosOuHistorico: atividade.temHistoricoDePresenca,
                        }}
                        areas={areas}
                      />
                    ) : null}
                    {!atividade.ativo ? <Badge variant="neutral">Desativada</Badge> : null}
                  </Linha>
                ))}
              </Lista>
            ) : (
              <p className={cn("pb-4 text-sm text-ink-muted", raiz ? "px-5" : "px-2")}>
                Nenhuma atividade nesta área.{podeEditar ? " Crie a primeira para as crianças poderem se inscrever." : ""}
              </p>
            )}
          </div>

          {/* Subáreas */}
          {subareas.length > 0 ? (
            <div className={cn("flex flex-col gap-2 border-t border-line py-4", raiz ? "px-5" : "px-2")}>
              {subareas.map((sub) => (
                <BlocoDeArea
                  key={sub.id}
                  no={sub}
                  pessoas={pessoas}
                  areas={areas}
                  podeEditar={podeEditar}
                  nivel={nivel + 1}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
