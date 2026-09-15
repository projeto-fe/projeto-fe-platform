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
import { Paginacao } from "@/components/ui/paginacao";
import { Tabela, type Coluna } from "@/components/ui/tabela";
import { caminhoFotoDaCrianca, urlDaFoto } from "@/lib/fotos";
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

const POR_PAGINA = 30;

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
  searchParams: Promise<{ busca?: string; atividade?: string; situacao?: string; pagina?: string }>;
}) {
  const pessoa = await exigirPessoaLogada();
  const { busca, atividade, situacao, pagina } = await searchParams;
  const supabase = await criarClienteDoServidor();
  const { atividades: atividadesDoCadastro, podeVerSensiveis } = await dadosDoCadastro();

  const termo = busca?.trim();
  const verSituacao = situacao === "inativas" || situacao === "todas" ? situacao : "ativas";
  const filtrando = Boolean(termo || atividade || verSituacao !== "ativas");
  const paginaAtual = Math.max(1, Number(pagina) || 1);
  const inicio = (paginaAtual - 1) * POR_PAGINA;

  // O filtro por atividade precisa dos ids antes da consulta principal:
  // não dá para descrever "inscrita numa atividade" só com colunas de
  // `criancas`. Sem isto, filtrar e paginar juntos exigiria trazer a
  // tabela inteira para filtrar na memória, que é exatamente o que a
  // paginação existe para evitar.
  let idsDaAtividade: string[] | null = null;
  if (atividade) {
    const inscritos = await supabase
      .from("crianca_atividades")
      .select("crianca_id")
      .eq("atividade_id", atividade);
    idsDaAtividade = (inscritos.data ?? []).map((i) => i.crianca_id);
  }

  let consultaPrincipal = supabase
    .from("criancas")
    .select("id, nome_completo, data_nascimento, tem_problema_saude, observacao_saude, ativo", {
      count: "exact",
    });

  if (verSituacao === "ativas") consultaPrincipal = consultaPrincipal.eq("ativo", true);
  else if (verSituacao === "inativas") consultaPrincipal = consultaPrincipal.eq("ativo", false);
  if (termo) consultaPrincipal = consultaPrincipal.ilike("nome_completo", `%${termo}%`);
  if (idsDaAtividade) {
    consultaPrincipal = consultaPrincipal.in(
      "id",
      idsDaAtividade.length > 0 ? idsDaAtividade : ["00000000-0000-0000-0000-000000000000"],
    );
  }

  const [criancasResposta, atividadesResposta, totalGeralResposta, totalAtivasResposta] =
    await Promise.all([
      consultaPrincipal.order("nome_completo").range(inicio, inicio + POR_PAGINA - 1),
      supabase.from("areas").select("id, nome").eq("tipo", "atividade").eq("ativo", true).order("nome"),
      supabase.from("criancas").select("id", { count: "exact", head: true }),
      supabase.from("criancas").select("id", { count: "exact", head: true }).eq("ativo", true),
    ]);

  const criancasDaPagina = criancasResposta.data ?? [];
  const idsDaPagina = criancasDaPagina.map((c) => c.id);

  const [inscricoesResposta, pontuadas] = await Promise.all([
    idsDaPagina.length > 0
      ? supabase.from("crianca_atividades").select("crianca_id, atividade_id").in("crianca_id", idsDaPagina)
      : Promise.resolve({ data: [] as { crianca_id: string; atividade_id: string }[] }),
    idsDaPagina.length > 0
      ? supabase.from("pontuacao_eventos").select("crianca_id").in("crianca_id", idsDaPagina)
      : Promise.resolve({ data: [] as { crianca_id: string }[] }),
  ]);

  const nomeDaAtividade = new Map((atividadesResposta.data ?? []).map((a) => [a.id, a.nome]));

  const atividadesPorCrianca = new Map<string, string[]>();
  for (const inscricao of inscricoesResposta.data ?? []) {
    const nome = nomeDaAtividade.get(inscricao.atividade_id);
    if (!nome) continue;
    const lista = atividadesPorCrianca.get(inscricao.crianca_id) ?? [];
    lista.push(nome);
    atividadesPorCrianca.set(inscricao.crianca_id, lista);
  }

  const comPontuacao = new Set((pontuadas.data ?? []).map((e) => e.crianca_id));

  const linhas: LinhaDeCrianca[] = criancasDaPagina.map((c) => ({
    ...c,
    atividades: atividadesPorCrianca.get(c.id) ?? [],
    temPontuacao: comPontuacao.has(c.id),
  }));

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
            <Iniciais nome={linha.nome_completo} foto={urlDaFoto(caminhoFotoDaCrianca(linha.id))} />
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

  const totalGeral = totalGeralResposta.count ?? 0;
  const totalAtivas = totalAtivasResposta.count ?? 0;
  const totalFiltrado = criancasResposta.count ?? 0;
  const totalDePaginas = Math.max(1, Math.ceil(totalFiltrado / POR_PAGINA));

  const descricao =
    totalGeral === 0
      ? "Nenhuma criança cadastrada ainda."
      : filtrando
        ? `${totalFiltrado} ${totalFiltrado === 1 ? "criança" : "crianças"} neste filtro, de ${totalAtivas} ${totalAtivas === 1 ? "ativa" : "ativas"}`
        : `${totalAtivas} ${totalAtivas === 1 ? "criança ativa" : "crianças ativas"}`;

  function hrefDaPagina(pagina: number) {
    const parametros = new URLSearchParams();
    if (busca) parametros.set("busca", busca);
    if (atividade) parametros.set("atividade", atividade);
    if (situacao) parametros.set("situacao", situacao);
    if (pagina > 1) parametros.set("pagina", String(pagina));
    const query = parametros.toString();
    return query ? `/criancas?${query}` : "/criancas";
  }

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
          <Paginacao paginaAtual={paginaAtual} totalDePaginas={totalDePaginas} criarHref={hrefDaPagina} />
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
