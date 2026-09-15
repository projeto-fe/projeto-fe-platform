import { notFound } from "next/navigation";

import { carregarEstrutura, listarAtividades } from "@/lib/estrutura";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { montarValores } from "./valores";

/**
 * O que o cadastro precisa para abrir. Fica aqui porque a lista, a página de
 * cadastro novo e a página de edição carregam exatamente o mesmo conjunto.
 */
export async function dadosDoCadastro() {
  const pessoa = await exigirPessoaLogada();
  return {
    atividades: listarAtividades(await carregarEstrutura()),
    podeVerSensiveis: pessoa.isAdmin || pessoa.coordenaAlgumaArea,
  };
}

export async function dadosDaCrianca(id: string) {
  const pessoa = await exigirPessoaLogada();
  const supabase = await criarClienteDoServidor();

  const [crianca, sensiveis, inscricoes, estrutura] = await Promise.all([
    supabase.from("criancas").select("*").eq("id", id).maybeSingle(),
    // Voluntário simplesmente não recebe linha aqui: a política do banco
    // resolve, sem a interface precisar decidir.
    supabase.from("criancas_dados_sensiveis").select("*").eq("crianca_id", id).maybeSingle(),
    supabase.from("crianca_atividades").select("atividade_id").eq("crianca_id", id),
    carregarEstrutura(),
  ]);

  if (!crianca.data) notFound();

  return {
    valores: montarValores(crianca.data, sensiveis.data, inscricoes.data ?? []),
    atividades: listarAtividades(estrutura),
    podeVerSensiveis: pessoa.isAdmin || pessoa.coordenaAlgumaArea,
  };
}
