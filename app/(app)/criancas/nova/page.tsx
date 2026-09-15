import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";

import { dadosDoCadastro } from "../dados";
import { FormularioDaCrianca } from "../formulario";

export const metadata: Metadata = {
  title: "Nova criança",
  description: "Cadastro de uma criança no Instituto Projeto Fé.",
};

export default async function NovaCrianca() {
  const { atividades, podeVerSensiveis } = await dadosDoCadastro();

  return (
    <>
      <CabecalhoDaPagina
        titulo="Nova criança"
        voltar={{ href: "/criancas", rotulo: "Crianças" }}
        descricao={
          podeVerSensiveis
            ? "Todos os dados ficam restritos à equipe."
            : "Cadastro básico; endereço e contato ficam com a coordenação."
        }
      />
      <CorpoDaPagina>
        <FormularioDaCrianca atividades={atividades} podeVerSensiveis={podeVerSensiveis} />
      </CorpoDaPagina>
    </>
  );
}
