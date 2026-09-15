"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import * as React from "react";

import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-6 w-10.5 shrink-0 cursor-pointer items-center rounded-full border border-line-strong bg-surface-sunken outline-none transition-colors duration-150 focus-visible:ring-3 focus-visible:ring-brand-soft data-[state=checked]:border-brand data-[state=checked]:bg-brand disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-[18px] translate-x-0.5 rounded-full bg-surface-raised shadow-card transition-transform duration-150 ease-out-soft data-[state=checked]:translate-x-[20px] data-[state=checked]:bg-action-ink" />
    </SwitchPrimitive.Root>
  );
}

/** Interruptor com rótulo e explicação, ocupando a linha inteira. */
export function LinhaComInterruptor({
  id,
  titulo,
  descricao,
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  id: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-md border border-line bg-surface-raised px-3.5 py-3",
        className,
      )}
    >
      <label htmlFor={id} className="flex min-w-0 cursor-pointer flex-col">
        <span className="text-sm font-semibold">{titulo}</span>
        {descricao ? <span className="text-xs text-ink-muted">{descricao}</span> : null}
      </label>
      <Switch id={id} {...props} />
    </div>
  );
}
