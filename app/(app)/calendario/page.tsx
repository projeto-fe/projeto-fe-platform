import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Card, CardNota } from "@/components/ui/card";
import { dataReferenciaDoParametro, intervaloDaSemana, intervaloDoMes, paraIso } from "@/lib/calendario";
import { carregarAgendaInternaEntre } from "@/lib/calendario-dados";
import { carregarEstrutura, listarAtividades } from "@/lib/estrutura";
import { exigirPessoaLogada } from "@/lib/sessao";

import { CalendarioInterativo } from "./calendario-interativo";

export const metadata: Metadata = {
  title: "Calendário",
  description: "Cronograma de todas as atividades do Instituto Projeto Fé.",
};

export default async function Calendario({
  searchParams,
}: {
  searchParams: Promise<{ visao?: string; data?: string }>;
}) {
  const { visao: visaoParam, data } = await searchParams;
  const visao = visaoParam === "semana" || visaoParam === "dia" ? visaoParam : "mes";
  const referencia = dataReferenciaDoParametro(data);

  const pessoa = await exigirPessoaLogada();
  const podeCriar = pessoa.isAdmin || pessoa.coordenaAlgumaArea;

  const { inicio, fim } =
    visao === "dia"
      ? { inicio: referencia, fim: referencia }
      : visao === "semana"
        ? intervaloDaSemana(referencia)
        : intervaloDoMes(referencia);

  const [agendaMapa, atividades] = await Promise.all([
    carregarAgendaInternaEntre(inicio, fim),
    podeCriar ? listarAtividades(await carregarEstrutura()) : Promise.resolve([]),
  ]);

  return (
    <>
      <CabecalhoDaPagina
        titulo="Calendário"
        descricao={
          podeCriar
            ? "Clique num dia (ou horário) para agendar uma atividade já cadastrada."
            : "Cronograma de todas as atividades. Clique numa atividade do dia para fazer a chamada."
        }
      />
      <CorpoDaPagina>
        <Card className="p-4">
          <CalendarioInterativo
            visao={visao}
            referenciaIso={paraIso(referencia)}
            agenda={Object.fromEntries(agendaMapa)}
            atividades={atividades}
            podeCriar={podeCriar}
          />
        </Card>
        {podeCriar ? (
          <CardNota>
            Criar aqui só agenda uma atividade que já existe. Atividade nova, com nome e área, se
            cadastra em Estrutura.
          </CardNota>
        ) : null}
      </CorpoDaPagina>
    </>
  );
}
