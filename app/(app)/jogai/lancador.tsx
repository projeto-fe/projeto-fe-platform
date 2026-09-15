"use client";

import { AlertCircle, Loader2, Star } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario, CampoSelecao, CampoTexto, GradeDeCampos } from "@/components/ui/campo";
import { BotaoDeDitado } from "@/components/ui/campo-de-ditado";
import {
  Dialogo,
  DialogoAviso,
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
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { cn } from "@/lib/utils";

import { lancarPonto, type EstadoDoLancamento } from "./actions";
import { identificarLancamento, type SugestaoDeLancamento } from "./ditado-ia";

const inicial: EstadoDoLancamento = {};

type Fase = "ditando" | "processando" | "revisando";

export type Motivo = { id: string; rotulo: string; valor: number };

type Props = {
  criancas: { id: string; nome_completo: string }[];
  motivos: Motivo[];
  atividades: { id: string; nome: string }[];
};

/**
 * Lançar ponto é a ação característica da tela, então mora no botão de marca
 * do cabeçalho e abre em diálogo. A tela embaixo continua mostrando ranking e
 * histórico, que é o que a equipe consulta entre um lançamento e outro.
 */
export function BotaoDeLancarPonto({ criancas, motivos, atividades }: Props) {
  const [aberto, setAberto] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [motivoEscolhido, setMotivoEscolhido] = React.useState("");
  const [textoDitado, setTextoDitado] = React.useState("");
  const [fase, setFase] = React.useState<Fase>("ditando");
  const [sugestao, setSugestao] = React.useState<SugestaoDeLancamento | null>(null);

  const concluir = React.useCallback(() => {
    setAberto(false);
    formRef.current?.reset();
    setMotivoEscolhido("");
    setTextoDitado("");
    setFase("ditando");
    setSugestao(null);
  }, []);

  async function aoPararDeOuvir(textoFinal: string) {
    setTextoDitado(textoFinal);

    if (!textoFinal.trim()) {
      setSugestao(null);
      setMotivoEscolhido("");
      setFase("revisando");
      return;
    }

    setFase("processando");
    const resultado = await identificarLancamento(textoFinal, { criancas, atividades, motivos });
    setSugestao(resultado);
    setMotivoEscolhido(resultado.motivoId ?? "");
    setFase("revisando");
  }

  function inserirManualmente() {
    setSugestao(null);
    setMotivoEscolhido("");
    setFase("revisando");
  }

  function ditarDeNovo() {
    setFase("ditando");
    setSugestao(null);
    setMotivoEscolhido("");
  }

  const { estado, enviar, enviando } = useAcaoEmDialogo(lancarPonto, inicial, concluir);
  const dictou = textoDitado.trim().length > 0;

  const semCrianca = criancas.length === 0;
  const semMotivo = motivos.length === 0;
  const podeLancar = !semCrianca && !semMotivo;

  return (
    <Dialogo open={aberto} onOpenChange={setAberto}>
      <DialogoGatilho asChild>
        <Button variant="brand">
          <Star aria-hidden />
          Lançar ponto
        </Button>
      </DialogoGatilho>

      <DialogoConteudo largura="lg">
        {podeLancar ? (
          <form ref={formRef} onSubmit={enviar} className="flex min-h-0 flex-1 flex-col">
            <DialogoCabecalho>
              <DialogoTitulo>Lançar ponto</DialogoTitulo>
              <DialogoDescricao>
                O valor vem do catálogo, igual para todo mundo. O lançamento fica registrado em seu
                nome, com data e motivo.
              </DialogoDescricao>
            </DialogoCabecalho>

            <DialogoCorpo className="flex flex-col gap-5">
              {fase === "ditando" ? (
                <div className="flex flex-col items-center gap-3 rounded-md border border-line bg-surface-sunken p-5">
                  <BotaoDeDitado aoTranscrever={setTextoDitado} aoParar={aoPararDeOuvir} />
                  <Button type="button" variant="ghost" size="sm" onClick={inserirManualmente}>
                    Inserir manualmente
                  </Button>
                </div>
              ) : null}

              {fase === "processando" ? (
                <div className="flex flex-col items-center gap-3 rounded-md border border-line bg-surface-sunken p-8">
                  <Loader2 aria-hidden className="size-6 animate-spin text-brand-ink" />
                  <span className="text-sm font-semibold text-ink">
                    Identificando criança, atividade e motivo...
                  </span>
                </div>
              ) : null}

              {fase === "revisando" ? (
                <>
                  {textoDitado ? (
                    <CampoTexto
                      id="texto_ditado"
                      rotulo="Você disse"
                      ajuda="Confira se o texto ficou certo. Ele não escolhe nada sozinho até você confirmar embaixo."
                      value={textoDitado}
                      onChange={(evento) => setTextoDitado(evento.target.value)}
                    />
                  ) : null}

                  {sugestao?.erro ? (
                    <AvisoDoFormulario tom="atencao">{sugestao.erro}</AvisoDoFormulario>
                  ) : null}

                  <GradeDeCampos>
                    <CampoSelecao
                      id="crianca_id"
                      name="crianca_id"
                      rotulo="Criança"
                      colunas={atividades.length > 0 ? 7 : 12}
                      obrigatorio
                      placeholder="Escolher criança"
                      defaultValue={sugestao?.criancaId ?? ""}
                      ajuda={
                        sugestao?.criancaId
                          ? "Identificado pelo que você disse."
                          : dictou
                            ? "Não identificado no texto. Escolha manualmente."
                            : undefined
                      }
                      opcoes={criancas.map((c) => ({ value: c.id, label: c.nome_completo }))}
                    />

                    {atividades.length > 0 ? (
                      <CampoSelecao
                        id="atividade_id"
                        name="atividade_id"
                        rotulo="Durante qual atividade"
                        colunas={5}
                        defaultValue={sugestao?.atividadeId ?? ""}
                        ajuda={
                          sugestao?.atividadeId ? "Identificado pelo que você disse." : undefined
                        }
                        opcoes={[
                          { value: "", label: "Não informar" },
                          ...atividades.map((a) => ({ value: a.id, label: a.nome })),
                        ]}
                      />
                    ) : null}
                  </GradeDeCampos>

                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-sm font-semibold text-ink">
                      Motivo
                      {!sugestao?.motivoId && dictou ? (
                        <span className="ml-2 font-normal text-ink-muted">
                          Não identificado, escolha um
                        </span>
                      ) : null}
                    </legend>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {motivos.map((motivo) => {
                        const escolhido = motivo.id === motivoEscolhido;
                        const positivo = motivo.valor > 0;

                        return (
                          <label
                            key={motivo.id}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 transition-colors duration-150 has-focus-visible:ring-3 has-focus-visible:ring-brand-soft",
                              escolhido
                                ? "border-brand bg-brand-soft"
                                : "border-line bg-surface-raised hover:bg-surface-sunken",
                            )}
                          >
                            <input
                              type="radio"
                              name="motivo_id"
                              value={motivo.id}
                              checked={escolhido}
                              onChange={() => setMotivoEscolhido(motivo.id)}
                              className="sr-only"
                            />
                            <span
                              className={cn(
                                "min-w-11 rounded-md px-2 py-1 text-center text-md font-semibold",
                                positivo
                                  ? "bg-positive-soft text-positive-strong"
                                  : "bg-negative-soft text-negative-strong",
                              )}
                            >
                              {positivo ? "+" : ""}
                              {motivo.valor}
                            </span>
                            <span className="text-sm font-semibold">{motivo.rotulo}</span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <Button type="button" variant="ghost" size="sm" className="self-start" onClick={ditarDeNovo}>
                    Ditar de novo
                  </Button>
                </>
              ) : null}
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
              <Button type="submit" variant="brand" loading={enviando}>
                Lançar ponto
              </Button>
            </DialogoRodape>
          </form>
        ) : (
          <>
            <DialogoCabecalho>
              <DialogoTitulo>Lançar ponto</DialogoTitulo>
              <DialogoDescricao>Falta uma coisa antes do primeiro lançamento.</DialogoDescricao>
            </DialogoCabecalho>

            <DialogoCorpo>
              {semCrianca ? (
                <EstadoVazio
                  compacto
                  icone={Star}
                  titulo="Ainda não há crianças para pontuar"
                  descricao="Cadastre a primeira criança e os motivos do catálogo aparecem aqui prontos para lançar."
                  acao={
                    <Button asChild>
                      <Link href="/criancas/nova">Cadastrar criança</Link>
                    </Button>
                  }
                />
              ) : (
                <EstadoVazio
                  compacto
                  icone={Star}
                  titulo="Nenhum motivo no catálogo"
                  descricao="Os motivos de pontuação são cadastrados no banco. Fale com a administração para ativar o catálogo."
                />
              )}
            </DialogoCorpo>
          </>
        )}
      </DialogoConteudo>
    </Dialogo>
  );
}
