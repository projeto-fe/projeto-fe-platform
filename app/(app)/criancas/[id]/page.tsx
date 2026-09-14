import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { carregarEstrutura, listarAtividades } from "@/lib/estrutura";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { FormularioDaCrianca } from "../formulario";

export const metadata: Metadata = { title: "Editar criança" };

export default async function EditarCrianca({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const c = crianca.data;
  const s = sensiveis.data;

  return (
    <>
      <CabecalhoDaPagina titulo={c.nome_completo} />
      <CorpoDaPagina>
        <FormularioDaCrianca
          atividades={listarAtividades(estrutura)}
          podeVerSensiveis={pessoa.isAdmin || pessoa.coordenaAlgumaArea}
          valores={{
            id: c.id,
            nome_completo: c.nome_completo,
            nome_jogador: c.nome_jogador,
            data_nascimento: c.data_nascimento,
            tem_problema_saude: c.tem_problema_saude,
            observacao_saude: c.observacao_saude,
            peso_kg: c.peso_g ? c.peso_g / 1000 : null,
            altura_m: c.altura_cm ? c.altura_cm / 100 : null,
            numero_calcado: c.numero_calcado,
            uniforme: c.uniforme,
            observacoes_gerais: c.observacoes_gerais,
            atividades: (inscricoes.data ?? []).map((i) => i.atividade_id),
            sensiveis: s ?? null,
          }}
        />
      </CorpoDaPagina>
    </>
  );
}
