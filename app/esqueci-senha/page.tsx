import type { Metadata } from "next";
import Link from "next/link";

import { CabecalhoDeEntrada, MolduraDeEntrada } from "@/components/shell/moldura-de-entrada";

import { FormularioDeEsqueciSenha } from "./formulario";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: "Peça um link para trocar a senha do seu acesso ao Portal Projeto Fé.",
  robots: { index: false },
};

export default function EsqueciSenha() {
  return (
    <MolduraDeEntrada
      titulo={
        <>
          Acontece. <span className="text-brand">Vamos resolver.</span>
        </>
      }
      frase="Informe o e-mail da sua conta e mande um link novo para trocar a senha."
    >
      <CabecalhoDeEntrada
        titulo="Esqueci minha senha"
        descricao="Enviamos um link válido por 1 hora para o e-mail da sua conta."
      />

      <FormularioDeEsqueciSenha />

      <p className="text-center text-xs text-ink-muted">
        <Link href="/login" className="font-semibold text-ink underline-offset-2 hover:underline">
          Voltar para a tela de entrada
        </Link>
      </p>
    </MolduraDeEntrada>
  );
}
