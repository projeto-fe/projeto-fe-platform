import type { Metadata } from "next";
import { CheckCircle2, MailWarning, Network, Star, UserPlus, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
} from "@/components/ui/card";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { FaixaDeResumo, Indicador } from "@/components/ui/indicador";
import { Iniciais } from "@/components/ui/iniciais";
import { Barra, Linha, LinhaTexto, Lista, Numero, Posicao } from "@/components/ui/lista";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Início",
  description: "Resumo do dia: crianças ativas, equipe com acesso, pontos da semana e o que ainda falta fazer.",
};

/** Segunda-feira desta semana, 00:00 no horário local do servidor. */
function inicioDaSemana() {
  const agora = new Date();
  const diaDaSemana = (agora.getDay() + 6) % 7; // segunda = 0
  const segunda = new Date(agora);
  segunda.setDate(agora.getDate() - diaDaSemana);
  segunda.setHours(0, 0, 0, 0);
  return segunda;
}

type Passo = {
  icone: LucideIcon;
  titulo: string;
  texto: string;
  href: string;
  rotulo: string;
};

export default async function Inicio() {
  const pessoa = await exigirPessoaLogada();
  const supabase = await criarClienteDoServidor();
  const leSensiveis = pessoa.isAdmin || pessoa.coordenaAlgumaArea;

  const [criancas, equipe, ranking, lancamentosDaSemana, areas, eventos, autorizadas, convites] =
    await Promise.all([
      supabase.from("criancas").select("id", { count: "exact" }).eq("ativo", true),
      supabase.from("perfis").select("id", { count: "exact", head: true }).eq("ativo", true),
      supabase
        .from("ranking_interno")
        .select("crianca_id, nome_completo, nome_publico, pontos")
        .order("pontos", { ascending: false })
        .limit(5),
      supabase
        .from("pontuacao_eventos")
        .select("id", { count: "exact", head: true })
        .is("estorna_evento_id", null)
        .gte("lancado_em", inicioDaSemana().toISOString()),
      supabase.from("areas").select("id", { count: "exact", head: true }).eq("ativo", true),
      supabase.from("pontuacao_eventos").select("id", { count: "exact", head: true }),
      // Voluntário não recebe linha aqui: a política do banco resolve. Por isso
      // o indicador só aparece para quem lê dado sensível.
      leSensiveis
        ? supabase
            .from("criancas_dados_sensiveis")
            .select("crianca_id")
            .not("autorizacao_data", "is", null)
        : Promise.resolve({ data: [] as { crianca_id: string }[] }),
      pessoa.isAdmin
        ? supabase.from("convites").select("expira_em").is("aceito_em", null)
        : Promise.resolve({ data: [] as { expira_em: string }[] }),
    ]);

  const totalCriancas = criancas.count ?? 0;
  const totalEquipe = equipe.count ?? 0;
  const totalDaSemana = lancamentosDaSemana.count ?? 0;
  const totalAreas = areas.count ?? 0;
  const totalEventos = eventos.count ?? 0;

  const comTermo = new Set((autorizadas.data ?? []).map((a) => a.crianca_id));
  const semTermo = (criancas.data ?? []).filter((c) => !comTermo.has(c.id)).length;

  const convitesVencidos = (convites.data ?? []).filter(
    (c) => new Date(c.expira_em) < new Date(),
  ).length;

  const topo = ranking.data ?? [];
  const maiorPontuacao = topo[0]?.pontos ?? 0;
  const primeiroNome = pessoa.nome.split(" ")[0];

  const passos: Passo[] = [];
  if (pessoa.isAdmin && totalAreas === 0) {
    passos.push({
      icone: Network,
      titulo: "Monte a estrutura",
      texto: "Crie as áreas e atividades antes dos cadastros, para cada criança já entrar no lugar certo.",
      href: "/estrutura",
      rotulo: "Abrir estrutura",
    });
  }
  if (totalCriancas === 0) {
    passos.push({
      icone: UserPlus,
      titulo: "Cadastre a primeira criança",
      texto: "O cadastro básico leva um minuto. Endereço e contato podem ser completados depois.",
      href: "/criancas/nova",
      rotulo: "Nova criança",
    });
  }
  if (totalCriancas > 0 && totalEventos === 0) {
    passos.push({
      icone: Star,
      titulo: "Lance o primeiro ponto",
      texto: "O ranking do IDE JOGAI começa a existir com o primeiro lançamento.",
      href: "/jogai",
      rotulo: "Abrir IDE JOGAI",
    });
  }
  if (pessoa.isAdmin && convitesVencidos > 0) {
    passos.push({
      icone: MailWarning,
      titulo: convitesVencidos === 1 ? "Há um convite vencido" : `Há ${convitesVencidos} convites vencidos`,
      texto: "Quem não aceitou em 7 dias precisa de um convite novo para entrar.",
      href: "/pessoas",
      rotulo: "Ver convites",
    });
  }
  const pendentes = passos.slice(0, 3);

  return (
    <>
      <CabecalhoDaPagina
        titulo="Início"
        descricao={`Olá, ${primeiroNome}. Resumo de hoje.`}
        acao={
          <Button asChild>
            <Link href="/criancas/nova">Nova criança</Link>
          </Button>
        }
      />

      <CorpoDaPagina>
        <FaixaDeResumo className={cn(!leSensiveis && "lg:grid-cols-3")}>
          <Indicador
            rotulo="Crianças ativas"
            valor={totalCriancas}
            detalhe="cadastradas e ativas"
            href="/criancas"
          />
          <Indicador
            rotulo="Equipe com acesso"
            valor={totalEquipe}
            detalhe="pessoas no portal"
            href={pessoa.isAdmin ? "/pessoas" : undefined}
          />
          <Indicador
            rotulo="Pontos lançados"
            valor={totalDaSemana}
            detalhe="desde segunda"
            href="/jogai"
          />
          {leSensiveis ? (
            <Indicador
              rotulo="Sem termo de autorização"
              valor={semTermo}
              detalhe="aguardando assinatura"
              href="/criancas"
              tom="atencao"
            />
          ) : null}
        </FaixaDeResumo>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <Card>
            <CardHeader>
              <CardHeading>
                <CardTitle>Ranking IDE JOGAI</CardTitle>
                <CardDescription>Cinco primeiros do ano</CardDescription>
              </CardHeading>
              <Badge>{new Date().getFullYear()}</Badge>
              <Button asChild variant="ghost" size="sm">
                <Link href="/jogai">Ver tudo</Link>
              </Button>
            </CardHeader>

            {topo.length === 0 ? (
              <EstadoVazio
                compacto
                icone={Star}
                titulo="O ranking aparece com o primeiro ponto"
                descricao={
                  totalCriancas === 0
                    ? "Os cinco primeiros do ano ficam aqui, com a pontuação de cada criança. Comece pelos próximos passos."
                    : "As crianças já estão cadastradas. Falta lançar o primeiro ponto."
                }
                acao={
                  totalCriancas === 0 ? undefined : (
                    <Button asChild size="sm" variant="brand">
                      <Link href="/jogai">Lançar ponto</Link>
                    </Button>
                  )
                }
              />
            ) : (
              <Lista ordenada className="border-t border-line">
                {topo.map((linha, indice) => (
                  <Linha key={linha.crianca_id}>
                    <Posicao numero={indice + 1} />
                    <Iniciais nome={linha.nome_completo} tamanho="sm" />
                    <LinhaTexto principal={linha.nome_completo} secundario={linha.nome_publico} />
                    <Barra
                      proporcao={maiorPontuacao > 0 ? linha.pontos / maiorPontuacao : 0}
                      className="hidden sm:block"
                    />
                    <Numero>{linha.pontos}</Numero>
                  </Linha>
                ))}
              </Lista>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardHeading>
                <CardTitle>Próximos passos</CardTitle>
                <CardDescription>O que ainda falta para o portal rodar redondo</CardDescription>
              </CardHeading>
            </CardHeader>

            {pendentes.length === 0 ? (
              <EstadoVazio
                compacto
                icone={CheckCircle2}
                titulo="Tudo em dia"
                descricao="Estrutura montada, crianças cadastradas e pontos em movimento."
              />
            ) : (
              <Lista className="border-t border-line">
                {pendentes.map((passo) => {
                  const Icone = passo.icone;
                  return (
                    <Linha key={passo.href} className="items-start py-4">
                      <span
                        className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-ink"
                        aria-hidden
                      >
                        <Icone className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-2">
                        <span className="flex flex-col gap-0.5">
                          <span className="font-semibold">{passo.titulo}</span>
                          <span className="text-xs leading-relaxed text-ink-muted">{passo.texto}</span>
                        </span>
                        <Button asChild variant="outline" size="sm" className="self-start">
                          <Link href={passo.href}>{passo.rotulo}</Link>
                        </Button>
                      </span>
                    </Linha>
                  );
                })}
              </Lista>
            )}
          </Card>
        </div>
      </CorpoDaPagina>
    </>
  );
}
