import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { PainelDeFrequencia } from "@/components/calendario/painel-de-frequencia";
import { carregarFrequenciaDoVoluntario } from "@/lib/calendario-dados";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await criarClienteDoServidor();
  const { data } = await supabase.from("perfis").select("nome").eq("id", id).maybeSingle();
  return { title: data?.nome ?? "Pessoa" };
}

/**
 * Painel de presença do voluntário. Ainda não existe uma página de perfil
 * completa por pessoa: esta tela nasce só para hospedar a frequência
 * (Spec 0005) e cresce quando essa página existir de verdade.
 */
export default async function PerfilDaPessoa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const eu = await exigirPessoaLogada();
  if (!eu.isAdmin) notFound();

  const supabase = await criarClienteDoServidor();
  const [{ data: pessoa }, frequencia] = await Promise.all([
    supabase.from("perfis").select("nome, email").eq("id", id).maybeSingle(),
    carregarFrequenciaDoVoluntario(id),
  ]);

  if (!pessoa) notFound();

  return (
    <>
      <CabecalhoDaPagina
        titulo={pessoa.nome}
        voltar={{ href: "/pessoas", rotulo: "Pessoas e acessos" }}
        descricao={pessoa.email}
      />
      <CorpoDaPagina>
        <PainelDeFrequencia frequencia={frequencia} />
      </CorpoDaPagina>
    </>
  );
}
