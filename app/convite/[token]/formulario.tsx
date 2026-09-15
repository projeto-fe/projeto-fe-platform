"use client";

import { AlertCircle } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Ajuda, AvisoDoFormulario, Rotulo, estiloDeControle } from "@/components/ui/campo";
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
        <Rotulo htmlFor="nome">Seu nome</Rotulo>
        <input
          id="nome"
          name="nome"
          required
          maxLength={80}
          autoComplete="name"
          autoFocus
          className={`${estiloDeControle} h-11`}
        />
        <Ajuda>É assim que a equipe vai ver você.</Ajuda>
      </div>

      <CampoDeSenha
        id="senha"
        name="senha"
        rotulo="Senha"
        autoComplete="new-password"
        required
        minLength={10}
        ajuda="Pelo menos 10 caracteres."
      />

      <CampoDeSenha
        id="confirmacao"
        name="confirmacao"
        rotulo="Repita a senha"
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
        {enviando ? "Criando acesso" : "Criar acesso e entrar"}
      </Button>
    </form>
  );
}
