"use client";

import { RotateCcw, SlidersHorizontal, UserMinus } from "lucide-react";
import * as React from "react";

import { Confirmacao } from "@/components/ui/confirmacao";
import { Menu, MenuConteudo, MenuGatilho, MenuItem, MenuSeparador } from "@/components/ui/menu";

import { GerenciarAcesso, type Area, type Vinculo } from "./acesso";
import { alternarAcesso } from "./actions";

type Props = {
  pessoa: {
    id: string;
    nome: string;
    email: string;
    isAdmin: boolean;
    ativo: boolean;
    vinculos: Vinculo[];
  };
  areas: Area[];
  souEu: boolean;
};

export function AcoesDaPessoa({ pessoa, areas, souEu }: Props) {
  const [gerenciando, setGerenciando] = React.useState(false);
  const [alternando, setAlternando] = React.useState(false);

  return (
    <>
      <Menu>
        <MenuGatilho rotulo={`Ações de ${pessoa.nome}`} />
        <MenuConteudo>
          <MenuItem onSelect={() => setGerenciando(true)}>
            <SlidersHorizontal aria-hidden />
            Gerenciar acesso
          </MenuItem>

          {souEu ? null : (
            <>
              <MenuSeparador />
              <MenuItem perigoso={pessoa.ativo} onSelect={() => setAlternando(true)}>
                {pessoa.ativo ? <UserMinus aria-hidden /> : <RotateCcw aria-hidden />}
                {pessoa.ativo ? "Desativar acesso" : "Reativar acesso"}
              </MenuItem>
            </>
          )}
        </MenuConteudo>
      </Menu>

      <GerenciarAcesso
        pessoa={pessoa}
        areas={areas}
        souEu={souEu}
        aberto={gerenciando}
        aoMudarAberto={setGerenciando}
      />

      <Confirmacao
        aberto={alternando}
        aoMudarAberto={setAlternando}
        titulo={
          pessoa.ativo ? `Desativar acesso de ${pessoa.nome}?` : `Reativar acesso de ${pessoa.nome}?`
        }
        descricao={
          pessoa.ativo
            ? "A pessoa perde o acesso na próxima requisição. Você pode reativar depois."
            : "A pessoa volta a entrar no portal com a mesma conta e os mesmos vínculos de área."
        }
        rotuloConfirmar={pessoa.ativo ? "Desativar acesso" : "Reativar acesso"}
        perigoso={pessoa.ativo}
        acao={alternarAcesso}
        campos={{ usuario_id: pessoa.id, ativar: pessoa.ativo ? "nao" : "sim" }}
        mensagemDeSucesso={pessoa.ativo ? "Acesso desativado." : "Acesso reativado."}
      />
    </>
  );
}
