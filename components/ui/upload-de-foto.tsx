"use client";

import { Camera, Loader2, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Iniciais } from "@/components/ui/iniciais";
import { cn } from "@/lib/utils";

type EstadoDaFoto = { erro?: string };

/**
 * Avatar com clique para trocar a foto, mais um botão para remover quando já
 * existe uma. Usado no cadastro de criança e em Minha conta.
 */
export function UploadDeFoto({
  nome,
  foto,
  campos = {},
  acaoDeEnviar,
  acaoDeRemover,
  tamanho = "lg",
}: {
  nome: string;
  foto?: string | null;
  /** Campos extras enviados junto do arquivo, ex.: `{ crianca_id: id }`. */
  campos?: Record<string, string>;
  acaoDeEnviar: (anterior: EstadoDaFoto, dados: FormData) => Promise<EstadoDaFoto>;
  acaoDeRemover: (dados: FormData) => Promise<void>;
  tamanho?: "md" | "lg";
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [enviando, iniciarEnvio] = React.useTransition();
  const [removendo, iniciarRemocao] = React.useTransition();
  // O caminho da foto não muda quando ela é trocada (upsert no mesmo lugar),
  // então sem isto o <img> já montado não pediria a imagem nova de novo: o
  // navegador só refaz a busca quando o src muda de verdade.
  const [versao, setVersao] = React.useState(0);

  function aoEscolherArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    const dados = new FormData();
    for (const [chave, valor] of Object.entries(campos)) dados.set(chave, valor);
    dados.set("foto", arquivo);

    iniciarEnvio(async () => {
      const resultado = await acaoDeEnviar({}, dados);
      if (resultado.erro) toast.error(resultado.erro);
      else {
        setVersao((v) => v + 1);
        toast.success("Foto atualizada.");
      }
    });
  }

  function remover() {
    const dados = new FormData();
    for (const [chave, valor] of Object.entries(campos)) dados.set(chave, valor);

    iniciarRemocao(async () => {
      await acaoDeRemover(dados);
      setVersao((v) => v + 1);
      toast.success("Foto removida.");
    });
  }

  const carregando = enviando || removendo;
  const tamanhoDoAvatar = tamanho === "lg" ? "size-20 text-lg" : "size-12 text-md";

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Iniciais
          nome={nome}
          foto={foto ? `${foto}${foto.includes("?") ? "&" : "?"}v=${versao}` : foto}
          className={tamanhoDoAvatar}
          tom="marca"
        />
        {carregando ? (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-surface-inverse/60">
            <Loader2 className="size-5 animate-spin text-ink-inverse" aria-hidden />
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={aoEscolherArquivo}
          className="sr-only"
          aria-label="Escolher foto"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={carregando}
            onClick={() => inputRef.current?.click()}
          >
            <Camera aria-hidden />
            {foto ? "Trocar foto" : "Adicionar foto"}
          </Button>
          {foto ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={carregando}
              onClick={remover}
              className={cn("text-ink-muted hover:bg-negative-soft hover:text-negative-strong")}
            >
              <Trash2 aria-hidden />
              Remover
            </Button>
          ) : null}
        </div>
        <span className="text-xs text-ink-muted">JPEG, PNG ou WEBP, até 4 MB.</span>
      </div>
    </div>
  );
}
