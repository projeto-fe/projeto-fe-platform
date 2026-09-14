import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

export default async function Inicio() {
  const pessoa = await exigirPessoaLogada();
  const supabase = await criarClienteDoServidor();

  const [criancas, voluntarios, ranking] = await Promise.all([
    supabase.from("criancas").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase.from("perfis").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase
      .from("ranking_interno")
      .select("crianca_id, nome_completo, nome_publico, pontos")
      .order("pontos", { ascending: false })
      .limit(5),
  ]);

  const totalCriancas = criancas.count ?? 0;
  const totalEquipe = voluntarios.count ?? 0;
  const topo = ranking.data ?? [];
  const maiorPontuacao = topo[0]?.pontos ?? 0;

  const primeiroNome = pessoa.nome.split(" ")[0];

  return (
    <>
      <CabecalhoDaPagina
        titulo="Início"
        acao={
          <Button asChild size="sm">
            <Link href="/criancas/nova">Nova criança</Link>
          </Button>
        }
      />

      <CorpoDaPagina>
        <p className="text-sm text-ink-muted">
          Olá, {primeiroNome}. Aqui está o resumo de hoje.
        </p>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Tile rotulo="Crianças ativas" valor={totalCriancas} />
          <Tile rotulo="Equipe" valor={totalEquipe} detalhe="com acesso ao portal" />
          <Tile rotulo="Lançamentos" valor={0} detalhe="nesta semana" />
          <Tile rotulo="Sem autorização" valor={0} detalhe="aguardando termo" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <Card>
            <CardHeader>
              <CardTitle>Ranking IDE JOGAI</CardTitle>
              <Badge variant="brand">Ano de {new Date().getFullYear()}</Badge>
              <span className="flex-1" />
              <Button asChild variant="ghost" size="sm">
                <Link href="/jogai">Ver tudo</Link>
              </Button>
            </CardHeader>

            {topo.length === 0 ? (
              <CardBody className="flex flex-col items-start gap-3">
                <p className="text-sm text-ink-muted">
                  Nenhuma criança cadastrada ainda. O ranking aparece assim que houver cadastro
                  e o primeiro ponto lançado.
                </p>
                <Button asChild size="sm">
                  <Link href="/criancas/nova">Cadastrar a primeira criança</Link>
                </Button>
              </CardBody>
            ) : (
              <div className="flex flex-col">
                {topo.map((linha, indice) => (
                  <div
                    key={linha.crianca_id}
                    className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-sunken font-display text-[0.625rem] font-semibold tabular-nums text-ink-muted">
                      {indice + 1}
                    </span>
                    <span className="min-w-0 flex-1 text-sm font-semibold">
                      {linha.nome_completo}
                      <span className="block text-xs font-normal text-ink-muted">
                        {linha.nome_publico}
                      </span>
                    </span>
                    <span className="hidden h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-surface-sunken sm:block">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{
                          width: `${maiorPontuacao > 0 ? Math.round((linha.pontos / maiorPontuacao) * 100) : 0}%`,
                        }}
                      />
                    </span>
                    <span className="w-12 shrink-0 text-right font-display text-[0.9375rem] font-semibold tabular-nums">
                      {linha.pontos}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximo passo</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              <span className="flex items-start gap-2.5">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning-strong" aria-hidden />
                <span className="text-sm">
                  <strong className="font-semibold">Monte a estrutura primeiro.</strong>
                  <span className="mt-1 block text-ink-muted">
                    Criar as áreas e atividades antes dos cadastros deixa cada criança já
                    inscrita no lugar certo.
                  </span>
                </span>
              </span>
              <Button asChild variant="outline" size="sm" className="self-start">
                <Link href="/estrutura">Abrir estrutura</Link>
              </Button>
            </CardBody>
          </Card>
        </div>
      </CorpoDaPagina>
    </>
  );
}

function Tile({
  rotulo,
  valor,
  detalhe,
}: {
  rotulo: string;
  valor: number;
  detalhe?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-line bg-surface-raised px-3.5 py-3">
      <span className="font-display text-[0.625rem] font-semibold tracking-wider text-ink-muted uppercase">
        {rotulo}
      </span>
      <span className="font-display text-2xl font-semibold tabular-nums">{valor}</span>
      {detalhe ? <span className="text-xs text-ink-muted">{detalhe}</span> : null}
    </div>
  );
}
