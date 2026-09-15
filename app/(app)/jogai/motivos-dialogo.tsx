"use client";

import { AlertCircle, ListPlus, Pencil, Trash2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Campo, GradeDeCampos } from "@/components/ui/campo";
import { Confirmacao } from "@/components/ui/confirmacao";
import {
  Dialogo,
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

import { criarMotivo, editarMotivo, excluirMotivo, type EstadoDoMotivo } from "./actions";

type Motivo = { id: string; rotulo: string; valor: number; temHistorico: boolean };

const inicial: EstadoDoMotivo = {};

function LinhaDoMotivo({ motivo }: { motivo: Motivo }) {
  const [editando, setEditando] = React.useState(false);
  const { estado, enviar, enviando } = useAcaoEmDialogo(editarMotivo, inicial, () => setEditando(false));

  if (editando) {
    return (
      <li className="rounded-md border border-line bg-surface-raised p-3">
        <form onSubmit={enviar} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={motivo.id} />
          <GradeDeCampos>
            <Campo
              id={`rotulo-${motivo.id}`}
              name="rotulo"
              rotulo="Texto"
              colunas={8}
              obrigatorio
              maxLength={80}
              autoFocus
              defaultValue={motivo.rotulo}
            />
            <Campo
              id={`valor-${motivo.id}`}
              name="valor"
              rotulo="Pontos"
              type="number"
              colunas={4}
              obrigatorio
              defaultValue={motivo.valor}
              ajuda="Negativo tira ponto."
            />
          </GradeDeCampos>
          {estado.erro ? (
            <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
              {estado.erro}
            </AvisoDoFormulario>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={enviando}>
              Salvar
            </Button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-2.5">
      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{motivo.rotulo}</span>
      <span
        className={
          "min-w-11 shrink-0 rounded-md px-2 py-1 text-center text-sm font-semibold " +
          (motivo.valor > 0 ? "bg-positive-soft text-positive-strong" : "bg-negative-soft text-negative-strong")
        }
      >
        {motivo.valor > 0 ? "+" : ""}
        {motivo.valor}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Editar ${motivo.rotulo}`}
        onClick={() => setEditando(true)}
      >
        <Pencil className="size-3.5" aria-hidden />
      </Button>
      <Confirmacao
        titulo={`Excluir "${motivo.rotulo}"?`}
        descricao={
          motivo.temHistorico ? (
            <>
              Esse motivo já foi usado em algum lançamento, e apagar levaria esse histórico
              junto. Não dá para excluir um motivo já usado.
            </>
          ) : (
            <>Apaga o motivo de vez. Não dá para desfazer.</>
          )
        }
        rotuloConfirmar="Excluir"
        perigoso
        desabilitado={motivo.temHistorico}
        acao={excluirMotivo}
        campos={{ id: motivo.id }}
        mensagemDeSucesso="Motivo excluído."
      >
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Excluir ${motivo.rotulo}`}
          className="hover:bg-negative-soft hover:text-negative-strong"
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </Confirmacao>
    </li>
  );
}

/**
 * Catálogo de motivos do IDE JOGAI: criar, renomear, mudar o valor e
 * excluir. Editar o valor não reescreve pontuação já lançada (o gatilho
 * `eventos_valor_do_catalogo` copia o valor na hora do lançamento, ADR 0003).
 * Motivo já usado em algum lançamento não se apaga, só isso: sem desativar.
 */
export function MotivosDialogo({ motivos }: { motivos: Motivo[] }) {
  const [aberto, setAberto] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const { estado, enviar, enviando } = useAcaoEmDialogo(criarMotivo, inicial, () => formRef.current?.reset());

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        <Button variant="outline">
          <ListPlus aria-hidden />
          Motivos
        </Button>
      </DialogoGatilho>

      <DialogoConteudo largura="sm">
        <DialogoCabecalho>
          <DialogoTitulo>Catálogo de motivos</DialogoTitulo>
          <DialogoDescricao>
            O que aparece pra escolher ao lançar ponto, e quantos pontos cada motivo vale.
          </DialogoDescricao>
        </DialogoCabecalho>

        <DialogoCorpo className="flex flex-col gap-4">
          {motivos.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {motivos.map((m) => (
                <LinhaDoMotivo key={m.id} motivo={m} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">Nenhum motivo cadastrado ainda.</p>
          )}

          <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-3 border-t border-line pt-4">
            <GradeDeCampos>
              <Campo
                id="rotulo-novo-motivo"
                name="rotulo"
                rotulo="Texto"
                colunas={8}
                obrigatorio
                maxLength={80}
                placeholder="Ajudou um colega"
                autoComplete="off"
              />
              <Campo
                id="valor-novo-motivo"
                name="valor"
                rotulo="Pontos"
                type="number"
                colunas={4}
                obrigatorio
                placeholder="5"
                ajuda="Negativo tira ponto."
              />
            </GradeDeCampos>

            {estado.erro ? (
              <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
                {estado.erro}
              </AvisoDoFormulario>
            ) : null}

            <Button type="submit" loading={enviando} variant="outline" className="self-start">
              Adicionar motivo
            </Button>
          </form>
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
