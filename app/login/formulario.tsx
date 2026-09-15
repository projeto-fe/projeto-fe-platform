"use client";

import { AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Rotulo, estiloDeControle } from "@/components/ui/campo";
import { CampoDeSenha } from "@/components/ui/campo-de-senha";
import { Checkbox } from "@/components/ui/checkbox";

import { entrar, type EstadoDoLogin } from "./actions";

const inicial: EstadoDoLogin = {};

export function FormularioDeLogin({ proximo, aviso }: { proximo?: string; aviso?: string }) {
  const [estado, acao, enviando] = useActionState(entrar, inicial);

  return (
    <form action={acao} className="flex flex-col gap-4">
      {proximo ? <input type="hidden" name="proximo" value={proximo} /> : null}

      {aviso && !estado.erro ? (
        <AvisoDoFormulario tom="info" icone={<Info />}>
          {aviso}
        </AvisoDoFormulario>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Rotulo htmlFor="email">E-mail</Rotulo>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          autoFocus
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-login" : undefined}
          className={`${estiloDeControle} h-11`}
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

      <div className="flex items-center justify-between gap-3">
        <label htmlFor="lembrar" className="flex cursor-pointer items-center gap-2 text-sm text-ink-muted">
          <Checkbox id="lembrar" name="lembrar" value="sim" defaultChecked />
          Lembrar de mim
        </label>
        <Link
          href="/esqueci-senha"
          className="text-sm font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Esqueci minha senha
        </Link>
      </div>

      {estado.erro ? (
        <AvisoDoFormulario id="erro-login" tom="erro" icone={<AlertCircle />}>
          {estado.erro}
        </AvisoDoFormulario>
      ) : null}

      <Button type="submit" size="lg" loading={enviando} className="mt-1 w-full">
        {enviando ? "Entrando" : "Entrar"}
      </Button>
    </form>
  );
}
