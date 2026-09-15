import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Users } from "lucide-react";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { LinhaDePresenca } from "./linha-de-presenca";

type Status = "presente" | "falta" | "falta_justificada";

function dataFormatada(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ atividadeId: string; data: string }>;
}): Promise<Metadata> {
  const { data } = await params;
  return { title: `Chamada de ${data}` };
}

export default async function ChamadaDaAtividade({
  params,
}: {
  params: Promise<{ atividadeId: string; data: string }>;
}) {
  const { atividadeId, data } = await params;
  await exigirPessoaLogada();
  const supabase = await criarClienteDoServidor();

  const atividade = await supabase
    .from("areas")
    .select("id, nome, parent_id")
    .eq("id", atividadeId)
    .eq("tipo", "atividade")
    .maybeSingle();

  if (!atividade.data) notFound();

  const area = atividade.data.parent_id
    ? await supabase.from("areas").select("nome").eq("id", atividade.data.parent_id).maybeSingle()
    : null;

  const ancestrais = await supabase.rpc("areas_ancestrais", { alvo: atividadeId });
  const idsDeArea = (ancestrais.data ?? []).map((a: { area_id: string }) => a.area_id);

  const [inscricoes, vinculos, chamada] = await Promise.all([
    supabase
      .from("crianca_atividades")
      .select("crianca_id, criancas!inner(id, nome_completo, ativo)")
      .eq("atividade_id", atividadeId)
      .eq("criancas.ativo", true),
    idsDeArea.length > 0
      ? supabase.from("area_membros").select("usuario_id, perfis!inner(id, nome, ativo)").in("area_id", idsDeArea)
      : Promise.resolve({ data: [] as { usuario_id: string; perfis: { id: string; nome: string; ativo: boolean } }[] }),
    supabase.from("chamadas").select("id").eq("atividade_id", atividadeId).eq("data", data).maybeSingle(),
  ]);

  const presencas = chamada.data
    ? await supabase.from("presencas").select("crianca_id, usuario_id, status").eq("chamada_id", chamada.data.id)
    : { data: [] };

  const statusPorCrianca = new Map<string, Status>();
  const statusPorUsuario = new Map<string, Status>();
  for (const p of presencas.data ?? []) {
    if (p.crianca_id) statusPorCrianca.set(p.crianca_id, p.status);
    if (p.usuario_id) statusPorUsuario.set(p.usuario_id, p.status);
  }

  const criancas = (inscricoes.data ?? [])
    .map((i) => {
      const c = Array.isArray(i.criancas) ? i.criancas[0] : i.criancas;
      return c ? { id: c.id, nome: c.nome_completo } : null;
    })
    .filter((c): c is { id: string; nome: string } => c !== null)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const voluntariosVistos = new Set<string>();
  const voluntarios = (vinculos.data ?? [])
    .map((v) => {
      const p = Array.isArray(v.perfis) ? v.perfis[0] : v.perfis;
      return p && p.ativo ? { id: p.id, nome: p.nome } : null;
    })
    .filter((p): p is { id: string; nome: string } => p !== null && !voluntariosVistos.has(p.id) && voluntariosVistos.add(p.id) !== undefined)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <>
      <CabecalhoDaPagina
        titulo={`Chamada · ${atividade.data.nome}`}
        voltar={{ href: "/calendario", rotulo: "Calendário" }}
        descricao={`${area?.data?.nome ? `${area.data.nome} · ` : ""}${dataFormatada(data)}`}
      />
      <CorpoDaPagina>
        <Card>
          <CardHeader>
            <CardTitle>Crianças</CardTitle>
          </CardHeader>
          {criancas.length > 0 ? (
            <ul className="flex flex-col gap-2 p-4 pt-0">
              {criancas.map((c) => (
                <LinhaDePresenca
                  key={c.id}
                  nome={c.nome}
                  atividadeId={atividadeId}
                  data={data}
                  criancaId={c.id}
                  statusInicial={statusPorCrianca.get(c.id)}
                />
              ))}
            </ul>
          ) : (
            <EstadoVazio
              compacto
              icone={Users}
              titulo="Nenhuma criança inscrita"
              descricao="Inscreva crianças nesta atividade pelo cadastro delas."
            />
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voluntários</CardTitle>
          </CardHeader>
          {voluntarios.length > 0 ? (
            <ul className="flex flex-col gap-2 p-4 pt-0">
              {voluntarios.map((v) => (
                <LinhaDePresenca
                  key={v.id}
                  nome={v.nome}
                  atividadeId={atividadeId}
                  data={data}
                  usuarioId={v.id}
                  statusInicial={statusPorUsuario.get(v.id)}
                />
              ))}
            </ul>
          ) : (
            <EstadoVazio
              compacto
              icone={Users}
              titulo="Ninguém vinculado à área"
              descricao="Vincule voluntários e coordenação em Estrutura."
            />
          )}
        </Card>
      </CorpoDaPagina>
    </>
  );
}
