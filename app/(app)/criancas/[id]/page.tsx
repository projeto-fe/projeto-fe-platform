import type { Metadata } from "next";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { dadosDaCrianca } from "../dados";
import { FormularioDaCrianca } from "../formulario";

/**
 * O nome da criança vira o nome da aba. Com três cadastros abertos lado a
 * lado, "Editar criança" três vezes não ajuda ninguém.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await criarClienteDoServidor();
  const { data } = await supabase
    .from("criancas")
    .select("nome_completo")
    .eq("id", id)
    .maybeSingle();

  return {
    title: data?.nome_completo ?? "Cadastro da criança",
    description: "Cadastro, atividades e dados de contato da criança.",
  };
}

export default async function EditarCrianca({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { valores, atividades, podeVerSensiveis } = await dadosDaCrianca(id);

  return (
    <>
      <CabecalhoDaPagina
        titulo={valores.nome_completo ?? "Cadastro da criança"}
        voltar={{ href: "/criancas", rotulo: "Crianças" }}
        descricao={
          podeVerSensiveis
            ? "Todos os dados ficam restritos à equipe."
            : "Cadastro básico; endereço e contato ficam com a coordenação."
        }
      />
      <CorpoDaPagina>
        <FormularioDaCrianca
          valores={valores}
          atividades={atividades}
          podeVerSensiveis={podeVerSensiveis}
        />
      </CorpoDaPagina>
    </>
  );
}
