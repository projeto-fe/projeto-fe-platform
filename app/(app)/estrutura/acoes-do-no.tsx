"use client";

import { Pencil, RotateCcw, Trash2, UserMinus } from "lucide-react";
import * as React from "react";

import { Confirmacao } from "@/components/ui/confirmacao";
import { Menu, MenuConteudo, MenuGatilho, MenuItem, MenuSeparador } from "@/components/ui/menu";

import { alternarAtivoDoNo, excluirNo } from "./actions";
import { EditarNoDialogo } from "./dialogos";

type Area = { id: string; nome: string };

type No = {
  id: string;
  nome: string;
  tipo: "area" | "atividade";
  parent_id: string | null;
  descricao_horario: string | null;
  ativo: boolean;
  /** Área com subárea ou atividade dentro; atividade com chamada já feita. */
  temFilhosOuHistorico: boolean;
};

/**
 * Editar, desativar/reativar e excluir uma área ou atividade. Mesma forma
 * de `AcoesDaCrianca`: a ação perigosa aparece mesmo quando bloqueada, com
 * o motivo escrito (ADR 0012), em vez de sumir do menu.
 */
export function AcoesDoNo({ no, areas }: { no: No; areas: Area[] }) {
  const [editando, setEditando] = React.useState(false);
  const [alternando, setAlternando] = React.useState(false);
  const [excluindo, setExcluindo] = React.useState(false);

  const rotulo = no.tipo === "area" ? "área" : "atividade";

  return (
    <>
      <Menu>
        <MenuGatilho rotulo={`Ações de ${no.nome}`} />
        <MenuConteudo>
          <MenuItem onSelect={() => setEditando(true)}>
            <Pencil aria-hidden />
            Editar
          </MenuItem>

          <MenuItem onSelect={() => setAlternando(true)}>
            {no.ativo ? <UserMinus aria-hidden /> : <RotateCcw aria-hidden />}
            {no.ativo ? "Desativar" : "Reativar"}
          </MenuItem>

          <MenuSeparador />
          <MenuItem perigoso onSelect={() => setExcluindo(true)}>
            <Trash2 aria-hidden />
            Excluir
          </MenuItem>
        </MenuConteudo>
      </Menu>

      <EditarNoDialogo no={no} areas={areas} aberto={editando} aoMudarAberto={setEditando} />

      <Confirmacao
        aberto={alternando}
        aoMudarAberto={setAlternando}
        titulo={no.ativo ? `Desativar esta ${rotulo}?` : `Reativar esta ${rotulo}?`}
        descricao={
          no.ativo ? (
            <>
              <span className="font-semibold text-ink">{no.nome}</span> sai das listas de escolha
              (cadastro de criança, calendário) e fica marcada como desativada aqui na estrutura.
              Nada é apagado, e dá para reativar quando quiser.
            </>
          ) : (
            <>
              <span className="font-semibold text-ink">{no.nome}</span> volta a aparecer nas
              listas de escolha.
            </>
          )
        }
        rotuloConfirmar={no.ativo ? "Desativar" : "Reativar"}
        perigoso={no.ativo}
        acao={alternarAtivoDoNo}
        campos={{ id: no.id, nome: no.nome, ativar: no.ativo ? "nao" : "sim" }}
        mensagemDeSucesso={no.ativo ? `${no.tipo === "area" ? "Área" : "Atividade"} desativada.` : "Reativada."}
      />

      <Confirmacao
        aberto={excluindo}
        aoMudarAberto={setExcluindo}
        titulo={`Excluir esta ${rotulo}?`}
        descricao={
          no.temFilhosOuHistorico ? (
            no.tipo === "area" ? (
              <>
                <span className="font-semibold text-ink">{no.nome}</span> ainda tem subárea ou
                atividade dentro. Mova ou exclua elas primeiro.
              </>
            ) : (
              <>
                <span className="font-semibold text-ink">{no.nome}</span> já teve chamada feita, e
                apagar levaria a presença registrada junto. Desative em vez de excluir.
              </>
            )
          ) : (
            <>
              Apaga <span className="font-semibold text-ink">{no.nome}</span> de vez. Não dá para
              desfazer.
            </>
          )
        }
        rotuloConfirmar="Excluir"
        perigoso
        desabilitado={no.temFilhosOuHistorico}
        acao={excluirNo}
        campos={{ id: no.id, nome: no.nome }}
        mensagemDeSucesso={`${no.tipo === "area" ? "Área" : "Atividade"} excluída.`}
      />
    </>
  );
}
