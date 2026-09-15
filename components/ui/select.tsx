"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import type { OpcaoDeSelecao } from "./campo";

/**
 * O Radix reserva o valor vazio para "limpar", então "nenhum" viaja por um
 * sentinela e volta a ser "" no input escondido que o formulário envia.
 */
const VAZIO = "__vazio__";
const paraRadix = (v: string | undefined) => (v === undefined ? undefined : v === "" ? VAZIO : v);
const doRadix = (v: string) => (v === VAZIO ? "" : v);

type Props = {
  id?: string;
  name?: string;
  opcoes: OpcaoDeSelecao[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (valor: string) => void;
  disabled?: boolean;
  obrigatorio?: boolean;
  className?: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-label"?: string;
};

export function Select({
  id,
  name,
  opcoes,
  placeholder = "Selecionar",
  value,
  defaultValue,
  onValueChange,
  disabled,
  obrigatorio,
  className,
  ...aria
}: Props) {
  const controlado = value !== undefined;
  const [interno, setInterno] = React.useState(defaultValue ?? opcoes[0]?.value ?? "");
  const atual = controlado ? value : interno;

  function trocar(novo: string) {
    const real = doRadix(novo);
    if (!controlado) setInterno(real);
    onValueChange?.(real);
  }

  return (
    <>
      {name ? <input type="hidden" name={name} value={atual ?? ""} /> : null}
      <SelectPrimitive.Root value={paraRadix(atual)} onValueChange={trocar} disabled={disabled} required={obrigatorio}>
        <SelectPrimitive.Trigger
          id={id}
          className={cn(
            "flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-line-strong bg-surface-raised px-3 text-left text-base text-ink shadow-card outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:ring-3 focus:ring-brand-soft data-[placeholder]:text-ink-muted disabled:bg-surface-sunken disabled:text-ink-muted disabled:shadow-none aria-invalid:border-negative [&>span:first-child]:min-w-0 [&>span:first-child]:truncate",
            className,
          )}
          {...aria}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="size-4 shrink-0 text-ink-subtle" aria-hidden />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-80 w-(--radix-select-trigger-width) min-w-40 overflow-hidden rounded-md border border-line bg-surface-raised p-1 shadow-pop animate-surgir"
          >
            <SelectPrimitive.Viewport>
              {opcoes.map((opcao) => (
                <SelectPrimitive.Item
                  key={opcao.value}
                  value={paraRadix(opcao.value)!}
                  className="relative flex cursor-pointer items-start gap-2 rounded-sm py-2 pr-8 pl-2.5 text-sm outline-none select-none data-highlighted:bg-surface-sunken data-[state=checked]:font-semibold data-disabled:opacity-50"
                >
                  <span className="flex min-w-0 flex-col">
                    <SelectPrimitive.ItemText>{opcao.label}</SelectPrimitive.ItemText>
                    {opcao.descricao ? (
                      <span className="text-xs font-normal text-ink-muted">{opcao.descricao}</span>
                    ) : null}
                  </span>
                  <SelectPrimitive.ItemIndicator className="absolute top-2 right-2.5 text-brand">
                    <Check className="size-4" aria-hidden />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </>
  );
}
