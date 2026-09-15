import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { carregarEstrutura, listarAreas } from "@/lib/estrutura";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { Arvore } from "./arvore";
import { NovoNoDialogo } from "./dialogos";

export const metadata: Metadata = {
  title: "Estrutura",
  description: "Áreas, atividades e quem coordena ou é voluntário em cada uma.",
};

export default async function Estrutura() {
  const pessoa = await exigirPessoaLogada();
  const supabase = await criarClienteDoServidor();

  const [raizes, equipe] = await Promise.all([
    carregarEstrutura(),
    supabase.from("perfis").select("id, nome").eq("ativo", true).order("nome"),
  ]);

  const areas = listarAreas(raizes);

  return (
    <>
      <CabecalhoDaPagina
        titulo="Estrutura"
        descricao="Área reúne atividades, e é na atividade que a criança se inscreve. O papel de cada pessoa vale dentro da área."
        acao={pessoa.isAdmin ? <NovoNoDialogo areas={areas} /> : undefined}
      />

      <CorpoDaPagina>
        <Arvore raizes={raizes} pessoas={equipe.data ?? []} areas={areas} podeEditar={pessoa.isAdmin} />
      </CorpoDaPagina>
    </>
  );
}
