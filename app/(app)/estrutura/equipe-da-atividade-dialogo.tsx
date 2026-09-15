"use client";

import { AlertCircle, UserPlus, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, CampoSelecao, GradeDeCampos } from "@/components/ui/campo";
import { Badge } from "@/components/ui/badge";
import { Confirmacao } from "@/components/ui/confirmacao";
import {
  Dialogo,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoCorpo,
  DialogoDescricao,
  DialogoFechar,
  DialogoGatilho,
  DialogoRodape,
  DialogoTitulo,
  useAcaoEmDialogo,
} from "@/components/ui/dialogo";
import { Iniciais } from "@/components/ui/iniciais";

import { desvincularPessoa, vincularPessoa, type EstadoDaEstrutura } from "./actions";

const inicial: EstadoDaEstrutura = {};

type Pessoa = { id: string; nome: string };
type Membro = { usuario_id: string; nome: string; papel: "coordenador" | "voluntario" };

/**
 * Miolo da equipe da atividade (lista + form), sem casca de diálogo: usado
 * no diálogo rápido da árvore e direto na página dedicada da atividade.
 */
export function EquipeDaAtividadeConteudo({
  atividadeId,
  atividadeNome,
  membros,
  pessoas,
}: {
  atividadeId: string;
  atividadeNome: string;
  membros: Membro[];
  pessoas: Pessoa[];
}) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const limpar = React.useCallback(() => formRef.current?.reset(), []);
  const { estado, enviar, enviando } = useAcaoEmDialogo(vincularPessoa, inicial, limpar);

  const semPessoas = pessoas.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {membros.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {membros.map((m) => (
            <li
              key={m.usuario_id}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1 pr-1.5 pl-1"
            >
              <Iniciais nome={m.nome} tamanho="sm" tom={m.papel === "coordenador" ? "marca" : "neutro"} />
              <span className="truncate text-sm font-semibold">{m.nome}</span>
              <Badge variant={m.papel === "coordenador" ? "positive" : "neutral"}>
                {m.papel === "coordenador" ? "Coordenação" : "Voluntário"}
              </Badge>
              <Confirmacao
                titulo={`Remover ${m.nome} de ${atividadeNome}?`}
                descricao="A pessoa continua com acesso ao portal, só deixa de ter papel nesta atividade."
                rotuloConfirmar="Remover vínculo"
                perigoso
                acao={desvincularPessoa}
                campos={{ usuario_id: m.usuario_id, area_id: atividadeId }}
                mensagemDeSucesso="Vínculo removido."
              >
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-6 rounded-full text-ink-subtle hover:bg-negative-soft hover:text-negative-strong"
                  aria-label={`Remover ${m.nome} de ${atividadeNome}`}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              </Confirmacao>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-muted">Ninguém vinculado direto nesta atividade ainda.</p>
      )}

      <form ref={formRef} onSubmit={enviar} className="flex flex-col gap-3 border-t border-line pt-4">
        <input type="hidden" name="area_id" value={atividadeId} />
        <GradeDeCampos>
          <CampoSelecao
            id={`pessoa-ativ-${atividadeId}`}
            name="usuario_id"
            rotulo="Pessoa"
            colunas={12}
            obrigatorio
            opcoes={pessoas.map((p) => ({ value: p.id, label: p.nome }))}
            placeholder="Escolher pessoa"
            ajuda={semPessoas ? "Convide alguém em Pessoas e acessos antes." : undefined}
            disabled={semPessoas}
          />
          <CampoSelecao
            id={`papel-ativ-${atividadeId}`}
            name="papel"
            rotulo="Papel"
            colunas={12}
            defaultValue="voluntario"
            opcoes={[
              { value: "voluntario", label: "Voluntário" },
              { value: "coordenador", label: "Coordenação" },
            ]}
          />
        </GradeDeCampos>

        {estado.erro ? (
          <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
            {estado.erro}
          </AvisoDoFormulario>
        ) : null}

        <Button type="submit" loading={enviando} variant="outline" className="self-start" disabled={semPessoas}>
          <UserPlus aria-hidden />
          Vincular
        </Button>
      </form>
    </div>
  );
}

/**
 * Vínculo de pessoa direto na atividade, não na área inteira, em diálogo
 * rápido a partir da árvore.
 */
export function EquipeDaAtividadeDialogo({
  atividadeId,
  atividadeNome,
  membros,
  pessoas,
}: {
  atividadeId: string;
  atividadeNome: string;
  membros: Membro[];
  pessoas: Pessoa[];
}) {
  const [aberto, setAberto] = React.useState(false);

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        <Button variant="ghost" size="sm">
          <UserPlus aria-hidden />
          Equipe
        </Button>
      </DialogoGatilho>

      <DialogoConteudo largura="sm">
        <DialogoCabecalho>
          <DialogoTitulo>Equipe de {atividadeNome}</DialogoTitulo>
          <DialogoDescricao>
            Vínculo aqui vale só nesta atividade, não na área inteira.
          </DialogoDescricao>
        </DialogoCabecalho>

        <DialogoCorpo>
          <EquipeDaAtividadeConteudo
            atividadeId={atividadeId}
            atividadeNome={atividadeNome}
            membros={membros}
            pessoas={pessoas}
          />
        </DialogoCorpo>

        <DialogoRodape>
          <DialogoFechar asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogoFechar>
        </DialogoRodape>
      </DialogoConteudo>
    </Dialogo>
  );
}
