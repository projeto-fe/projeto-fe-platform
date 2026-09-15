"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, Rotulo, estiloDeControle } from "@/components/ui/campo";

import { pedirRedefinicaoDeSenha, type EstadoDoPedido } from "./actions";

const inicial: EstadoDoPedido = {};

export function FormularioDeEsqueciSenha() {
  const [estado, acao, enviando] = useActionState(pedirRedefinicaoDeSenha, inicial);

  if (estado.sucesso) {
    return (
      <AvisoDoFormulario tom="sucesso" icone={<CheckCircle2 />}>
        {estado.sucesso}
      </AvisoDoFormulario>
    );
  }

  return (
    <form action={acao} className="flex flex-col gap-4">
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
          className={`${estiloDeControle} h-11`}
        />
      </div>

      {estado.erro ? (
        <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
          {estado.erro}
        </AvisoDoFormulario>
      ) : null}

      <Button type="submit" size="lg" loading={enviando} className="mt-1 w-full">
        {enviando ? "Enviando" : "Enviar link"}
      </Button>
    </form>
  );
}
