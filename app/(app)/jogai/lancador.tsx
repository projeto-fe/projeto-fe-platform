"use client";

import { AlertCircle, Check } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { lancarPonto, type EstadoDoLancamento } from "./actions";

const inicial: EstadoDoLancamento = {};

export type Motivo = { id: string; rotulo: string; valor: number };

export function Lancador({
  criancas,
  motivos,
  atividades,
}: {
  criancas: { id: string; nome_completo: string }[];
  motivos: Motivo[];
  atividades: { id: string; nome: string }[];
}) {
  const [estado, acao, enviando] = useActionState(lancarPonto, inicial);
  const [motivoEscolhido, setMotivoEscolhido] = useState<string>(motivos[0]?.id ?? "");

  if (criancas.length === 0 || motivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lançar pontos</CardTitle>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-ink-muted">
            {criancas.length === 0
              ? "Cadastre ao menos uma criança para começar a lançar pontos."
              : "Nenhum motivo cadastrado no catálogo."}
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lançar pontos</CardTitle>
      </CardHeader>
      <CardBody>
        <form action={acao} className="flex flex-col gap-4">
          <GradeDeCampos>
            <CampoSelecao id="crianca_id" name="crianca_id" rotulo="Criança" colunas={12}>
              {criancas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_completo}
                </option>
              ))}
            </CampoSelecao>

            {atividades.length > 0 ? (
              <CampoSelecao
                id="atividade_id"
                name="atividade_id"
                rotulo="Durante qual atividade"
                colunas={12}
              >
                <option value="">Não informar</option>
                {atividades.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </CampoSelecao>
            ) : null}
          </GradeDeCampos>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 font-display text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase">
              Motivo
            </legend>

            <div className="grid gap-2 sm:grid-cols-2">
              {motivos.map((motivo) => {
                const escolhido = motivo.id === motivoEscolhido;
                const positivo = motivo.valor > 0;

                return (
                  <label
                    key={motivo.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-sm border px-3 py-2.5 transition-colors",
                      escolhido
                        ? "border-brand bg-brand-soft"
                        : "border-line hover:bg-surface-sunken",
                    )}
                  >
                    <input
                      type="radio"
                      name="motivo_id"
                      value={motivo.id}
                      checked={escolhido}
                      onChange={() => setMotivoEscolhido(motivo.id)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        "min-w-10 rounded-sm px-2 py-1 text-center font-display text-[0.9375rem] font-semibold tabular-nums",
                        positivo
                          ? "bg-positive-soft text-positive-strong"
                          : "bg-negative-soft text-negative-strong",
                      )}
                    >
                      {positivo ? "+" : ""}
                      {motivo.valor}
                    </span>
                    <span className="text-sm font-semibold">{motivo.rotulo}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {estado.erro ? (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-sm bg-negative-soft px-3 py-2.5 text-sm text-negative-strong"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {estado.erro}
            </p>
          ) : null}

          {estado.sucesso ? (
            <p
              role="status"
              className="flex items-center gap-2 rounded-sm bg-positive-soft px-3 py-2.5 text-sm text-positive-strong"
            >
              <Check className="size-4 shrink-0" aria-hidden />
              {estado.sucesso}
            </p>
          ) : null}

          <Button type="submit" variant="brand" size="lg" loading={enviando}>
            Lançar ponto
          </Button>

          <p className="text-xs text-ink-muted">
            O valor vem do catálogo, não do formulário, para que o mesmo acontecimento valha o
            mesmo ponto independente de quem lança. Todo lançamento fica registrado em seu nome.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
