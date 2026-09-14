"use client";

import { AlertCircle } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { CampoDeSenha } from "@/components/ui/campo-de-senha";

import { entrar, type EstadoDoLogin } from "./actions";

const inicial: EstadoDoLogin = {};

export function FormularioDeLogin({ proximo }: { proximo?: string }) {
  const [estado, acao, enviando] = useActionState(entrar, inicial);

  return (
    <form action={acao} className="flex flex-col gap-4">
      {proximo ? <input type="hidden" name="proximo" value={proximo} /> : null}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="font-display text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-login" : undefined}
          className="h-10 rounded-sm border border-line-strong bg-surface-raised px-3 outline-none focus:border-brand focus:ring-3 focus:ring-brand-soft"
        />
      </div>

      <CampoDeSenha
        id="senha"
        name="senha"
        rotulo="Senha"
        autoComplete="current-password"
        required
        aria-invalid={estado.erro ? true : undefined}
        aria-describedby={estado.erro ? "erro-login" : undefined}
      />

      {estado.erro ? (
        <p
          id="erro-login"
          role="alert"
          className="flex items-start gap-2 rounded-sm bg-negative-soft px-3 py-2.5 text-sm text-negative-strong"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {estado.erro}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={enviando}>
        {enviando ? "Entrando" : "Entrar"}
      </Button>
    </form>
  );
}
