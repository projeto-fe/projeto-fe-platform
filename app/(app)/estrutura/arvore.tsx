"use client";

import { ChevronRight, UserPlus, X } from "lucide-react";
import { useActionState, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Campo, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import type { NoDaEstrutura } from "@/lib/estrutura";
import { cn } from "@/lib/utils";

import {
  criarNo,
  desvincularPessoa,
  vincularPessoa,
  type EstadoDaEstrutura,
} from "./actions";

type Pessoa = { id: string; nome: string };

const inicial: EstadoDaEstrutura = {};

export function Arvore({
  raizes,
  pessoas,
  podeEditar,
}: {
  raizes: NoDaEstrutura[];
  pessoas: Pessoa[];
  podeEditar: boolean;
}) {
  if (raizes.length === 0) {
    return (
      <Card>
        <CardBody className="flex flex-col items-start gap-3">
          <p className="text-sm text-ink-muted">
            Nenhuma área ainda. Comece criando as grandes frentes do projeto, como Educacional
            ou Esportiva, e depois as atividades dentro de cada uma.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {raizes.map((no) => (
        <No key={no.id} no={no} pessoas={pessoas} podeEditar={podeEditar} nivel={0} />
      ))}
    </div>
  );
}

function No({
  no,
  pessoas,
  podeEditar,
  nivel,
}: {
  no: NoDaEstrutura;
  pessoas: Pessoa[];
  podeEditar: boolean;
  nivel: number;
}) {
  const [aberto, setAberto] = useState(nivel === 0);
  const [vinculando, setVinculando] = useState(false);

  const coordenador = no.membros.find((m) => m.papel === "coordenador");
  const voluntarios = no.membros.filter((m) => m.papel === "voluntario");

  const resumo =
    no.tipo === "area"
      ? [
          coordenador ? `Coordenação: ${coordenador.nome}` : "Sem coordenação",
          `${no.filhos.length} ${no.filhos.length === 1 ? "atividade" : "atividades"}`,
        ].join(" · ")
      : [
          `${no.inscritos} ${no.inscritos === 1 ? "criança" : "crianças"}`,
          no.descricao_horario,
        ]
          .filter(Boolean)
          .join(" · ");

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface-raised">
      <button
        type="button"
        onClick={() => setAberto((antes) => !antes)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-sunken"
      >
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-ink-subtle transition-transform",
            aberto && "rotate-90",
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[0.9375rem] font-semibold">{no.nome}</span>
          <span className="block truncate text-xs text-ink-muted">{resumo}</span>
        </span>
        <Badge variant={no.tipo === "area" ? "brand" : "neutral"}>
          {no.tipo === "area" ? "Área" : "Atividade"}
        </Badge>
      </button>

      {aberto ? (
        <div className="flex flex-col gap-2 border-t border-line px-3 py-3 pl-6 md:pl-11">
          {no.membros.length > 0 ? (
            <ul className="flex flex-col gap-1.5">
              {[coordenador, ...voluntarios].filter(Boolean).map((membro) => (
                <li
                  key={membro!.usuario_id}
                  className="flex items-center gap-2.5 rounded-sm bg-surface-sunken px-2.5 py-1.5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                    {membro!.nome}
                  </span>
                  <Badge variant={membro!.papel === "coordenador" ? "positive" : "neutral"}>
                    {membro!.papel === "coordenador" ? "Coordenação" : "Voluntário"}
                  </Badge>
                  {podeEditar ? (
                    <form action={desvincularPessoa}>
                      <input type="hidden" name="usuario_id" value={membro!.usuario_id} />
                      <input type="hidden" name="area_id" value={no.id} />
                      <button
                        type="submit"
                        aria-label={`Remover ${membro!.nome} de ${no.nome}`}
                        className="grid size-7 place-items-center rounded-sm text-ink-subtle hover:bg-negative-soft hover:text-negative-strong"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-ink-muted">Ninguém vinculado ainda.</p>
          )}

          {podeEditar ? (
            vinculando ? (
              <FormularioDeVinculo
                areaId={no.id}
                pessoas={pessoas}
                aoFechar={() => setVinculando(false)}
              />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => setVinculando(true)}
              >
                <UserPlus className="size-4" aria-hidden />
                Vincular pessoa
              </Button>
            )
          ) : null}

          {no.filhos.length > 0 ? (
            <div className="mt-1 flex flex-col gap-2">
              {no.filhos.map((filho) => (
                <No
                  key={filho.id}
                  no={filho}
                  pessoas={pessoas}
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

function FormularioDeVinculo({
  areaId,
  pessoas,
  aoFechar,
}: {
  areaId: string;
  pessoas: Pessoa[];
  aoFechar: () => void;
}) {
  const [estado, acao, enviando] = useActionState(vincularPessoa, inicial);

  return (
    <form action={acao} className="flex flex-col gap-2 rounded-sm border border-line p-2.5">
      <input type="hidden" name="area_id" value={areaId} />
      <GradeDeCampos>
        <CampoSelecao id={`pessoa-${areaId}`} name="usuario_id" rotulo="Pessoa" colunas={6}>
          {pessoas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </CampoSelecao>
        <CampoSelecao id={`papel-${areaId}`} name="papel" rotulo="Papel" colunas={6}>
          <option value="voluntario">Voluntário</option>
          <option value="coordenador">Coordenação</option>
        </CampoSelecao>
      </GradeDeCampos>

      {estado.erro ? (
        <p role="alert" className="text-xs text-negative-strong">
          {estado.erro}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" size="sm" loading={enviando}>
          Vincular
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={aoFechar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export function FormularioDeNo({
  areas,
}: {
  areas: { id: string; nome: string }[];
}) {
  const [estado, acao, enviando] = useActionState(criarNo, inicial);
  const [tipo, setTipo] = useState<"area" | "atividade">("area");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar</CardTitle>
      </CardHeader>
      <CardBody>
        <form action={acao} className="flex flex-col gap-3">
          <GradeDeCampos>
            <CampoSelecao
              id="tipo"
              name="tipo"
              rotulo="O que criar"
              colunas={4}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "area" | "atividade")}
            >
              <option value="area">Área</option>
              <option value="atividade">Atividade</option>
            </CampoSelecao>

            <Campo
              id="nome"
              name="nome"
              rotulo="Nome"
              colunas={8}
              obrigatorio
              maxLength={80}
              placeholder={tipo === "area" ? "Educacional" : "Reforço escolar"}
            />

            {tipo === "atividade" ? (
              <>
                <CampoSelecao
                  id="parent_id"
                  name="parent_id"
                  rotulo="Dentro da área"
                  colunas={6}
                  obrigatorio
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nome}
                    </option>
                  ))}
                </CampoSelecao>
                <Campo
                  id="descricao_horario"
                  name="descricao_horario"
                  rotulo="Quando acontece"
                  colunas={6}
                  maxLength={120}
                  placeholder="Seg e qua, 14h"
                  ajuda="Texto livre, só para a equipe se orientar."
                />
              </>
            ) : (
              <input type="hidden" name="parent_id" value="" />
            )}
          </GradeDeCampos>

          {estado.erro ? (
            <p role="alert" className="text-sm text-negative-strong">
              {estado.erro}
            </p>
          ) : null}
          {estado.sucesso ? (
            <p role="status" className="text-sm text-positive-strong">
              {estado.sucesso}
            </p>
          ) : null}

          <Button type="submit" loading={enviando} className="self-start">
            {tipo === "area" ? "Criar área" : "Criar atividade"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
