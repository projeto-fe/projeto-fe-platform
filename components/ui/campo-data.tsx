"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";

import { acessibilidadeDoCampo, estiloDeControle, Moldura } from "@/components/ui/campo";
import { diasDaGrade, mesAdjacente, nomeDoMes, paraIso } from "@/lib/calendario";
import { cn } from "@/lib/utils";

const DIAS_CURTOS = ["D", "S", "T", "Q", "Q", "S", "S"];

function dataDoIso(iso: string) {
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

function formatado(iso: string) {
  return dataDoIso(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" });
}

type Props = {
  id: string;
  name: string;
  rotulo: string;
  obrigatorio?: boolean;
  ajuda?: string;
  erro?: string;
  colunas?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12;
  metadeNoCelular?: boolean;
  defaultValue?: string;
  placeholder?: string;
  /** ISO "AAAA-MM-DD". Fora do intervalo, o dia aparece desabilitado. */
  min?: string;
  max?: string;
};

/**
 * Calendário com o mesmo desenho em todo navegador, no lugar do seletor
 * nativo de `input type="date"` (que varia demais entre navegador e
 * celular). Mesma ideia da grade de mês do calendário de atividades,
 * reaproveitando `diasDaGrade` (Spec 0005 e pedido de calendário
 * personalizado no cadastro).
 */
export function CampoData({
  id,
  name,
  rotulo,
  obrigatorio,
  ajuda,
  erro,
  colunas,
  metadeNoCelular,
  defaultValue,
  placeholder = "Selecionar data",
  min,
  max,
}: Props) {
  const [valor, setValor] = React.useState(defaultValue ?? "");
  const [aberto, setAberto] = React.useState(false);
  const [mesExibido, setMesExibido] = React.useState(() =>
    defaultValue ? dataDoIso(defaultValue) : new Date(),
  );

  const dias = diasDaGrade(mesExibido);
  const minData = min ? dataDoIso(min) : null;
  const maxData = max ? dataDoIso(max) : null;

  return (
    <Moldura id={id} rotulo={rotulo} obrigatorio={obrigatorio} ajuda={ajuda} erro={erro} colunas={colunas} metadeNoCelular={metadeNoCelular}>
      <input type="hidden" name={name} value={valor} required={obrigatorio} />

      <PopoverPrimitive.Root open={aberto} onOpenChange={setAberto}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            id={id}
            className={cn(
              estiloDeControle,
              "flex items-center justify-between gap-2 text-left",
              !valor && "text-ink-subtle",
            )}
            {...acessibilidadeDoCampo(id, erro, ajuda)}
          >
            {valor ? formatado(valor) : placeholder}
            <CalendarDays className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={6}
            className="z-50 w-72 rounded-md border border-line bg-surface-raised p-3 shadow-pop animate-surgir"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMesExibido((m) => mesAdjacente(m, -1))}
                aria-label="Mês anterior"
                className="grid size-7 place-items-center rounded-md text-ink-subtle hover:bg-surface-sunken hover:text-ink"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <span className="text-sm font-semibold">{nomeDoMes(mesExibido)}</span>
              <button
                type="button"
                onClick={() => setMesExibido((m) => mesAdjacente(m, 1))}
                aria-label="Próximo mês"
                className="grid size-7 place-items-center rounded-md text-ink-subtle hover:bg-surface-sunken hover:text-ink"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {DIAS_CURTOS.map((d, i) => (
                <span key={i} className="grid h-7 place-items-center text-2xs font-semibold text-ink-muted">
                  {d}
                </span>
              ))}
              {dias.map(({ data, noMes }) => {
                const iso = paraIso(data);
                const desabilitado = (minData && data < minData) || (maxData && data > maxData);
                const selecionado = iso === valor;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={Boolean(desabilitado)}
                    onClick={() => {
                      setValor(iso);
                      setAberto(false);
                    }}
                    className={cn(
                      "grid h-8 place-items-center rounded-md text-sm transition-colors",
                      !noMes && "text-ink-subtle",
                      noMes && !selecionado && "text-ink hover:bg-surface-sunken",
                      selecionado && "bg-brand text-brand-canvas-ink font-semibold hover:bg-brand",
                      desabilitado && "cursor-not-allowed opacity-30 hover:bg-transparent",
                    )}
                  >
                    {data.getUTCDate()}
                  </button>
                );
              })}
            </div>

            {valor ? (
              <button
                type="button"
                onClick={() => {
                  setValor("");
                  setAberto(false);
                }}
                className="mt-2 w-full rounded-md py-1.5 text-center text-xs font-semibold text-ink-muted hover:bg-surface-sunken hover:text-ink"
              >
                Limpar
              </button>
            ) : null}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </Moldura>
  );
}
