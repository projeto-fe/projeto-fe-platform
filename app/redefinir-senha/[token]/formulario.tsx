"use client";

import { AlertCircle } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario } from "@/components/ui/campo";
import { CampoDeSenha } from "@/components/ui/campo-de-senha";

import { redefinirSenha, type EstadoDaRedefinicao } from "./actions";

const inicial: EstadoDaRedefinicao = {};

export function FormularioDeRedefinicao({ token, email }: { token: string; email: string }) {
  const [estado, acao, enviando] = useActionState(redefinirSenha, inicial);

  return (
    <form action={acao} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} autoComplete="username" />

      <CampoDeSenha
        id="senha"
        name="senha"
        rotulo="Nova senha"
        autoComplete="new-password"
        required
        minLength={10}
        autoFocus
        ajuda="Pelo menos 10 caracteres."
      />

      <CampoDeSenha
        id="confirmacao"
        name="confirmacao"
        rotulo="Repita a nova senha"
        autoComplete="new-password"
        required
        minLength={10}
      />

      {estado.erro ? (
        <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
          {estado.erro}
        </AvisoDoFormulario>
      ) : null}

      <Button type="submit" size="lg" loading={enviando} className="mt-1 w-full">
        {enviando ? "Trocando" : "Trocar senha e entrar"}
      </Button>
    </form>
  );
}
