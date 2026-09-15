"use client";

import { AlertCircle } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Ajuda, AvisoDoFormulario, Rotulo, estiloDeControle } from "@/components/ui/campo";

import { salvarNome, type EstadoDaConta } from "./actions";

const inicial: EstadoDaConta = {};

export function FormularioDeNome({ nome }: { nome: string }) {
  const [estado, acao, salvando] = useActionState(salvarNome, inicial);

  useEffect(() => {
    if (estado.sucesso) toast.success("Nome atualizado.");
  }, [estado]);

  return (
    <form action={acao} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Rotulo htmlFor="nome">Nome</Rotulo>
        <input
          id="nome"
          name="nome"
          defaultValue={nome}
          required
          maxLength={80}
          autoComplete="name"
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-nome" : "ajuda-nome"}
          className={estiloDeControle}
        />
        <Ajuda id="ajuda-nome">É assim que a equipe vai ver você no portal.</Ajuda>
      </div>

      {estado.erro ? (
        <AvisoDoFormulario id="erro-nome" tom="erro" icone={<AlertCircle />}>
          {estado.erro}
        </AvisoDoFormulario>
      ) : null}

      <Button type="submit" loading={salvando} className="self-start">
        Salvar nome
      </Button>
    </form>
  );
}
