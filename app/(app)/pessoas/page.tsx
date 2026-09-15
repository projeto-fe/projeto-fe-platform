import type { Metadata } from "next";
import { Mail, ScrollText, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { CabecalhoDaPagina, CorpoDaPagina } from "@/components/shell/cabecalho-da-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardHeading,
  CardNota,
  CardTitle,
} from "@/components/ui/card";
import { Confirmacao } from "@/components/ui/confirmacao";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Iniciais } from "@/components/ui/iniciais";
import { Linha, LinhaTexto, Lista } from "@/components/ui/lista";
import { Tabela, type Coluna } from "@/components/ui/tabela";
import { exigirPessoaLogada } from "@/lib/sessao";
import { criarClienteDoServidor } from "@/lib/supabase/server";

import { alternarAcesso, cancelarConvite } from "./actions";
import { ConvidarDialogo } from "./convite";

export const metadata: Metadata = {
  title: "Pessoas e acessos",
  description: "Quem entra no portal, com que papel, e o registro do que foi feito.",
};

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

function plural(n: number, um: string, varios: string) {
  return `${n} ${n === 1 ? um : varios}`;
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
    supabase.from("areas").select("id, nome").eq("ativo", true).eq("tipo", "area").order("nome"),
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

  const listaDeAreas = areas.data ?? [];
  const nomeDaArea = new Map(listaDeAreas.map((a) => [a.id, a.nome]));
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
  const comAcesso = pessoas.filter((p) => p.ativo).length;

  const pendentes = convites.data ?? [];
  const registros = auditoria.data ?? [];

  const colunas: Coluna<Pessoa>[] = [
    {
      chave: "pessoa",
      cabecalho: "Pessoa",
      conteudo: (p) => (
        <span className="flex items-center gap-3">
          <Iniciais nome={p.nome} tom={p.is_admin ? "marca" : "neutro"} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-semibold">{p.nome}</span>
            <span className="truncate text-xs text-ink-muted">{p.email}</span>
          </span>
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
          <span className="text-ink-muted">Sem área</span>
        ) : (
          <span className="text-xs text-ink-muted">{p.vinculos.join(", ")}</span>
        ),
    },
    {
      chave: "situacao",
      cabecalho: "Situação",
      escondeNoCelular: true,
      conteudo: (p) =>
        p.ativo ? (
          <Badge variant="positive" ponto>
            Ativo
          </Badge>
        ) : (
          <Badge variant="negative" ponto>
            Sem acesso
          </Badge>
        ),
    },
    {
      chave: "acao",
      cabecalho: "",
      numerica: true,
      largura: "8rem",
      conteudo: (p) =>
        p.id === eu.id ? (
          <span className="text-xs text-ink-muted">Você</span>
        ) : p.ativo ? (
          <Confirmacao
            titulo={`Desativar acesso de ${p.nome}?`}
            descricao="A pessoa perde o acesso na próxima requisição. Você pode reativar depois."
            rotuloConfirmar="Desativar acesso"
            perigoso
            acao={alternarAcesso}
            campos={{ usuario_id: p.id, ativar: "nao" }}
            mensagemDeSucesso="Acesso desativado."
          >
            <Button variant="ghost" size="sm">
              Desativar
            </Button>
          </Confirmacao>
        ) : (
          <Confirmacao
            titulo={`Reativar acesso de ${p.nome}?`}
            descricao="A pessoa volta a entrar no portal com a mesma conta e os mesmos vínculos de área."
            rotuloConfirmar="Reativar acesso"
            acao={alternarAcesso}
            campos={{ usuario_id: p.id, ativar: "sim" }}
            mensagemDeSucesso="Acesso reativado."
          >
            <Button variant="ghost" size="sm">
              Reativar
            </Button>
          </Confirmacao>
        ),
    },
  ];

  return (
    <>
      <CabecalhoDaPagina
        titulo="Pessoas e acessos"
        descricao="Quem entra no portal e o que cada pessoa faz. Ninguém cria conta sozinho: só por convite."
        acao={<ConvidarDialogo areas={listaDeAreas} />}
      />

      <CorpoDaPagina>
        <Card>
          <CardHeader>
            <CardHeading>
              <CardTitle>Equipe</CardTitle>
              <CardDescription>
                {plural(pessoas.length, "pessoa", "pessoas")}, {comAcesso} com acesso
              </CardDescription>
            </CardHeading>
          </CardHeader>
          <Tabela
            colunas={colunas}
            linhas={pessoas}
            chaveDaLinha={(p) => p.id}
            legenda="Equipe com acesso ao portal"
            vazio={
              <EstadoVazio
                compacto
                icone={ShieldCheck}
                titulo="Nenhuma pessoa cadastrada"
                descricao="A equipe aparece aqui assim que alguém aceitar um convite."
              />
            }
          />
          <CardNota>Cadastro aberto está desligado: toda conta nasce de um convite.</CardNota>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <Card>
            <CardHeader>
              <CardTitle>Convites pendentes</CardTitle>
              <Badge variant="neutral">{pendentes.length}</Badge>
            </CardHeader>

            {pendentes.length === 0 ? (
              <EstadoVazio
                compacto
                icone={Mail}
                titulo="Nenhum convite pendente"
                descricao="Convites enviados e ainda não aceitos aparecem aqui, com a validade."
                acao={
                  <ConvidarDialogo
                    areas={listaDeAreas}
                    gatilho={
                      <Button variant="outline" size="sm">
                        Convidar pessoa
                      </Button>
                    }
                  />
                }
              />
            ) : (
              <Lista className="border-t border-line">
                {pendentes.map((c) => {
                  const expirado = new Date(c.expira_em) < new Date();
                  const papel = c.papel === "coordenador" ? "Coordenação" : "Voluntário";
                  const area = c.area_id ? nomeDaArea.get(c.area_id) : null;
                  return (
                    <Linha key={c.id}>
                      <LinhaTexto
                        principal={c.email}
                        secundario={[papel, area, expirado ? "expirado" : `vale até ${quando(c.expira_em)}`]
                          .filter(Boolean)
                          .join(" · ")}
                      />
                      {expirado ? (
                        <Badge variant="negative" ponto>
                          Expirado
                        </Badge>
                      ) : null}
                      <Confirmacao
                        titulo="Cancelar este convite?"
                        descricao="O link do e-mail deixa de funcionar. Você pode convidar de novo depois."
                        rotuloConfirmar="Cancelar convite"
                        perigoso
                        acao={cancelarConvite}
                        campos={{ convite_id: c.id }}
                        mensagemDeSucesso="Convite cancelado."
                      >
                        <Button variant="ghost" size="sm">
                          Cancelar
                        </Button>
                      </Confirmacao>
                    </Linha>
                  );
                })}
              </Lista>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registro de atividade</CardTitle>
              <Badge variant="neutral">Últimos 30</Badge>
            </CardHeader>

            {registros.length === 0 ? (
              <EstadoVazio
                compacto
                icone={ScrollText}
                titulo="Nada registrado ainda"
                descricao="Convites, acessos e alterações sensíveis ficam gravados aqui, com quem fez e quando."
              />
            ) : (
              <Lista className="border-t border-line">
                {registros.map((registro) => {
                  const ator = registro.ator_id ? nomeDaPessoa.get(registro.ator_id) : undefined;
                  const detalhe = registro.detalhe
                    ? Object.values(registro.detalhe as Record<string, unknown>).join(" · ")
                    : registro.entidade;
                  return (
                    <Linha key={registro.id} className="items-start py-3">
                      {ator ? (
                        <Iniciais nome={ator} tamanho="sm" />
                      ) : (
                        <span
                          className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-sunken text-ink-subtle"
                          aria-hidden
                        >
                          <ShieldCheck className="size-3.5" />
                        </span>
                      )}
                      <LinhaTexto
                        principal={`${ator ?? "Sistema"} ${registro.acao}`}
                        secundario={`${detalhe} · ${quando(registro.criado_em)}`}
                      />
                      {registro.sensivel ? (
                        <Badge variant="warning" ponto>
                          Sensível
                        </Badge>
                      ) : null}
                    </Linha>
                  );
                })}
              </Lista>
            )}

            <CardNota>
              O registro é gravado pelo servidor e ninguém consegue alterá-lo ou apagá-lo, nem
              administradores.
            </CardNota>
          </Card>
        </div>
      </CorpoDaPagina>
    </>
  );
}
