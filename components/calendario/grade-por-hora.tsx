"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import type { OcorrenciaDoDia } from "@/lib/calendario";
import { paraIso } from "@/lib/calendario";
import { cn } from "@/lib/utils";

const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function horaCurta(hora: string | null) {
  return hora ? hora.slice(0, 5) : "";
}

function horaDaOcorrencia(o: OcorrenciaDoDia) {
  return o.horaInicio ? Number(o.horaInicio.slice(0, 2)) : 0;
}

const TONS = {
  app: {
    moldura: "border border-line bg-surface-raised",
    cabecalho: "text-ink-muted border-line/40",
    linha: "border-line/40",
    numero: "text-ink-muted",
    hoje: "bg-brand-soft/30",
    ocorrencia: "bg-brand-soft text-brand-ink hover:bg-brand-soft/80",
  },
  publico: {
    moldura: "border border-brand-canvas-ink/12 bg-brand-canvas-ink/5",
    cabecalho: "text-brand-canvas-ink/60 border-brand-canvas-ink/10",
    linha: "border-brand-canvas-ink/10",
    numero: "text-brand-canvas-ink/50",
    hoje: "bg-brand/10",
    ocorrencia: "bg-brand-canvas-ink/10 text-brand-canvas-ink",
  },
} as const;

/**
 * Grade por hora, usada tanto na visão de semana (7 colunas) quanto na de
 * dia (1 coluna). Cada ocorrência cai na linha da hora de início; sem
 * posicionamento por minuto ou arraste, ao contrário do Google Calendar de
 * verdade — o suficiente para ver e criar compromisso no horário certo.
 */
export function GradePorHora({
  dias,
  agenda,
  hrefDaOcorrencia,
  aoClicarSlot,
  tom = "app",
}: {
  dias: Date[];
  agenda: Map<string, OcorrenciaDoDia[]>;
  hrefDaOcorrencia?: (ocorrencia: OcorrenciaDoDia, dataIso: string) => string;
  aoClicarSlot?: (dataIso: string, hora: string) => void;
  tom?: "app" | "publico";
}) {
  const cor = TONS[tom];
  const hojeIso = paraIso(new Date());

  const todasHoras = dias.flatMap((d) => agenda.get(paraIso(d)) ?? []).map(horaDaOcorrencia);
  const horaMin = Math.min(6, ...todasHoras);
  const horaMax = Math.max(21, ...todasHoras);
  const horas = Array.from({ length: horaMax - horaMin + 1 }, (_, i) => horaMin + i);

  return (
    <div className={cn("overflow-hidden rounded-lg", cor.moldura)}>
      <div
        className="grid"
        style={{ gridTemplateColumns: `3.5rem repeat(${dias.length}, minmax(0, 1fr))` }}
      >
        <div className={cn("border-r border-b", cor.cabecalho)} />
        {dias.map((d) => {
          const iso = paraIso(d);
          return (
            <div
              key={iso}
              className={cn(
                "border-b px-1.5 py-2 text-center text-xs font-semibold",
                cor.cabecalho,
                iso === hojeIso && cor.hoje,
              )}
            >
              {dias.length > 1 ? `${DIAS_CURTOS[d.getUTCDay()]} ` : ""}
              {d.getUTCDate()}
            </div>
          );
        })}

        {horas.map((hora) => (
          <React.Fragment key={hora}>
            <div className={cn("border-r border-t px-1.5 py-2 text-right text-2xs", cor.linha, cor.numero)}>
              {String(hora).padStart(2, "0")}h
            </div>
            {dias.map((d) => {
              const iso = paraIso(d);
              const doDia = (agenda.get(iso) ?? []).filter((o) => horaDaOcorrencia(o) === hora);
              const slot = `${String(hora).padStart(2, "0")}:00`;

              return (
                <div
                  key={`${iso}-${hora}`}
                  role={aoClicarSlot ? "button" : undefined}
                  tabIndex={aoClicarSlot ? 0 : undefined}
                  onClick={aoClicarSlot ? () => aoClicarSlot(iso, slot) : undefined}
                  onKeyDown={
                    aoClicarSlot
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            aoClicarSlot(iso, slot);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "group flex min-h-11 flex-col gap-0.5 border-t p-1",
                    cor.linha,
                    iso === hojeIso && cor.hoje,
                    aoClicarSlot && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  )}
                >
                  {doDia.map((o, i) => {
                    const rotulo = `${horaCurta(o.horaInicio)} ${o.titulo ?? o.atividadeNome}`.trim();
                    const href = hrefDaOcorrencia?.(o, iso);
                    const classe = cn("truncate rounded px-1 py-0.5 text-left text-2xs font-semibold", cor.ocorrencia);
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
                  {aoClicarSlot && doDia.length === 0 ? (
                    <Plus className={cn("size-3 opacity-0 transition-opacity group-hover:opacity-100", cor.numero)} aria-hidden />
                  ) : null}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
