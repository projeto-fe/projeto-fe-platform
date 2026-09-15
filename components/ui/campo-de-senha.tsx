"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Ajuda, Rotulo, estiloDeControle } from "@/components/ui/campo";
import { cn } from "@/lib/utils";

type Props = Omit<React.ComponentProps<"input">, "type"> & {
  id: string;
  rotulo: string;
  ajuda?: string;
};

/**
 * Campo de senha com alternância de visibilidade.
 *
 * Todo campo de senha do sistema passa por aqui, para que o comportamento e
 * o texto de acessibilidade sejam os mesmos em login, convite e troca de senha.
 */
export function CampoDeSenha({ id, rotulo, ajuda, className, ...props }: Props) {
  const [visivel, setVisivel] = React.useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Rotulo htmlFor={id}>{rotulo}</Rotulo>

      <div className="relative">
        <input
          id={id}
          type={visivel ? "text" : "password"}
          className={cn(estiloDeControle, "h-11 pr-11", className)}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisivel((antes) => !antes)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visivel}
          aria-controls={id}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-ink-subtle transition-colors hover:text-ink"
        >
          {visivel ? (
            <EyeOff className="size-[18px]" aria-hidden />
          ) : (
            <Eye className="size-[18px]" aria-hidden />
          )}
        </button>
      </div>

      {ajuda ? <Ajuda>{ajuda}</Ajuda> : null}
    </div>
  );
}
