"use client";

import { AlertCircle } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { CampoDeSenha } from "@/components/ui/campo-de-senha";

import { aceitarConvite, type EstadoDoAceite } from "./actions";

const inicial: EstadoDoAceite = {};

export function FormularioDeAceite({ token, email }: { token: string; email: string }) {
  const [estado, acao, enviando] = useActionState(aceitarConvite, inicial);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} autoComplete="username" />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="nome"
          className="font-display text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase"
        >
          Seu nome
        </label>
        <input
          id="nome"
          name="nome"
          required
          maxLength={80}
          autoComplete="name"
          className="h-10 rounded-sm border border-line-strong bg-surface-raised px-3 outline-none focus:border-brand focus:ring-3 focus:ring-brand-soft"
        />
        <span className="text-xs text-ink-muted">É assim que a equipe vai ver você.</span>
      </div>

      <CampoDeSenha
        id="senha"
        name="senha"
        rotulo="Senha"
        autoComplete="new-password"
        required
        minLength={10}
      />

      <CampoDeSenha
        id="confirmacao"
        name="confirmacao"
        rotulo="Repita a senha"
        autoComplete="new-password"
        required
        minLength={10}
      />

      <p className="text-xs text-ink-muted">Use pelo menos 10 caracteres.</p>

      {estado.erro ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-sm bg-negative-soft px-3 py-2.5 text-sm text-negative-strong"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {estado.erro}
        </p>
      ) : null}

      <Button type="submit" size="lg" loading={enviando}>
        {enviando ? "Criando acesso" : "Criar acesso e entrar"}
      </Button>
    </form>
  );
}
