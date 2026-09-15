"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { GradeDoMes } from "@/components/calendario/grade-do-mes";
import { GradePorHora } from "@/components/calendario/grade-por-hora";
import { CriarEventoDialogo } from "@/components/calendario/criar-evento-dialogo";
import {
  dataReferenciaDoParametro,
  diaAdjacente,
  intervaloDaSemana,
  nomeDaSemana,
  nomeDoDia,
  paraIso,
} from "@/lib/calendario";
import { cn } from "@/lib/utils";

type Visao = "mes" | "semana" | "dia";
type Atividade = { id: string; nome: string; area: string };
type OcorrenciaDoDia = {
  atividadeId: string;
  atividadeNome: string;
  areaNome: string | null;
  horaInicio: string | null;
  horaFim: string | null;
  local: string | null;
  titulo: string | null;
};

export function CalendarioInterativo({
  visao,
  referenciaIso,
  agenda,
  atividades,
  podeCriar,
}: {
  visao: Visao;
  referenciaIso: string;
  agenda: Record<string, OcorrenciaDoDia[]>;
  atividades: Atividade[];
  podeCriar: boolean;
}) {
  const router = useRouter();
  const referencia = dataReferenciaDoParametro(referenciaIso);
  const agendaMapa = React.useMemo(() => new Map(Object.entries(agenda)), [agenda]);

  const [criando, setCriando] = React.useState<{ data: string; hora?: string } | null>(null);

  const hrefDaOcorrencia = React.useCallback(
    (o: OcorrenciaDoDia, iso: string) => `/calendario/${o.atividadeId}/${iso}`,
    [],
  );

  function abrirCriacao(data: string, hora?: string) {
    if (!podeCriar) return;
    setCriando({ data, hora });
  }

  function irPara(delta: number) {
    const proxima =
      visao === "dia"
        ? diaAdjacente(referencia, delta)
        : visao === "semana"
          ? diaAdjacente(referencia, delta * 7)
          : new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() + delta, 1));
    router.push(`/calendario?visao=${visao}&data=${paraIso(proxima)}`);
  }

  const semana = intervaloDaSemana(referencia);
  const diasDaSemana = Array.from({ length: 7 }, (_, i) => diaAdjacente(semana.inicio, i));

  const rotuloDoPeriodo =
    visao === "dia"
      ? nomeDoDia(referencia)
      : visao === "semana"
        ? nomeDaSemana(semana.inicio, semana.fim)
        : referencia.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {(["mes", "semana", "dia"] as const).map((v) => (
            <Link
              key={v}
              href={`/calendario?visao=${v}&data=${referenciaIso}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                v === visao ? "bg-brand-soft text-brand-ink" : "text-ink-muted hover:bg-surface-sunken",
              )}
            >
              {v === "mes" ? "Mês" : v === "semana" ? "Semana" : "Dia"}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => irPara(-1)}
            className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
          >
            ← Anterior
          </button>
          <span className="text-md font-semibold capitalize">{rotuloDoPeriodo}</span>
          <button
            type="button"
            onClick={() => irPara(1)}
            className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-sunken"
          >
            Próximo →
          </button>
        </div>
      </div>

      {visao === "mes" ? (
        <GradeDoMes
          referencia={referencia}
          agenda={agendaMapa}
          hrefBase="/calendario"
          hrefDaOcorrencia={hrefDaOcorrencia}
          aoClicarDia={podeCriar ? (iso) => abrirCriacao(iso) : undefined}
          mostrarNavegacao={false}
        />
      ) : (
        <GradePorHora
          dias={visao === "semana" ? diasDaSemana : [referencia]}
          agenda={agendaMapa}
          hrefDaOcorrencia={hrefDaOcorrencia}
          aoClicarSlot={podeCriar ? (iso, hora) => abrirCriacao(iso, hora) : undefined}
        />
      )}

      {podeCriar ? (
        <CriarEventoDialogo
          atividades={atividades}
          aberto={criando !== null}
          aoMudarAberto={(aberto) => !aberto && setCriando(null)}
          dataInicial={criando?.data ?? referenciaIso}
          horaInicial={criando?.hora}
        />
      ) : null}
    </div>
  );
}
