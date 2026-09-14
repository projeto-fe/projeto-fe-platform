import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { carregarEstrutura, listarAtividades } from "@/lib/estrutura";
import { exigirPessoaLogada } from "@/lib/sessao";

import { FormularioDaCrianca } from "../formulario";

export const metadata: Metadata = { title: "Nova criança" };

export default async function NovaCrianca() {
  const pessoa = await exigirPessoaLogada();
  const atividades = listarAtividades(await carregarEstrutura());

  return (
    <>
      <CabecalhoDaPagina titulo="Nova criança" />
      <CorpoDaPagina>
        <FormularioDaCrianca
          atividades={atividades}
          podeVerSensiveis={pessoa.isAdmin || pessoa.coordenaAlgumaArea}
        />
      </CorpoDaPagina>
    </>
  );
}
