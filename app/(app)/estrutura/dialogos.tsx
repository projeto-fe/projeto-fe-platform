"use client";

import { AlertCircle, Clock, Plus, UserPlus, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Campo, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import { Confirmacao } from "@/components/ui/confirmacao";
import {
  Dialogo,
  DialogoAviso,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoCorpo,
  DialogoDescricao,
  DialogoFechar,
  DialogoGatilho,
  DialogoRodape,
  DialogoTitulo,
  useAcaoEmDialogo,
} from "@/components/ui/dialogo";
import { CamposDeRecorrencia, rotuloDaRecorrencia } from "@/components/calendario/campos-de-recorrencia";
import type { HorarioDaAtividade } from "@/lib/estrutura";

import {
  criarHorario,
  criarNo,
  editarNo,
  removerHorario,
  vincularPessoa,
  type EstadoDaEstrutura,
} from "./actions";

const inicial: EstadoDaEstrutura = {};

type Area = { id: string; nome: string };
type Pessoa = { id: string; nome: string };
type Tipo = "area" | "atividade";

export function NovoNoDialogo({
  areas,
  tipoInicial = "area",
  areaInicial,
  gatilho,
}: {
  areas: Area[];
  tipoInicial?: Tipo;
  areaInicial?: string;
  gatilho?: React.ReactNode;
}) {
  const [aberto, setAberto] = React.useState(false);
  const [tipo, setTipo] = React.useState<Tipo>(tipoInicial);
  const formRef = React.useRef<HTMLFormElement>(null);

  const concluir = React.useCallback(() => {
    setAberto(false);
    formRef.current?.reset();
    setTipo(tipoInicial);
  }, [tipoInicial]);
  const { estado, enviar, enviando } = useAcaoEmDialogo(criarNo, inicial, concluir);

  const semArea = areas.length === 0;
  const podeCriarAtividade = !semArea;

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        {gatilho ?? (
          <Button>
            <Plus aria-hidden />
            Nova área
          </Button>
        )}
      </DialogoGatilho>

      <DialogoConteudo>
        <form ref={formRef} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <DialogoCabecalho>
            <DialogoTitulo>{tipo === "area" ? "Nova área" : "Nova atividade"}</DialogoTitulo>
            <DialogoDescricao>
              {tipo === "area"
                ? "Área é uma frente do projeto, como Educacional ou Esportiva."
                : "Atividade é onde a criança se inscreve, dentro de uma área."}
            </DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo>
            <GradeDeCampos>
              <CampoSelecao
                id="tipo"
                name="tipo"
                rotulo="O que criar"
                colunas={12}
                value={tipo}
                onValueChange={(v) => setTipo(v as Tipo)}
                opcoes={[
                  { value: "area", label: "Área" },
                  {
                    value: "atividade",
                    label: "Atividade",
                    descricao: podeCriarAtividade ? undefined : "Crie uma área antes.",
                  },
                ]}
              />

              <Campo
                id="nome"
                name="nome"
                rotulo="Nome"
                colunas={12}
                obrigatorio
                maxLength={80}
                autoComplete="off"
                placeholder={tipo === "area" ? "Educacional" : "Reforço escolar"}
              />

              {tipo === "atividade" ? (
                <>
                  <CampoSelecao
                    id="parent_id"
                    name="parent_id"
                    rotulo="Dentro da área"
                    colunas={12}
                    obrigatorio
                    defaultValue={areaInicial ?? areas[0]?.id}
                    opcoes={areas.map((a) => ({ value: a.id, label: a.nome }))}
                    placeholder="Escolher área"
                  />
                  <Campo
                    id="descricao_horario"
                    name="descricao_horario"
                    rotulo="Quando acontece"
                    colunas={12}
                    maxLength={120}
                    placeholder="Seg e qua, 14h"
                    ajuda="Texto livre, só para a equipe se orientar."
                  />
                </>
              ) : (
                <CampoSelecao
                  id="parent_id"
                  name="parent_id"
                  rotulo="Dentro de outra área"
                  colunas={12}
                  defaultValue={areaInicial ?? ""}
                  opcoes={areas.map((a) => ({ value: a.id, label: a.nome }))}
                  placeholder="Área raiz, sem pai"
                  ajuda="Deixe em branco pra ser uma área raiz, como Educacional ou Esportiva."
                />
              )}
            </GradeDeCampos>

          </DialogoCorpo>

          {estado.erro ? (
            <DialogoAviso>
              <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
                {estado.erro}
              </AvisoDoFormulario>
            </DialogoAviso>
          ) : null}

          <DialogoRodape>
            <DialogoFechar asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogoFechar>
            <Button type="submit" loading={enviando} disabled={tipo === "atividade" && semArea}>
              {tipo === "area" ? "Criar área" : "Criar atividade"}
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}

type NoParaEditar = {
  id: string;
  nome: string;
  tipo: Tipo;
  parent_id: string | null;
  descricao_horario: string | null;
};

/**
 * Renomear, mover de área e (só atividade) ajustar o texto livre de horário.
 * O tipo (área ou atividade) não muda depois de criado.
 */
export function EditarNoDialogo({
  no,
  areas,
  aberto,
  aoMudarAberto,
}: {
  no: NoParaEditar;
  areas: Area[];
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}) {
  const { estado, enviar, enviando } = useAcaoEmDialogo(editarNo, inicial, () => aoMudarAberto(false));
  const outrasAreas = areas.filter((a) => a.id !== no.id);

  return (
    <Dialogo open={aberto} onOpenChange={aoMudarAberto}>
      <DialogoConteudo>
        <form key={no.id} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="id" value={no.id} />

          <DialogoCabecalho>
            <DialogoTitulo>Editar {no.tipo === "area" ? "área" : "atividade"}</DialogoTitulo>
            <DialogoDescricao>
              {no.tipo === "area"
                ? "Nome e, se preciso, para dentro de qual área ela vai."
                : "Nome, a área em que fica e o texto livre de horário."}
            </DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo>
            <GradeDeCampos>
              <Campo
                id={`nome-edicao-${no.id}`}
                name="nome"
                rotulo="Nome"
                colunas={12}
                obrigatorio
                maxLength={80}
                autoComplete="off"
                defaultValue={no.nome}
              />

              {no.tipo === "atividade" ? (
                <>
                  <CampoSelecao
                    id={`area-edicao-${no.id}`}
                    name="parent_id"
                    rotulo="Dentro da área"
                    colunas={12}
                    obrigatorio
                    defaultValue={no.parent_id ?? undefined}
                    opcoes={outrasAreas.map((a) => ({ value: a.id, label: a.nome }))}
                    placeholder="Escolher área"
                  />
                  <Campo
                    id={`horario-edicao-${no.id}`}
                    name="descricao_horario"
                    rotulo="Quando acontece"
                    colunas={12}
                    maxLength={120}
                    placeholder="Seg e qua, 14h"
                    ajuda="Texto livre, só para a equipe se orientar."
                    defaultValue={no.descricao_horario ?? ""}
                  />
                </>
              ) : (
                <CampoSelecao
                  id={`area-edicao-${no.id}`}
                  name="parent_id"
                  rotulo="Dentro da área"
                  colunas={12}
                  defaultValue={no.parent_id ?? ""}
                  opcoes={outrasAreas.map((a) => ({ value: a.id, label: a.nome }))}
                  placeholder="Área raiz, sem pai"
                />
              )}
            </GradeDeCampos>
          </DialogoCorpo>

          {estado.erro ? (
            <DialogoAviso>
              <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
                {estado.erro}
              </AvisoDoFormulario>
            </DialogoAviso>
          ) : null}

          <DialogoRodape>
            <DialogoFechar asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogoFechar>
            <Button type="submit" loading={enviando}>
              Salvar
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}

export function VincularDialogo({
  areaId,
  areaNome,
  pessoas,
  gatilho,
}: {
  areaId: string;
  areaNome: string;
  pessoas: Pessoa[];
  gatilho?: React.ReactNode;
}) {
  const [aberto, setAberto] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  const concluir = React.useCallback(() => {
    setAberto(false);
    formRef.current?.reset();
  }, []);
  const { estado, enviar, enviando } = useAcaoEmDialogo(vincularPessoa, inicial, concluir);

  const semPessoas = pessoas.length === 0;

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        {gatilho ?? (
          <Button variant="ghost" size="sm">
            <UserPlus aria-hidden />
            Vincular pessoa
          </Button>
        )}
      </DialogoGatilho>

      <DialogoConteudo largura="sm">
        <form ref={formRef} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="area_id" value={areaId} />

          <DialogoCabecalho>
            <DialogoTitulo>Vincular pessoa</DialogoTitulo>
            <DialogoDescricao>
              Quem coordena ou ajuda em <span className="font-semibold text-ink">{areaNome}</span>.
              O papel vale só dentro desta área.
            </DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo>
            <GradeDeCampos>
              <CampoSelecao
                id={`pessoa-${areaId}`}
                name="usuario_id"
                rotulo="Pessoa"
                colunas={12}
                obrigatorio
                opcoes={pessoas.map((p) => ({ value: p.id, label: p.nome }))}
                placeholder="Escolher pessoa"
                ajuda={semPessoas ? "Convide alguém em Pessoas e acessos antes." : undefined}
                disabled={semPessoas}
              />
              <CampoSelecao
                id={`papel-${areaId}`}
                name="papel"
                rotulo="Papel"
                colunas={12}
                defaultValue="voluntario"
                opcoes={[
                  { value: "voluntario", label: "Voluntário", descricao: "Cadastra crianças e lança pontos." },
                  { value: "coordenador", label: "Coordenação", descricao: "Também vê endereço, contato e autorização." },
                ]}
              />
            </GradeDeCampos>

          </DialogoCorpo>

          {estado.erro ? (
            <DialogoAviso>
              <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
                {estado.erro}
              </AvisoDoFormulario>
            </DialogoAviso>
          ) : null}

          <DialogoRodape>
            <DialogoFechar asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogoFechar>
            <Button type="submit" loading={enviando} disabled={semPessoas}>
              Vincular
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}

function horaCurta(hora: string) {
  return hora.slice(0, 5);
}

/**
 * Miolo do cronograma (lista + form), sem casca de diálogo: usado tanto no
 * diálogo rápido da árvore quanto direto na página dedicada da atividade.
 */
export function CronogramaConteudo({
  atividadeId,
  horarios,
}: {
  atividadeId: string;
  horarios: HorarioDaAtividade[];
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const limpar = React.useCallback(() => formRef.current?.reset(), []);
  const { estado, enviar, enviando } = useAcaoEmDialogo(criarHorario, inicial, limpar);

  return (
    <div className="flex flex-col gap-4">
      {horarios.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {horarios.map((h) => (
                <li
                  key={h.id}
                  className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-2.5"
                >
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="font-semibold">{rotuloDaRecorrencia(h)}</span>
                    {" · "}
                    {horaCurta(h.hora_inicio)}–{horaCurta(h.hora_fim)}
                    {h.local ? ` · ${h.local}` : ""}
                  </span>
                  <Confirmacao
                    titulo="Remover este horário?"
                    descricao="A atividade deixa de aparecer no calendário neste dia da semana."
                    rotuloConfirmar="Remover horário"
                    perigoso
                    acao={removerHorario}
                    campos={{ id: h.id }}
                    mensagemDeSucesso="Horário removido."
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="size-7 rounded-full text-ink-subtle hover:bg-negative-soft hover:text-negative-strong"
                      aria-label="Remover horário"
                    >
                      <X className="size-3.5" aria-hidden />
                    </Button>
                  </Confirmacao>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">
              Nenhum horário fixo ainda. A atividade não aparece no calendário até ter um.
            </p>
          )}

          <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-3 border-t border-line pt-4">
            <input type="hidden" name="atividade_id" value={atividadeId} />
            <GradeDeCampos>
              <CamposDeRecorrencia idPrefix={atividadeId} />
              <Campo
                id={`inicio-${atividadeId}`}
                name="hora_inicio"
                rotulo="Início"
                type="time"
                colunas={4}
                metadeNoCelular
                obrigatorio
              />
              <Campo
                id={`fim-${atividadeId}`}
                name="hora_fim"
                rotulo="Fim"
                type="time"
                colunas={4}
                metadeNoCelular
                obrigatorio
              />
              <Campo
                id={`local-${atividadeId}`}
                name="local"
                rotulo="Local"
                colunas={4}
                metadeNoCelular
                maxLength={80}
                placeholder="Sala 3"
              />
            </GradeDeCampos>

            {estado.erro ? (
              <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
                {estado.erro}
              </AvisoDoFormulario>
            ) : null}

            <Button type="submit" loading={enviando} variant="outline" className="self-start">
              <Plus aria-hidden />
              Adicionar horário
            </Button>
          </form>
    </div>
  );
}

/**
 * Cronograma recorrente da atividade, em diálogo rápido a partir da árvore.
 * Exceção pontual (cancelar uma data, lançar evento extra) fica no
 * calendário, escolhida no próprio dia, não aqui (Spec 0005).
 */
export function CronogramaDialogo({
  atividadeId,
  atividadeNome,
  horarios,
  gatilho,
}: {
  atividadeId: string;
  atividadeNome: string;
  horarios: HorarioDaAtividade[];
  gatilho?: React.ReactNode;
}) {
  const [aberto, setAberto] = React.useState(false);

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        {gatilho ?? (
          <Button variant="ghost" size="sm">
            <Clock aria-hidden />
            Horários
          </Button>
        )}
      </DialogoGatilho>

      <DialogoConteudo largura="sm">
        <DialogoCabecalho>
          <DialogoTitulo>Horários de {atividadeNome}</DialogoTitulo>
          <DialogoDescricao>
            Cronograma que alimenta o calendário. Cancelamento de uma data ou evento extra se
            registra direto no calendário, no dia certo.
          </DialogoDescricao>
        </DialogoCabecalho>

        <DialogoCorpo>
          <CronogramaConteudo atividadeId={atividadeId} horarios={horarios} />
        </DialogoCorpo>

        <DialogoRodape>
          <DialogoFechar asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogoFechar>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  );
}
