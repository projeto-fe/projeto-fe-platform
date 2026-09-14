import type { Metadata } from "next";
import Link from "next/link";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabela, type Coluna } from "@/components/ui/tabela";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { Filtros } from "./filtros";

export const metadata: Metadata = { title: "Crianças" };

type LinhaDeCrianca = {
  id: string;
  nome_completo: string;
  nome_jogador: string;
  data_nascimento: string;
  tem_problema_saude: boolean;
  observacao_saude: string | null;
  atividades: string[];
};

function idade(nascimento: string) {
  const hoje = new Date();
  const data = new Date(nascimento);
  let anos = hoje.getFullYear() - data.getFullYear();
  const mes = hoje.getMonth() - data.getMonth();
  if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) anos--;
  return anos;
}

export default async function Criancas({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; atividade?: string }>;
}) {
  await exigirPessoaLogada();
  const { busca, atividade } = await searchParams;
  const supabase = await criarClienteDoServidor();

  const [criancasResposta, atividadesResposta, inscricoesResposta] = await Promise.all([
    supabase
      .from("criancas")
      .select("id, nome_completo, nome_jogador, data_nascimento, tem_problema_saude, observacao_saude")
      .eq("ativo", true)
      .order("nome_completo"),
    supabase.from("areas").select("id, nome").eq("tipo", "atividade").eq("ativo", true).order("nome"),
    supabase.from("crianca_atividades").select("crianca_id, atividade_id"),
  ]);

  const nomeDaAtividade = new Map((atividadesResposta.data ?? []).map((a) => [a.id, a.nome]));

  const atividadesPorCrianca = new Map<string, string[]>();
  const idsPorAtividade = new Map<string, Set<string>>();
  for (const inscricao of inscricoesResposta.data ?? []) {
    const nome = nomeDaAtividade.get(inscricao.atividade_id);
    if (nome) {
      const lista = atividadesPorCrianca.get(inscricao.crianca_id) ?? [];
      lista.push(nome);
      atividadesPorCrianca.set(inscricao.crianca_id, lista);
    }
    const conjunto = idsPorAtividade.get(inscricao.atividade_id) ?? new Set<string>();
    conjunto.add(inscricao.crianca_id);
    idsPorAtividade.set(inscricao.atividade_id, conjunto);
  }

  const termo = busca?.trim().toLowerCase();
  const linhas: LinhaDeCrianca[] = (criancasResposta.data ?? [])
    .map((c) => ({ ...c, atividades: atividadesPorCrianca.get(c.id) ?? [] }))
    .filter((c) => {
      if (termo && !c.nome_completo.toLowerCase().includes(termo) && !c.nome_jogador.toLowerCase().includes(termo)) {
        return false;
      }
      if (atividade && !idsPorAtividade.get(atividade)?.has(c.id)) return false;
      return true;
    });

  const colunas: Coluna<LinhaDeCrianca>[] = [
    {
      chave: "nome",
      cabecalho: "Criança",
      conteudo: (linha) => (
        <Link href={`/criancas/${linha.id}`} className="flex flex-col hover:text-brand-ink">
          <span className="font-semibold">{linha.nome_completo}</span>
          <span className="text-xs text-ink-muted">
            {idade(linha.data_nascimento)} anos · {linha.nome_jogador}
          </span>
        </Link>
      ),
    },
    {
      chave: "atividades",
      cabecalho: "Atividades",
      escondeNoCelular: true,
      conteudo: (linha) =>
        linha.atividades.length === 0 ? (
          <span className="text-ink-subtle">sem inscrição</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {linha.atividades.map((nome) => (
              <Badge key={nome}>{nome}</Badge>
            ))}
          </span>
        ),
    },
    {
      chave: "saude",
      cabecalho: "Saúde",
      conteudo: (linha) =>
        linha.tem_problema_saude ? (
          <Badge variant="warning">{linha.observacao_saude ?? "Atenção"}</Badge>
        ) : (
          <span className="text-ink-subtle">—</span>
        ),
    },
  ];

  return (
    <>
      <CabecalhoDaPagina
        titulo="Crianças"
        acao={
          <Button asChild size="sm">
            <Link href="/criancas/nova">Nova criança</Link>
          </Button>
        }
      />

      <CorpoDaPagina>
        <Filtros atividades={atividadesResposta.data ?? []} busca={busca} atividade={atividade} />

        <Card className="overflow-hidden">
          <Tabela
            colunas={colunas}
            linhas={linhas}
            chaveDaLinha={(linha) => linha.id}
            vazio={
              termo || atividade
                ? "Nenhuma criança encontrada com esse filtro."
                : "Nenhuma criança cadastrada ainda."
            }
          />
        </Card>

        <p className="max-w-[70ch] text-xs text-ink-muted">
          Endereço e telefone não aparecem nesta lista. Ficam no cadastro de cada criança,
          visíveis apenas para coordenação e administração. A condição de saúde aparece porque é
          informação de segurança durante a atividade.
        </p>
      </CorpoDaPagina>
    </>
  );
}
