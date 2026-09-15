"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Diálogo para tarefa curta que merece foco: criar uma área, convidar uma
 * pessoa, vincular alguém. No celular sobe do rodapé como uma folha; no
 * desktop centraliza. Tarefa longa (cadastro de criança) tem página própria.
 */
export const Dialogo = DialogPrimitive.Root;
export const DialogoGatilho = DialogPrimitive.Trigger;
export const DialogoFechar = DialogPrimitive.Close;

export function DialogoConteudo({
  className,
  children,
  largura = "md",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { largura?: "sm" | "md" | "lg" }) {
  const larguras = { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-2xl" };

  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] animate-esmaecer" />
      <DialogPrimitive.Content
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-xl border border-line bg-surface-raised shadow-modal outline-none animate-deslizar-de-baixo",
          "sm:inset-x-auto sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg sm:animate-surgir",
          larguras[largura],
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Fechar"
          className="absolute top-3.5 right-3.5 grid size-8 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogoCabecalho({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 px-5 pt-5 pr-14", className)} {...props} />;
}

export function DialogoTitulo({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold tracking-tight", className)} {...props} />;
}

export function DialogoDescricao({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-ink-muted", className)} {...props} />;
}

export function DialogoCorpo({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex-1 overflow-y-auto px-5 py-5", className)} {...props} />;
}

export function DialogoRodape({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-line bg-surface px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}
