"use client";

import { BookOpen, Upload } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AvisoDoFormulario } from "@/components/ui/campo";

import { enviarGuiaCultural } from "./actions";

/**
 * Guia cultural do Instituto: todo mundo abre e baixa, só administrador
 * troca o arquivo. Feito no Canva, exportável em PDF ou imagem — por isso
 * aceita os dois em vez de travar num formato só.
 */
export function GuiaCultural({ existe, url, podeEnviar }: { existe: boolean; url: string; podeEnviar: boolean }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [enviando, iniciar] = React.useTransition();
  const [erro, setErro] = React.useState<string>();

  function aoEscolherArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = "";
    if (!arquivo) return;

    const dados = new FormData();
    dados.set("arquivo", arquivo);
    setErro(undefined);

    iniciar(async () => {
      const resultado = await enviarGuiaCultural({}, dados);
      if (resultado.erro) setErro(resultado.erro);
      else toast.success("Guia cultural atualizado.");
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {existe ? (
        <Button asChild variant="outline" className="w-fit">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <BookOpen aria-hidden />
            Abrir guia cultural
          </a>
        </Button>
      ) : (
        <p className="text-sm text-ink-muted">
          {podeEnviar ? "Nenhum guia enviado ainda." : "A coordenação ainda não enviou o guia cultural."}
        </p>
      )}

      {podeEnviar ? (
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={aoEscolherArquivo}
            className="sr-only"
            aria-label="Escolher arquivo do guia cultural"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit"
            disabled={enviando}
            onClick={() => inputRef.current?.click()}
          >
            <Upload aria-hidden />
            {existe ? "Trocar arquivo" : "Enviar arquivo"}
          </Button>
          <span className="text-xs text-ink-muted">PDF, JPEG, PNG ou WEBP, até 20 MB.</span>
          {erro ? (
            <AvisoDoFormulario tom="erro" className="mt-1">
              {erro}
            </AvisoDoFormulario>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
