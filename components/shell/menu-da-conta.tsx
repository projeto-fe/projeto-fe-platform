"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronsUpDown, LogOut, UserCog } from "lucide-react";
import Link from "next/link";

import { sair } from "@/app/(app)/conta/actions";

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function MenuDaConta({ nome, papel }: { nome: string; papel: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left transition-colors hover:bg-surface-sunken">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-inverse font-display text-[0.625rem] font-semibold text-ink-inverse">
          {iniciais(nome)}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold">{nome}</span>
          <span className="block truncate text-xs text-ink-muted">{papel}</span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-ink-subtle" aria-hidden />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="top"
          align="start"
          sideOffset={6}
          className="z-50 min-w-56 rounded-md border border-line bg-surface-raised p-1 shadow-pop"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/conta"
              className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-semibold outline-none data-highlighted:bg-surface-sunken"
            >
              <UserCog className="size-4 text-ink-subtle" aria-hidden />
              Minha conta
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-line" />

          <DropdownMenu.Item asChild>
            <form action={sair}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-sm font-semibold text-negative-strong outline-none data-highlighted:bg-negative-soft"
              >
                <LogOut className="size-4" aria-hidden />
                Sair
              </button>
            </form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
