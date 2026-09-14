import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabela, type Coluna } from "@/components/ui/tabela";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { alternarAcesso, cancelarConvite } from "./actions";
import { FormularioDeConvite } from "./convite";

export const metadata: Metadata = { title: "Pessoas e acessos" };

type Pessoa = {
  id: string;
  nome: string;
  email: string;
  is_admin: boolean;
  ativo: boolean;
  vinculos: string[];
};

function quando(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function Pessoas() {
  const eu = await exigirPessoaLogada();
  // A tela inteira é de administração. Quem não é admin não tem o que ver aqui,
  // e o banco recusaria as consultas de qualquer forma.
  if (!eu.isAdmin) notFound();

  const supabase = await criarClienteDoServidor();

  const [perfis, vinculos, areas, convites, auditoria] = await Promise.all([
    supabase.from("perfis").select("id, nome, email, is_admin, ativo").order("nome"),
    supabase.from("area_membros").select("usuario_id, area_id, papel"),
    supabase.from("areas").select("id, nome").eq("ativo", true).order("nome"),
    supabase
      .from("convites")
      .select("id, email, papel, area_id, expira_em, aceito_em, criado_em")
      .is("aceito_em", null)
      .order("criado_em", { ascending: false }),
    supabase
      .from("auditoria")
      .select("id, ator_id, acao, entidade, entidade_id, detalhe, sensivel, criado_em")
      .order("criado_em", { ascending: false })
      .limit(30),
  ]);

  const nomeDaArea = new Map((areas.data ?? []).map((a) => [a.id, a.nome]));
  const nomeDaPessoa = new Map((perfis.data ?? []).map((p) => [p.id, p.nome]));

  const vinculosPorPessoa = new Map<string, string[]>();
  for (const v of vinculos.data ?? []) {
    const lista = vinculosPorPessoa.get(v.usuario_id) ?? [];
    const papel = v.papel === "coordenador" ? "coordena" : "voluntária em";
    lista.push(`${papel} ${nomeDaArea.get(v.area_id) ?? "área removida"}`);
    vinculosPorPessoa.set(v.usuario_id, lista);
  }

  const pessoas: Pessoa[] = (perfis.data ?? []).map((p) => ({
    ...p,
    vinculos: vinculosPorPessoa.get(p.id) ?? [],
  }));

  const colunas: Coluna<Pessoa>[] = [
    {
      chave: "pessoa",
      cabecalho: "Pessoa",
      conteudo: (p) => (
        <span className="flex flex-col">
          <span className="font-semibold">{p.nome}</span>
          <span className="text-xs text-ink-muted">{p.email}</span>
        </span>
      ),
    },
    {
      chave: "papel",
      cabecalho: "Papel",
      conteudo: (p) =>
        p.is_admin ? (
          <Badge variant="brand">Administrador</Badge>
        ) : p.vinculos.length === 0 ? (
          <span className="text-ink-subtle">sem área</span>
        ) : (
          <span className="text-xs">{p.vinculos.join(", ")}</span>
        ),
    },
    {
      chave: "situacao",
      cabecalho: "Situação",
      escondeNoCelular: true,
      conteudo: (p) =>
        p.ativo ? (
          <Badge variant="positive">ativo</Badge>
        ) : (
          <Badge variant="negative">sem acesso</Badge>
        ),
    },
    {
      chave: "acao",
      cabecalho: "",
      numerica: true,
      conteudo: (p) =>
        p.id === eu.id ? (
          <span className="text-xs text-ink-subtle">você</span>
        ) : (
          <form action={alternarAcesso}>
            <input type="hidden" name="usuario_id" value={p.id} />
            <input type="hidden" name="ativar" value={p.ativo ? "nao" : "sim"} />
            <button
              type="submit"
              className="rounded-sm px-2 py-1 text-xs font-semibold text-ink-muted hover:bg-surface-sunken hover:text-ink"
            >
              {p.ativo ? "Desativar" : "Reativar"}
            </button>
          </form>
        ),
    },
  ];

  return (
    <>
      <CabecalhoDaPagina titulo="Pessoas e acessos" />

      <CorpoDaPagina>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Equipe</CardTitle>
            <span className="flex-1" />
            <Badge variant="warning">Cadastro aberto desligado</Badge>
          </CardHeader>
          <Tabela
            colunas={colunas}
            linhas={pessoas}
            chaveDaLinha={(p) => p.id}
            vazio="Nenhuma pessoa cadastrada."
          />
        </Card>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
          <div className="flex flex-col gap-4">
            <FormularioDeConvite areas={areas.data ?? []} />

            {(convites.data ?? []).length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Convites pendentes</CardTitle>
                </CardHeader>
                <ul className="flex flex-col">
                  {(convites.data ?? []).map((c) => {
                    const expirado = new Date(c.expira_em) < new Date();
                    return (
                      <li
                        key={c.id}
                        className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{c.email}</span>
                          <span className="block text-xs text-ink-muted">
                            {c.papel === "coordenador" ? "Coordenação" : "Voluntário"}
                            {c.area_id ? ` · ${nomeDaArea.get(c.area_id) ?? ""}` : ""}
                            {" · "}
                            {expirado ? "expirado" : `vale até ${quando(c.expira_em)}`}
                          </span>
                        </span>
                        {expirado ? <Badge variant="negative">expirado</Badge> : null}
                        <form action={cancelarConvite}>
                          <input type="hidden" name="convite_id" value={c.id} />
                          <button
                            type="submit"
                            className="rounded-sm px-2 py-1 text-xs font-semibold text-ink-muted hover:bg-negative-soft hover:text-negative-strong"
                          >
                            Cancelar
                          </button>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            ) : null}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registro de atividade</CardTitle>
              <span className="flex-1" />
              <Badge>últimos 30</Badge>
            </CardHeader>

            {(auditoria.data ?? []).length === 0 ? (
              <CardBody>
                <p className="text-sm text-ink-muted">Nada registrado ainda.</p>
              </CardBody>
            ) : (
              <ul className="flex flex-col">
                {(auditoria.data ?? []).map((registro) => (
                  <li
                    key={registro.id}
                    className="flex items-start gap-3 border-b border-line px-4 py-2.5 last:border-b-0"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">
                        {nomeDaPessoa.get(registro.ator_id ?? "") ?? "Sistema"} {registro.acao}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {registro.detalhe
                          ? Object.values(registro.detalhe as Record<string, unknown>).join(" · ")
                          : registro.entidade}
                        {" · "}
                        {quando(registro.criado_em)}
                      </span>
                    </span>
                    {registro.sensivel ? <Badge variant="negative">sensível</Badge> : null}
                  </li>
                ))}
              </ul>
            )}

            <CardBody className="border-t border-line">
              <p className="text-xs text-ink-muted">
                O registro é gravado pelo servidor e ninguém consegue alterá-lo ou apagá-lo,
                nem administradores.
              </p>
            </CardBody>
          </Card>
        </div>
      </CorpoDaPagina>
    </>
  );
}
