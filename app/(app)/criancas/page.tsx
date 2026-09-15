import type { Metadata } from "next";
import { ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardNota } from "@/components/ui/card";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Iniciais } from "@/components/ui/iniciais";
import { Tabela, type Coluna } from "@/components/ui/tabela";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { AvisoDeSalvo } from "./aviso-de-salvo";
import { Filtros } from "./filtros";

export const metadata: Metadata = { title: "Crianças" };

type LinhaDeCrianca = {
  id: string;
  nome_completo: string;
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
  searchParams: Promise<{ busca?: string; atividade?: string; salvo?: string }>;
}) {
  await exigirPessoaLogada();
  const { busca, atividade } = await searchParams;
  const supabase = await criarClienteDoServidor();

  const [criancasResposta, atividadesResposta, inscricoesResposta] = await Promise.all([
    supabase
      .from("criancas")
      .select("id, nome_completo, data_nascimento, tem_problema_saude, observacao_saude")
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

  const todas = criancasResposta.data ?? [];
  const termo = busca?.trim().toLowerCase();
  const filtrando = Boolean(termo || atividade);

  const linhas: LinhaDeCrianca[] = todas
    .map((c) => ({ ...c, atividades: atividadesPorCrianca.get(c.id) ?? [] }))
    .filter((c) => {
      if (termo && !c.nome_completo.toLowerCase().includes(termo)) return false;
      if (atividade && !idsPorAtividade.get(atividade)?.has(c.id)) return false;
      return true;
    });

  const colunas: Coluna<LinhaDeCrianca>[] = [
    {
      chave: "nome",
      cabecalho: "Criança",
      conteudo: (linha) => (
        <Link href={`/criancas/${linha.id}`} className="flex items-center gap-3 hover:text-brand-ink">
          <Iniciais nome={linha.nome_completo} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">{linha.nome_completo}</span>
            <span className="text-xs text-ink-muted">{idade(linha.data_nascimento)} anos</span>
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
          <span className="text-ink-muted">Sem inscrição</span>
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
          <Badge variant="warning" ponto>
            {linha.observacao_saude ?? "Atenção"}
          </Badge>
        ) : (
          <span className="text-ink-muted">Sem restrição</span>
        ),
    },
    {
      chave: "abrir",
      cabecalho: "",
      largura: "3rem",
      numerica: true,
      conteudo: (linha) => (
        <Link
          href={`/criancas/${linha.id}`}
          aria-label={`Abrir cadastro de ${linha.nome_completo}`}
          className="inline-grid size-8 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ),
    },
  ];

  const total = todas.length;
  const descricao =
    total === 0
      ? "Nenhuma criança cadastrada ainda."
      : filtrando
        ? `${linhas.length} de ${total} ${total === 1 ? "criança ativa" : "crianças ativas"}`
        : `${total} ${total === 1 ? "criança ativa" : "crianças ativas"}`;

  return (
    <>
      <Suspense fallback={null}>
        <AvisoDeSalvo />
      </Suspense>

      <CabecalhoDaPagina
        titulo="Crianças"
        descricao={descricao}
        acao={
          <Button asChild>
            <Link href="/criancas/nova">Nova criança</Link>
          </Button>
        }
      />

      <CorpoDaPagina>
        <Suspense fallback={null}>
          <Filtros atividades={atividadesResposta.data ?? []} busca={busca} atividade={atividade} />
        </Suspense>

        <Card>
          <Tabela
            legenda="Crianças ativas"
            colunas={colunas}
            linhas={linhas}
            chaveDaLinha={(linha) => linha.id}
            vazio={
              filtrando ? (
                <EstadoVazio
                  icone={Users}
                  titulo="Nenhuma criança com esse filtro"
                  descricao="Tente outro nome ou veja todas as atividades."
                  acao={
                    <Button asChild variant="outline" size="sm">
                      <Link href="/criancas">Limpar filtros</Link>
                    </Button>
                  }
                />
              ) : (
                <EstadoVazio
                  icone={Users}
                  titulo="Nenhuma criança cadastrada"
                  descricao="Aqui vai aparecer a lista das crianças atendidas, com idade, atividades e observação de saúde."
                  acao={
                    <Button asChild size="sm">
                      <Link href="/criancas/nova">Cadastrar a primeira criança</Link>
                    </Button>
                  }
                />
              )
            }
          />
          <CardNota>
            Endereço e telefone não aparecem nesta lista. Ficam no cadastro de cada criança,
            visíveis apenas para coordenação e administração. A condição de saúde aparece porque é
            informação de segurança durante a atividade.
          </CardNota>
        </Card>
      </CorpoDaPagina>
    </>
  );
}
