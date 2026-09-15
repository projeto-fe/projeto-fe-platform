"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "grid size-[18px] shrink-0 place-items-center rounded-[5px] border border-line-strong bg-surface-raised shadow-card outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-brand-soft data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-action-ink disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="animate-surgir">
        <Check className="size-3.5" strokeWidth={3} aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/**
 * Opção em forma de cartão: marca a linha inteira, não só a caixinha.
 * Boa para lista curta de escolhas com um subtítulo (atividade e sua área).
 */
export function OpcaoMarcavel({
  id,
  name,
  value,
  titulo,
  descricao,
  defaultChecked,
  className,
}: {
  id: string;
  name: string;
  value: string;
  titulo: string;
  descricao?: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-md border border-line bg-surface-raised px-3.5 py-3 transition-colors duration-150 hover:bg-surface-sunken has-[[data-state=checked]]:border-brand has-[[data-state=checked]]:bg-brand-soft",
        className,
      )}
    >
      <Checkbox id={id} name={name} value={value} defaultChecked={defaultChecked} />
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{titulo}</span>
        {descricao ? <span className="block text-xs text-ink-muted">{descricao}</span> : null}
      </span>
    </label>
  );
}
