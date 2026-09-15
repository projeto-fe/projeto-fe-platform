"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import type { OcorrenciaDoDia } from "@/lib/calendario";
import { diasDaGrade, mesAdjacente, nomeDoMes, parametroDoMes } from "@/lib/calendario";
import { cn } from "@/lib/utils";

const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function horaCurta(hora: string | null) {
  return hora ? hora.slice(0, 5) : "";
}

function isoDoDia(data: Date) {
  return data.toISOString().slice(0, 10);
}

const TONS = {
  app: {
    moldura: "border border-line bg-surface-raised",
    cabecalho: "text-ink-muted",
    diaForaDoMes: "bg-surface-sunken text-ink-subtle",
    diaNoMes: "bg-surface-raised text-ink",
    hoje: "ring-2 ring-brand-soft",
    numero: "text-ink-muted",
    ocorrencia: "bg-brand-soft text-brand-ink hover:bg-brand-soft/80",
  },
  publico: {
    moldura: "border border-brand-canvas-ink/12 bg-brand-canvas-ink/5",
    cabecalho: "text-brand-canvas-ink/50",
    diaForaDoMes: "bg-transparent text-brand-canvas-ink/25",
    diaNoMes: "bg-transparent text-brand-canvas-ink",
    hoje: "ring-2 ring-brand/60",
    numero: "text-brand-canvas-ink/60",
    ocorrencia: "bg-brand-canvas-ink/10 text-brand-canvas-ink",
  },
} as const;

/**
 * Grade de mês reutilizada pelo calendário interno e pela agenda pública.
 * `hrefDoDia` é opcional: sem ele a grade é só leitura (agenda pública).
 */
export function GradeDoMes({
  referencia,
  agenda,
  hrefBase,
  hrefDaOcorrencia,
  aoClicarDia,
  mostrarNavegacao = true,
  tom = "app",
}: {
  referencia: Date;
  agenda: Map<string, OcorrenciaDoDia[]>;
  hrefBase: string;
  /** Sem isto, a grade é só leitura (agenda pública). Com isto, cada
   *  ocorrência do dia vira link (ex.: abrir a chamada daquela atividade). */
  hrefDaOcorrencia?: (ocorrencia: OcorrenciaDoDia, dataIso: string) => string;
  /** Clicar no espaço vazio do dia (estilo Google Calendar: cria evento ali). */
  aoClicarDia?: (dataIso: string) => void;
  /** Desligue quando quem chama já mostra a própria navegação de período
   *  (ex.: o seletor de mês/semana/dia do calendário interno). */
  mostrarNavegacao?: boolean;
  tom?: "app" | "publico";
}) {
  const dias = diasDaGrade(referencia);
  const cor = TONS[tom];
  const hojeIso = isoDoDia(new Date());
  const mesAnterior = parametroDoMes(mesAdjacente(referencia, -1));
  const proximoMes = parametroDoMes(mesAdjacente(referencia, 1));

  return (
    <div className="flex flex-col gap-3">
      {mostrarNavegacao ? (
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`${hrefBase}?mes=${mesAnterior}`}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors",
              tom === "app" ? "text-ink-muted hover:bg-surface-sunken" : "text-brand-canvas-ink/70 hover:bg-brand-canvas-ink/10",
            )}
          >
            ← Anterior
          </Link>
          <span className="text-md font-semibold">{nomeDoMes(referencia)}</span>
          <Link
            href={`${hrefBase}?mes=${proximoMes}`}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors",
              tom === "app" ? "text-ink-muted hover:bg-surface-sunken" : "text-brand-canvas-ink/70 hover:bg-brand-canvas-ink/10",
            )}
          >
            Próximo →
          </Link>
        </div>
      ) : null}

      <div className={cn("overflow-hidden rounded-lg", cor.moldura)}>
        <div className="grid grid-cols-7">
          {DIAS_CURTOS.map((d) => (
            <div key={d} className={cn("px-1.5 py-2 text-center text-2xs font-semibold uppercase", cor.cabecalho)}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {dias.map(({ data, noMes }) => {
            const iso = isoDoDia(data);
            const ocorrencias = agenda.get(iso) ?? [];
            const visiveis = ocorrencias.slice(0, 3);

            return (
              <div
                key={iso}
                role={aoClicarDia ? "button" : undefined}
                tabIndex={aoClicarDia ? 0 : undefined}
                onClick={aoClicarDia ? () => aoClicarDia(iso) : undefined}
                onKeyDown={
                  aoClicarDia
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          aoClicarDia(iso);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "group flex min-h-24 flex-col gap-1 border-t border-r border-line/40 p-1.5 last:border-r-0",
                  noMes ? cor.diaNoMes : cor.diaForaDoMes,
                  iso === hojeIso && cor.hoje,
                  aoClicarDia && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs font-semibold", cor.numero)}>{data.getUTCDate()}</span>
                  {aoClicarDia ? (
                    <Plus
                      className={cn(
                        "size-3.5 opacity-0 transition-opacity group-hover:opacity-100",
                        cor.numero,
                      )}
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className="flex flex-col gap-0.5">
                  {visiveis.map((o, i) => {
                    const rotulo = `${horaCurta(o.horaInicio)} ${o.titulo ?? o.atividadeNome}`.trim();
                    const href = hrefDaOcorrencia?.(o, iso);
                    const classe = cn(
                      "truncate rounded px-1 py-0.5 text-left text-2xs font-semibold",
                      cor.ocorrencia,
                    );
                    return href ? (
                      <Link
                        key={`${o.atividadeId}-${i}`}
                        href={href}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(classe, "transition-colors hover:brightness-95")}
                        title={rotulo}
                      >
                        {rotulo}
                      </Link>
                    ) : (
                      <span key={`${o.atividadeId}-${i}`} className={classe} title={rotulo}>
                        {rotulo}
                      </span>
                    );
                  })}
                  {ocorrencias.length > 3 ? (
                    <span className={cn("text-2xs font-semibold", cor.numero)}>
                      +{ocorrencias.length - 3}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
