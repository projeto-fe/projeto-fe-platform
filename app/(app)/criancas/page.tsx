import type { Metadata } from "next";
import { Users } from "lucide-react";
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

import { AbrirCadastro } from "./abrir-cadastro";
import { AcoesDaCrianca } from "./acoes-da-crianca";
import { dadosDoCadastro } from "./dados";
import { Filtros } from "./filtros";

export const metadata: Metadata = {
  title: "Crianças",
  description: "Quem o Instituto atende, em que atividade cada criança está inscrita e o que a equipe precisa saber durante a atividade.",
};

type LinhaDeCrianca = {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  tem_problema_saude: boolean;
  observacao_saude: string | null;
  ativo: boolean;
  atividades: string[];
  temPontuacao: boolean;
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
  searchParams: Promise<{ busca?: string; atividade?: string; situacao?: string }>;
}) {
  const pessoa = await exigirPessoaLogada();
  const { busca, atividade, situacao } = await searchParams;
  const supabase = await criarClienteDoServidor();
  const { atividades: atividadesDoCadastro, podeVerSensiveis } = await dadosDoCadastro();

  const [criancasResposta, atividadesResposta, inscricoesResposta, pontuadas] = await Promise.all([
    supabase
      .from("criancas")
      .select("id, nome_completo, data_nascimento, tem_problema_saude, observacao_saude, ativo")
      .order("nome_completo"),
    supabase.from("areas").select("id, nome").eq("tipo", "atividade").eq("ativo", true).order("nome"),
    supabase.from("crianca_atividades").select("crianca_id, atividade_id"),
    // Quem já pontuou não pode ser excluída sem levar o ranking junto, então a
    // lista precisa saber disso antes de oferecer a ação.
    supabase.from("pontuacao_eventos").select("crianca_id"),
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

  const comPontuacao = new Set((pontuadas.data ?? []).map((e) => e.crianca_id));

  const todas = criancasResposta.data ?? [];
  const ativas = todas.filter((c) => c.ativo);
  const termo = busca?.trim().toLowerCase();
  const verSituacao = situacao === "inativas" || situacao === "todas" ? situacao : "ativas";
  const filtrando = Boolean(termo || atividade || verSituacao !== "ativas");

  const linhas: LinhaDeCrianca[] = todas
    .map((c) => ({
      ...c,
      atividades: atividadesPorCrianca.get(c.id) ?? [],
      temPontuacao: comPontuacao.has(c.id),
    }))
    .filter((c) => {
      if (verSituacao === "ativas" && !c.ativo) return false;
      if (verSituacao === "inativas" && c.ativo) return false;
      if (termo && !c.nome_completo.toLowerCase().includes(termo)) return false;
      if (atividade && !idsPorAtividade.get(atividade)?.has(c.id)) return false;
      return true;
    });

  const podeDesativar = pessoa.isAdmin || pessoa.coordenaAlgumaArea;

  const colunas: Coluna<LinhaDeCrianca>[] = [
    {
      chave: "nome",
      cabecalho: "Criança",
      conteudo: (linha) => (
        <AbrirCadastro
          criancaId={linha.id}
          atividades={atividadesDoCadastro}
          podeVerSensiveis={podeVerSensiveis}
        >
          <button
            type="button"
            className="flex items-center gap-3 rounded-md text-left transition-colors hover:text-brand-ink"
          >
            <Iniciais nome={linha.nome_completo} />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold">{linha.nome_completo}</span>
              <span className="text-xs text-ink-muted">{idade(linha.data_nascimento)} anos</span>
            </span>
          </button>
        </AbrirCadastro>
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
      chave: "acoes",
      cabecalho: "",
      largura: "3rem",
      numerica: true,
      conteudo: (linha) => (
        <AcoesDaCrianca
          crianca={{
            id: linha.id,
            nome: linha.nome_completo,
            ativa: linha.ativo,
            temPontuacao: linha.temPontuacao,
          }}
          atividades={atividadesDoCadastro}
          podeVerSensiveis={podeVerSensiveis}
          podeDesativar={podeDesativar}
          podeExcluir={pessoa.isAdmin}
        />
      ),
    },
  ];

  if (verSituacao !== "ativas") {
    colunas.splice(3, 0, {
      chave: "situacao",
      cabecalho: "Situação",
      largura: "8rem",
      conteudo: (linha) =>
        linha.ativo ? (
          <Badge variant="positive" ponto>
            Ativa
          </Badge>
        ) : (
          <Badge variant="neutral">Inativa</Badge>
        ),
    });
  }

  const total = ativas.length;
  const descricao =
    todas.length === 0
      ? "Nenhuma criança cadastrada ainda."
      : filtrando
        ? `${linhas.length} ${linhas.length === 1 ? "criança" : "crianças"} neste filtro, de ${total} ${total === 1 ? "ativa" : "ativas"}`
        : `${total} ${total === 1 ? "criança ativa" : "crianças ativas"}`;

  return (
    <>
      <CabecalhoDaPagina
        titulo="Crianças"
        descricao={descricao}
        acao={
          <AbrirCadastro atividades={atividadesDoCadastro} podeVerSensiveis={podeVerSensiveis}>
            <Button>Nova criança</Button>
          </AbrirCadastro>
        }
      />

      <CorpoDaPagina>
        <Suspense fallback={null}>
          <Filtros
            atividades={atividadesResposta.data ?? []}
            busca={busca}
            atividade={atividade}
            situacao={verSituacao}
          />
        </Suspense>

        <Card>
          <Tabela
            legenda="Crianças"
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
                    <AbrirCadastro
                      atividades={atividadesDoCadastro}
                      podeVerSensiveis={podeVerSensiveis}
                    >
                      <Button size="sm">Cadastrar a primeira criança</Button>
                    </AbrirCadastro>
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
