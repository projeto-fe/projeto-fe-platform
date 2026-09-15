import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { carregarEstrutura, listarAtividades } from "@/lib/estrutura";
import { exigirPessoaLogada } from "@/lib/sessao";

import { FormularioDaCrianca } from "../formulario";

export const metadata: Metadata = { title: "Nova criança" };

export default async function NovaCrianca() {
  const pessoa = await exigirPessoaLogada();
  const atividades = listarAtividades(await carregarEstrutura());
  const veSensiveis = pessoa.isAdmin || pessoa.coordenaAlgumaArea;

  return (
    <>
      <CabecalhoDaPagina
        titulo="Nova criança"
        voltar={{ href: "/criancas", rotulo: "Crianças" }}
        descricao={
          veSensiveis
            ? "Todos os dados ficam restritos à equipe."
            : "Cadastro básico; endereço e contato ficam com a coordenação."
        }
      />
      <CorpoDaPagina>
        <FormularioDaCrianca atividades={atividades} podeVerSensiveis={veSensiveis} />
      </CorpoDaPagina>
    </>
  );
}
