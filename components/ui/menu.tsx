"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Menu de ações de uma linha de lista.
 *
 * Existe porque a partir de três ações por linha ("editar", "desativar",
 * "excluir") botões soltos viram ruído: a tabela fica mais larga que a
 * informação e a ação perigosa fica do lado da corriqueira. Aqui a ação
 * destrutiva é a última e vem separada por um fio.
 */
export const Menu = DropdownMenu.Root;

export function MenuGatilho({
  rotulo,
  className,
  children,
}: {
  /** Para leitor de tela: "Ações de Ana Júlia". */
  rotulo: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <DropdownMenu.Trigger
      aria-label={rotulo}
      className={cn(
        "inline-grid size-8 place-items-center rounded-md text-ink-subtle outline-none transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-brand data-[state=open]:bg-surface-sunken data-[state=open]:text-ink",
        className,
      )}
    >
      {children ?? <MoreHorizontal className="size-4" aria-hidden />}
    </DropdownMenu.Trigger>
  );
}

export function MenuConteudo({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Content>) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="end"
        sideOffset={6}
        className={cn(
          "z-50 min-w-52 rounded-md border border-line bg-surface-raised p-1 shadow-pop animate-surgir",
          className,
        )}
        {...props}
      />
    </DropdownMenu.Portal>
  );
}

const estiloDoItem =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm font-semibold outline-none data-highlighted:bg-surface-sunken [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-ink-subtle";

export function MenuItem({
  className,
  perigoso = false,
  ...props
}: React.ComponentProps<typeof DropdownMenu.Item> & { perigoso?: boolean }) {
  return (
    <DropdownMenu.Item
      className={cn(
        estiloDoItem,
        perigoso &&
          "text-negative-strong data-highlighted:bg-negative-soft [&>svg]:text-negative-strong",
        className,
      )}
      {...props}
    />
  );
}

export function MenuSeparador() {
  return <DropdownMenu.Separator className="my-1 h-px bg-line" />;
}

export function MenuRotulo({ className, ...props }: React.ComponentProps<typeof DropdownMenu.Label>) {
  return (
    <DropdownMenu.Label
      className={cn("px-2.5 pt-1.5 pb-1 text-xs font-semibold text-ink-muted", className)}
      {...props}
    />
  );
}
