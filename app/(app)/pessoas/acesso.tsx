"use client";

import { AlertCircle, Plus, ShieldCheck, ShieldOff, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ajuda, AvisoDoFormulario, Campo, GradeDeCampos, Rotulo } from "@/components/ui/campo";
import { CampoDeSenha } from "@/components/ui/campo-de-senha";
import { Confirmacao } from "@/components/ui/confirmacao";
import {
  Dialogo,
  DialogoAviso,
  DialogoCabecalho,
  DialogoConteudo,
  DialogoCorpo,
  DialogoDescricao,
  DialogoFechar,
  DialogoRodape,
  DialogoTitulo,
  useAcaoEmDialogo,
} from "@/components/ui/dialogo";
import { Select } from "@/components/ui/select";
import {
  definirPapelNaArea,
  promoverParaAdmin,
  removerDaArea,
  revogarAdmin,
  type EstadoDoAcesso,
} from "./actions";

const inicial: EstadoDoAcesso = {};

export type Area = { id: string; nome: string };
export type Vinculo = { area_id: string; papel: "coordenador" | "voluntario" };

type Pessoa = {
  id: string;
  nome: string;
  email: string;
  isAdmin: boolean;
  ativo: boolean;
  vinculos: Vinculo[];
};

const PAPEIS = [
  { value: "voluntario", label: "Voluntário", descricao: "Cadastra crianças e lança pontos." },
  {
    value: "coordenador",
    label: "Coordenação",
    descricao: "Também vê endereço, contato e autorização.",
  },
];

/**
 * Onde o nível de acesso de alguém é definido.
 *
 * Papel vale por área (ADR 0004), então "promover" no dia a dia é trocar o
 * papel numa área, e não mexer num nível global. Administrador é a exceção:
 * é global, não tem desfazer prático e por isso fica num bloco à parte, com
 * confirmação própria.
 */
export function GerenciarAcesso({
  pessoa,
  areas,
  souEu,
  aberto,
  aoMudarAberto,
}: {
  pessoa: Pessoa;
  areas: Area[];
  souEu: boolean;
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
}) {
  const [salvando, iniciar] = React.useTransition();
  const [promovendo, setPromovendo] = React.useState(false);

  const nomeDaArea = new Map(areas.map((a) => [a.id, a.nome]));
  const semVinculo = areas.filter((a) => !pessoa.vinculos.some((v) => v.area_id === a.id));

  function trocarPapel(areaId: string, papel: string) {
    iniciar(async () => {
      const dados = new FormData();
      dados.set("usuario_id", pessoa.id);
      dados.set("area_id", areaId);
      dados.set("papel", papel);
      const resultado = await definirPapelNaArea(inicial, dados);
      if (resultado.erro) toast.error(resultado.erro);
      else if (resultado.sucesso) toast.success(resultado.sucesso);
    });
  }

  function remover(areaId: string) {
    iniciar(async () => {
      const dados = new FormData();
      dados.set("usuario_id", pessoa.id);
      dados.set("area_id", areaId);
      await removerDaArea(dados);
      toast.success(`Removido de ${nomeDaArea.get(areaId) ?? "área"}.`);
    });
  }

  return (
    <>
      <Dialogo open={aberto} onOpenChange={aoMudarAberto}>
        <DialogoConteudo largura="lg">
          <DialogoCabecalho>
            <DialogoTitulo>{pessoa.nome}</DialogoTitulo>
            <DialogoDescricao>{pessoa.email}</DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <Rotulo>Papel nas áreas</Rotulo>
                <Ajuda>
                  O papel vale dentro da área: dá para coordenar uma e ser voluntário em outra.
                </Ajuda>
              </div>

              {pessoa.vinculos.length === 0 ? (
                <p className="rounded-md bg-surface-sunken px-3.5 py-3 text-sm text-ink-muted">
                  Sem vínculo nenhum. Enquanto não tiver área, esta pessoa entra no portal mas não
                  aparece como responsável por nada.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {pessoa.vinculos.map((vinculo) => (
                    <li
                      key={vinculo.area_id}
                      className="flex flex-wrap items-center gap-2 rounded-md border border-line px-3 py-2.5"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {nomeDaArea.get(vinculo.area_id) ?? "Área removida"}
                      </span>
                      <div className="w-44">
                        <Select
                          aria-label={`Papel em ${nomeDaArea.get(vinculo.area_id) ?? "área"}`}
                          value={vinculo.papel}
                          onValueChange={(papel) => trocarPapel(vinculo.area_id, papel)}
                          disabled={salvando}
                          opcoes={PAPEIS}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remover(vinculo.area_id)}
                        disabled={salvando}
                        aria-label={`Remover de ${nomeDaArea.get(vinculo.area_id) ?? "área"}`}
                        className="grid size-8 shrink-0 place-items-center rounded-md text-ink-subtle transition-colors hover:bg-negative-soft hover:text-negative-strong disabled:opacity-50"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {semVinculo.length > 0 ? (
                <NovoVinculo
                  usuarioId={pessoa.id}
                  areas={semVinculo}
                  salvando={salvando}
                  aoVincular={trocarPapel}
                />
              ) : null}
            </section>

            <section className="flex flex-col gap-3 border-t border-line pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <Rotulo>Administrador do portal</Rotulo>
                {pessoa.isAdmin ? <Badge variant="brand">É administrador</Badge> : null}
              </div>

              <p className="text-sm leading-relaxed text-ink-muted">
                Administrador vê endereço, telefone e autorização de todas as crianças, convida
                gente, muda a estrutura e promove outros administradores. Não é um nível acima de
                coordenação: é acesso a tudo.
              </p>

              {souEu ? (
                <p className="rounded-md bg-surface-sunken px-3.5 py-3 text-sm text-ink-muted">
                  Você não altera o próprio privilégio. Peça a outro administrador.
                </p>
              ) : pessoa.isAdmin ? (
                <Confirmacao
                  titulo={`Remover privilégio de ${pessoa.nome}?`}
                  descricao="A conta continua ativa e mantém os papéis de área. Só o acesso de administrador sai."
                  rotuloConfirmar="Remover privilégio"
                  perigoso
                  acao={revogarAdmin}
                  campos={{ usuario_id: pessoa.id, nome: pessoa.nome }}
                  mensagemDeSucesso="Privilégio removido."
                >
                  <Button variant="outline" className="self-start">
                    <ShieldOff aria-hidden />
                    Remover privilégio
                  </Button>
                </Confirmacao>
              ) : (
                <Button
                  variant="outline"
                  className="self-start"
                  onClick={() => setPromovendo(true)}
                >
                  <ShieldCheck aria-hidden />
                  Promover a administrador
                </Button>
              )}
            </section>
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

      <PromoverADmin
        pessoa={pessoa}
        aberto={promovendo}
        aoMudarAberto={setPromovendo}
        aoConcluir={() => {
          setPromovendo(false);
          aoMudarAberto(false);
        }}
      />
    </>
  );
}

function NovoVinculo({
  usuarioId,
  areas,
  salvando,
  aoVincular,
}: {
  usuarioId: string;
  areas: Area[];
  salvando: boolean;
  aoVincular: (areaId: string, papel: string) => void;
}) {
  const [area, setArea] = React.useState(areas[0]?.id ?? "");
  const [papel, setPapel] = React.useState("voluntario");

  // A lista de áreas disponíveis encolhe a cada vínculo criado; sem isto o
  // select ficaria apontando para uma área que saiu das opções.
  const areaValida = areas.some((a) => a.id === area) ? area : (areas[0]?.id ?? "");

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-md bg-surface-sunken p-3">
      <div className="min-w-40 flex-1">
        <Select
          aria-label="Área"
          value={areaValida}
          onValueChange={setArea}
          opcoes={areas.map((a) => ({ value: a.id, label: a.nome }))}
        />
      </div>
      <div className="w-44">
        <Select aria-label="Papel" value={papel} onValueChange={setPapel} opcoes={PAPEIS} />
      </div>
      <Button
        type="button"
        variant="outline"
        loading={salvando}
        onClick={() => areaValida && aoVincular(areaValida, papel)}
      >
        <Plus aria-hidden />
        Vincular
      </Button>
      <input type="hidden" name="usuario_id" value={usuarioId} />
    </div>
  );
}

/**
 * A etapa extra da promoção: nome digitado e a senha de quem promove.
 *
 * O nome evita promover a linha errada de uma lista; a senha evita que um
 * computador destravado vire uma promoção. As duas são conferidas no servidor.
 */
function PromoverADmin({
  pessoa,
  aberto,
  aoMudarAberto,
  aoConcluir,
}: {
  pessoa: Pessoa;
  aberto: boolean;
  aoMudarAberto: (aberto: boolean) => void;
  aoConcluir: () => void;
}) {
  const { estado, enviar, enviando } = useAcaoEmDialogo(promoverParaAdmin, inicial, aoConcluir);

  return (
    <Dialogo open={aberto} onOpenChange={aoMudarAberto}>
      <DialogoConteudo largura="sm">
        <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="usuario_id" value={pessoa.id} />

          <DialogoCabecalho>
            <DialogoTitulo>Promover a administrador</DialogoTitulo>
            <DialogoDescricao>
              Esta é a única mudança do portal sem desfazer prático. Confirme duas vezes.
            </DialogoDescricao>
          </DialogoCabecalho>

          <DialogoCorpo className="flex flex-col gap-4">
            <ul className="flex flex-col gap-1.5 rounded-md bg-warning-soft px-3.5 py-3 text-sm text-warning-strong">
              <li>Vê endereço, telefone e autorização de todas as crianças.</li>
              <li>Convida e desativa pessoas.</li>
              <li>Muda áreas, atividades e vínculos.</li>
              <li>Promove outros administradores.</li>
            </ul>

            <GradeDeCampos>
              <Campo
                id="confirmacao"
                name="confirmacao"
                rotulo={`Digite "${pessoa.nome}" para confirmar`}
                colunas={12}
                obrigatorio
                autoComplete="off"
                placeholder={pessoa.nome}
              />
              <div className="col-span-12">
                <CampoDeSenha
                  id="senha"
                  name="senha"
                  rotulo="Sua senha"
                  ajuda="Confirma que é você, e não alguém que encontrou sua tela aberta."
                  autoComplete="current-password"
                  required
                />
              </div>
            </GradeDeCampos>
          </DialogoCorpo>

          {estado.erro ? (
            <DialogoAviso>
              <AvisoDoFormulario tom="erro" icone={<AlertCircle />}>
                {estado.erro}
              </AvisoDoFormulario>
            </DialogoAviso>
          ) : null}

          <DialogoRodape>
            <DialogoFechar asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogoFechar>
            <Button type="submit" loading={enviando}>
              Promover a administrador
            </Button>
          </DialogoRodape>
        </form>
      </DialogoConteudo>
    </Dialogo>
  );
}
