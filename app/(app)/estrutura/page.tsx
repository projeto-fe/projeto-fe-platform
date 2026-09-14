import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { carregarEstrutura } from "@/lib/estrutura";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { Arvore, FormularioDeNo } from "./arvore";

export const metadata: Metadata = { title: "Estrutura" };

export default async function Estrutura() {
  const pessoa = await exigirPessoaLogada();
  const supabase = await criarClienteDoServidor();

  const [raizes, equipe] = await Promise.all([
    carregarEstrutura(),
    supabase.from("perfis").select("id, nome").eq("ativo", true).order("nome"),
  ]);

  const areas = raizes.filter((no) => no.tipo === "area").map((no) => ({ id: no.id, nome: no.nome }));

  return (
    <>
      <CabecalhoDaPagina titulo="Estrutura" />

      <CorpoDaPagina>
        <p className="max-w-[70ch] text-sm text-ink-muted">
          Área reúne atividades, e é na atividade que a criança se inscreve. O papel de cada
          pessoa vale dentro da área: quem coordena uma pode ser voluntário em outra.
        </p>

        {pessoa.isAdmin ? <FormularioDeNo areas={areas} /> : null}

        <Arvore raizes={raizes} pessoas={equipe.data ?? []} podeEditar={pessoa.isAdmin} />
      </CorpoDaPagina>
    </>
  );
}
