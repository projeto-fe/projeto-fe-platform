"use client";

import { Mic, MicOff, Square } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * A API Web Speech não tem tipos oficiais no lib.dom do TypeScript (ADR
 * 0014). Este é só o subconjunto que este arquivo usa.
 */
interface ResultadoDaFala {
  readonly length: number;
  item(indice: number): { transcript: string };
  [indice: number]: { transcript: string };
  isFinal: boolean;
}

interface EventoDeResultado extends Event {
  resultIndex: number;
  results: { length: number; item(indice: number): ResultadoDaFala; [indice: number]: ResultadoDaFala };
}

interface EventoDeErro extends Event {
  error: string;
}

interface InstanciaDeReconhecimento extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((evento: EventoDeResultado) => void) | null;
  onerror: ((evento: EventoDeErro) => void) | null;
  onend: (() => void) | null;
}

type ConstrutorDeReconhecimento = new () => InstanciaDeReconhecimento;

function obterConstrutor(): ConstrutorDeReconhecimento | undefined {
  if (typeof window === "undefined") return undefined;
  const janela = window as unknown as {
    SpeechRecognition?: ConstrutorDeReconhecimento;
    webkitSpeechRecognition?: ConstrutorDeReconhecimento;
  };
  return janela.SpeechRecognition ?? janela.webkitSpeechRecognition;
}

const MENSAGENS_DE_ERRO: Record<string, string> = {
  "not-allowed": "Permita o uso do microfone para ditar.",
  "no-speech": "Não entendi nada. Tente falar de novo.",
  network: "Sem conexão suficiente para reconhecer a fala.",
};

type Props = {
  /** Chamado a cada trecho reconhecido, final ou não, com o texto acumulado até agora. */
  aoTranscrever: (texto: string) => void;
  className?: string;
};

/**
 * Botão de ditado por voz (ADR 0014). Some sozinho em navegador sem suporte,
 * porque a escolha manual do motivo continua sendo o caminho principal.
 */
export function BotaoDeDitado({ aoTranscrever, className }: Props) {
  const [ouvindo, setOuvindo] = React.useState(false);
  const [erro, setErro] = React.useState<string>();
  const reconhecimentoRef = React.useRef<InstanciaDeReconhecimento | null>(null);
  const suportado = React.useMemo(() => Boolean(obterConstrutor()), []);

  React.useEffect(() => {
    return () => reconhecimentoRef.current?.abort();
  }, []);

  function iniciar() {
    const Construtor = obterConstrutor();
    if (!Construtor) return;

    setErro(undefined);
    const reconhecimento = new Construtor();
    reconhecimento.lang = "pt-BR";
    reconhecimento.continuous = false;
    reconhecimento.interimResults = true;
    reconhecimento.maxAlternatives = 1;

    reconhecimento.onresult = (evento) => {
      let texto = "";
      for (let i = 0; i < evento.results.length; i++) {
        texto += evento.results.item(i).item(0).transcript;
      }
      aoTranscrever(texto);
    };

    reconhecimento.onerror = (evento) => {
      setErro(MENSAGENS_DE_ERRO[evento.error] ?? "Não foi possível ouvir. Tente de novo.");
      setOuvindo(false);
    };

    reconhecimento.onend = () => setOuvindo(false);

    reconhecimentoRef.current = reconhecimento;
    reconhecimento.start();
    setOuvindo(true);
  }

  function parar() {
    reconhecimentoRef.current?.stop();
  }

  if (!suportado) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={ouvindo ? parar : iniciar}
        aria-pressed={ouvindo}
        className={cn(
          "inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-150",
          ouvindo
            ? "border-negative bg-negative-soft text-negative-strong"
            : "border-line-strong bg-surface-raised text-ink hover:bg-surface-sunken",
          className,
        )}
      >
        {ouvindo ? <Square aria-hidden className="size-4" /> : <Mic aria-hidden className="size-4" />}
        {ouvindo ? "Parar de ouvir" : "Ditar o que aconteceu"}
      </button>

      {erro ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-negative-strong">
          <MicOff aria-hidden className="size-3.5" />
          {erro}
        </span>
      ) : null}
    </div>
  );
}
