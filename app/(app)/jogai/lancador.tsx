"use client";

import { AlertCircle, Star } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import { Card, CardBody, CardDescription, CardHeader, CardHeading, CardTitle } from "@/components/ui/card";
import { EstadoVazio } from "@/components/ui/estado-vazio";
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

  useEffect(() => {
    if (estado.sucesso) toast.success(estado.sucesso);
  }, [estado]);

  if (criancas.length === 0 || motivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardHeading>
            <CardTitle>Lançar pontos</CardTitle>
            <CardDescription>O valor vem do catálogo, igual para todo mundo.</CardDescription>
          </CardHeading>
        </CardHeader>
        {criancas.length === 0 ? (
          <EstadoVazio
            icone={Star}
            titulo="Ainda não há crianças para pontuar"
            descricao="Cadastre a primeira criança e os motivos do catálogo aparecem aqui prontos para lançar."
            acao={
              <Button asChild>
                <Link href="/criancas/nova">Cadastrar criança</Link>
              </Button>
            }
          />
        ) : (
          <EstadoVazio
            icone={Star}
            titulo="Nenhum motivo no catálogo"
            descricao="Os motivos de pontuação são cadastrados no banco. Fale com a administração para ativar o catálogo."
          />
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardHeading>
          <CardTitle>Lançar pontos</CardTitle>
          <CardDescription>O valor vem do catálogo, igual para todo mundo.</CardDescription>
        </CardHeading>
      </CardHeader>
      <CardBody>
        <form action={acao} className="flex flex-col gap-5">
          <GradeDeCampos>
            <CampoSelecao
              id="crianca_id"
              name="crianca_id"
              rotulo="Criança"
              colunas={atividades.length > 0 ? 7 : 12}
              obrigatorio
              placeholder="Escolher criança"
              opcoes={criancas.map((c) => ({ value: c.id, label: c.nome_completo }))}
            />

            {atividades.length > 0 ? (
              <CampoSelecao
                id="atividade_id"
                name="atividade_id"
                rotulo="Durante qual atividade"
                colunas={5}
                defaultValue=""
                opcoes={[
                  { value: "", label: "Não informar" },
                  ...atividades.map((a) => ({ value: a.id, label: a.nome })),
                ]}
              />
            ) : null}
          </GradeDeCampos>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold text-ink">Motivo</legend>

            <div className="grid gap-2 sm:grid-cols-2">
              {motivos.map((motivo) => {
                const escolhido = motivo.id === motivoEscolhido;
                const positivo = motivo.valor > 0;

                return (
                  <label
                    key={motivo.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 transition-colors duration-150 has-focus-visible:ring-3 has-focus-visible:ring-brand-soft",
                      escolhido
                        ? "border-brand bg-brand-soft"
                        : "border-line bg-surface-raised hover:bg-surface-sunken",
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
                        "min-w-11 rounded-md px-2 py-1 text-center text-md font-semibold",
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
            <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
              {estado.erro}
            </AvisoDoFormulario>
          ) : null}

          <Button type="submit" variant="brand" size="lg" loading={enviando} className="w-full sm:w-auto sm:self-start">
            Lançar ponto
          </Button>

          <p className="text-xs leading-relaxed text-ink-muted">
            Todo lançamento fica registrado em seu nome, com data e motivo.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
