"use client";

import { Pencil, RotateCcw, Trash2, UserMinus } from "lucide-react";
import * as React from "react";

import { Confirmacao } from "@/components/ui/confirmacao";
import { Menu, MenuConteudo, MenuGatilho, MenuItem, MenuSeparador } from "@/components/ui/menu";

import { AbrirCadastro } from "./abrir-cadastro";
import { alternarAtivoDaCrianca, excluirCrianca } from "./actions";
import type { Atividade } from "./valores";

type Props = {
  crianca: { id: string; nome: string; ativa: boolean; temPontuacao: boolean };
  atividades: Atividade[];
  podeVerSensiveis: boolean;
  /** Desativar é decisão de coordenação; excluir, só de administração. */
  podeDesativar: boolean;
  podeExcluir: boolean;
};

/**
 * Ações de uma criança na lista.
 *
 * Cada diálogo é aberto por estado, não por gatilho: o menu desmonta ao
 * fechar, e um diálogo pendurado no item de menu fecharia junto.
 */
export function AcoesDaCrianca({
  crianca,
  atividades,
  podeVerSensiveis,
  podeDesativar,
  podeExcluir,
}: Props) {
  const [editando, setEditando] = React.useState(false);
  const [alternando, setAlternando] = React.useState(false);
  const [excluindo, setExcluindo] = React.useState(false);

  return (
    <>
      <Menu>
        <MenuGatilho rotulo={`Ações de ${crianca.nome}`} />
        <MenuConteudo>
          <MenuItem onSelect={() => setEditando(true)}>
            <Pencil aria-hidden />
            Editar cadastro
          </MenuItem>

          {podeDesativar ? (
            <MenuItem onSelect={() => setAlternando(true)}>
              {crianca.ativa ? <UserMinus aria-hidden /> : <RotateCcw aria-hidden />}
              {crianca.ativa ? "Desativar" : "Reativar"}
            </MenuItem>
          ) : null}

          {podeExcluir ? (
            <>
              <MenuSeparador />
              <MenuItem perigoso onSelect={() => setExcluindo(true)}>
                <Trash2 aria-hidden />
                Excluir cadastro
              </MenuItem>
            </>
          ) : null}
        </MenuConteudo>
      </Menu>

      <AbrirCadastro
        criancaId={crianca.id}
        atividades={atividades}
        podeVerSensiveis={podeVerSensiveis}
        aberto={editando}
        aoMudarAberto={setEditando}
      />

      <Confirmacao
        aberto={alternando}
        aoMudarAberto={setAlternando}
        titulo={crianca.ativa ? "Desativar esta criança?" : "Reativar esta criança?"}
        descricao={
          crianca.ativa ? (
            <>
              <span className="font-semibold text-ink">{crianca.nome}</span> sai das listas e dos
              lançamentos de ponto. O cadastro e a pontuação do ano continuam guardados, e dá para
              reativar depois.
            </>
          ) : (
            <>
              <span className="font-semibold text-ink">{crianca.nome}</span> volta às listas e
              pode receber pontos de novo.
            </>
          )
        }
        rotuloConfirmar={crianca.ativa ? "Desativar" : "Reativar"}
        perigoso={crianca.ativa}
        acao={alternarAtivoDaCrianca}
        campos={{
          crianca_id: crianca.id,
          nome: crianca.nome,
          ativar: crianca.ativa ? "nao" : "sim",
        }}
        mensagemDeSucesso={crianca.ativa ? "Criança desativada." : "Criança reativada."}
      />

      <Confirmacao
        aberto={excluindo}
        aoMudarAberto={setExcluindo}
        titulo="Excluir este cadastro?"
        descricao={
          crianca.temPontuacao ? (
            <>
              <span className="font-semibold text-ink">{crianca.nome}</span> já tem pontos
              lançados, e apagar o cadastro levaria esse histórico junto: o ranking do ano
              deixaria de fechar. Desative em vez de excluir.
            </>
          ) : (
            <>
              Apaga <span className="font-semibold text-ink">{crianca.nome}</span> e os dados de
              endereço e contato de vez. Não dá para desfazer. Se a criança só saiu do projeto,
              desative: o cadastro fica guardado.
            </>
          )
        }
        rotuloConfirmar="Excluir cadastro"
        perigoso
        desabilitado={crianca.temPontuacao}
        acao={excluirCrianca}
        campos={{ crianca_id: crianca.id, nome: crianca.nome }}
        mensagemDeSucesso="Cadastro excluído."
      />
    </>
  );
}
