"use client";

import { AlertCircle, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Campo, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import { CampoData } from "@/components/ui/campo-data";
import { Confirmacao } from "@/components/ui/confirmacao";
import { useAcaoEmDialogo } from "@/components/ui/dialogo";

import { criarExcecao, removerExcecao, type EstadoDaEstrutura } from "./actions";

const inicial: EstadoDaEstrutura = {};

export type ExcecaoDaAtividade = {
  id: string;
  data: string;
  tipo: "extra" | "cancelado";
  hora_inicio: string | null;
  hora_fim: string | null;
  titulo: string | null;
  local: string | null;
};

function dataCurta(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/**
 * Cancelamento de data e evento extra desta atividade específica, sem
 * precisar escolher a atividade de novo (já sabida pela página). Mesma
 * decisão do calendário, só que sem o selecionador.
 */
export function ExcecoesDaAtividade({
  atividadeId,
  excecoes,
}: {
  atividadeId: string;
  excecoes: ExcecaoDaAtividade[];
}) {
  const [tipo, setTipo] = React.useState<"cancelado" | "extra">("cancelado");
  const formRef = React.useRef<HTMLFormElement>(null);
  const limpar = React.useCallback(() => {
    formRef.current?.reset();
    setTipo("cancelado");
  }, []);
  const { estado, enviar, enviando } = useAcaoEmDialogo(criarExcecao, inicial, limpar);

  return (
    <div className="flex flex-col gap-4">
      {excecoes.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {excecoes.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-2.5"
            >
              <span className="min-w-0 flex-1 text-sm">
                <span className="font-semibold">{dataCurta(e.data)}</span>
                {" · "}
                {e.tipo === "cancelado" ? "Cancelada" : (e.titulo ?? "Evento extra")}
                {e.tipo === "extra" && e.hora_inicio ? ` · ${e.hora_inicio.slice(0, 5)}–${e.hora_fim?.slice(0, 5)}` : ""}
              </span>
              <Confirmacao
                titulo="Remover esta exceção?"
                descricao="A atividade volta ao padrão normal nesta data."
                rotuloConfirmar="Remover"
                perigoso
                acao={removerExcecao}
                campos={{ id: e.id }}
                mensagemDeSucesso="Exceção removida."
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-7 rounded-full text-ink-subtle hover:bg-negative-soft hover:text-negative-strong"
                  aria-label="Remover exceção"
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              </Confirmacao>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Nenhuma exceção registrada.</p>
      )}

      <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-3 border-t border-line pt-4">
        <input type="hidden" name="atividade_id" value={atividadeId} />
        <GradeDeCampos>
          <CampoSelecao
            id={`tipo-excecao-${atividadeId}`}
            name="tipo"
            rotulo="O que registrar"
            colunas={12}
            value={tipo}
            onValueChange={(v) => setTipo(v as "cancelado" | "extra")}
            opcoes={[
              { value: "cancelado", label: "Cancelar uma data" },
              { value: "extra", label: "Evento extra" },
            ]}
          />
          <CampoData id={`data-excecao-${atividadeId}`} name="data" rotulo="Data" colunas={12} obrigatorio />

          {tipo === "extra" ? (
            <>
              <Campo id={`titulo-excecao-${atividadeId}`} name="titulo" rotulo="Título" colunas={12} maxLength={80} placeholder="Passeio ao parque" />
              <Campo id={`inicio-excecao-${atividadeId}`} name="hora_inicio" rotulo="Início" type="time" colunas={4} metadeNoCelular obrigatorio />
              <Campo id={`fim-excecao-${atividadeId}`} name="hora_fim" rotulo="Fim" type="time" colunas={4} metadeNoCelular obrigatorio />
              <Campo id={`local-excecao-${atividadeId}`} name="local" rotulo="Local" colunas={4} metadeNoCelular maxLength={80} />
            </>
          ) : null}
        </GradeDeCampos>

        {estado.erro ? (
          <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
            {estado.erro}
          </AvisoDoFormulario>
        ) : null}

        <Button type="submit" loading={enviando} variant="outline" className="self-start">
          Registrar
        </Button>
      </form>
    </div>
  );
}
