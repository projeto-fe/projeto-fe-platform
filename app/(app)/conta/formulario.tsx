"use client";

import { AlertCircle, Check } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { salvarNome, type EstadoDaConta } from "./actions";

const inicial: EstadoDaConta = {};

export function FormularioDeNome({ nome }: { nome: string }) {
  const [estado, acao, salvando] = useActionState(salvarNome, inicial);

  return (
    <form action={acao} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nome"
          className="font-display text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase"
        >
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          defaultValue={nome}
          required
          maxLength={80}
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-nome" : undefined}
          className="h-10 rounded-sm border border-line-strong bg-surface-raised px-3 outline-none focus:border-brand focus:ring-3 focus:ring-brand-soft"
        />
        <span className="text-xs text-ink-muted">
          É assim que a equipe vai ver você no portal.
        </span>
      </div>

      {estado.erro ? (
        <p
          id="erro-nome"
          role="alert"
          className="flex items-start gap-2 rounded-sm bg-negative-soft px-3 py-2 text-sm text-negative-strong"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {estado.erro}
        </p>
      ) : null}

      {estado.sucesso ? (
        <p
          role="status"
          className="flex items-center gap-2 rounded-sm bg-positive-soft px-3 py-2 text-sm text-positive-strong"
        >
          <Check className="size-4 shrink-0" aria-hidden />
          Nome atualizado.
        </p>
      ) : null}

      <Button type="submit" loading={salvando} className="self-start">
        Salvar nome
      </Button>
    </form>
  );
}
