"use client";

import { Mic } from "lucide-react";
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
  network: "Sem conexão suficiente para reconhecer a fala.",
};

// Silêncio breve e parada pedida pela própria pessoa não são erro: o
// reconhecimento contínuo reinicia sozinho no primeiro caso, e no segundo a
// parada já era esperada.
const ERROS_SILENCIOSOS = new Set(["no-speech", "aborted"]);

type Props = {
  /** Chamado a cada trecho reconhecido, final ou não, com o texto acumulado até agora. */
  aoTranscrever: (texto: string) => void;
  className?: string;
};

/**
 * Botão de ditado por voz (ADR 0014). Continua ouvindo através de pausas
 * para pensar, e só para quando a própria pessoa manda, tocando de novo.
 * Some sozinho em navegador sem suporte, porque a escolha manual do motivo
 * continua sendo o caminho principal.
 */
export function BotaoDeDitado({ aoTranscrever, className }: Props) {
  const [ouvindo, setOuvindo] = React.useState(false);
  const [erro, setErro] = React.useState<string>();
  const reconhecimentoRef = React.useRef<InstanciaDeReconhecimento | null>(null);
  const deveOuvirRef = React.useRef(false);
  // Texto já finalizado de sessões anteriores: o reconhecimento reinicia
  // sozinho de tempos em tempos mesmo em modo contínuo, e cada reinício
  // começa com resultados vazios, então isso é o que evita perder o que já
  // foi dito antes do reinício.
  const textoBaseRef = React.useRef("");
  const textoFinalDaSessaoRef = React.useRef("");
  const suportado = React.useMemo(() => Boolean(obterConstrutor()), []);

  React.useEffect(() => {
    return () => {
      deveOuvirRef.current = false;
      reconhecimentoRef.current?.abort();
    };
  }, []);

  function criarReconhecimento(): InstanciaDeReconhecimento {
    const Construtor = obterConstrutor()!;
    const reconhecimento = new Construtor();
    reconhecimento.lang = "pt-BR";
    reconhecimento.continuous = true;
    reconhecimento.interimResults = true;
    reconhecimento.maxAlternatives = 1;

    reconhecimento.onresult = (evento) => {
      let final = "";
      let interino = "";
      for (let i = 0; i < evento.results.length; i++) {
        const resultado = evento.results.item(i);
        if (resultado.isFinal) final += resultado.item(0).transcript;
        else interino += resultado.item(0).transcript;
      }
      textoFinalDaSessaoRef.current = final;
      aoTranscrever([textoBaseRef.current, final, interino].filter(Boolean).join(" "));
    };

    reconhecimento.onerror = (evento) => {
      if (ERROS_SILENCIOSOS.has(evento.error)) return;
      deveOuvirRef.current = false;
      setErro(MENSAGENS_DE_ERRO[evento.error] ?? "Não foi possível ouvir. Tente de novo.");
    };

    reconhecimento.onend = () => {
      textoBaseRef.current = [textoBaseRef.current, textoFinalDaSessaoRef.current]
        .filter(Boolean)
        .join(" ");
      textoFinalDaSessaoRef.current = "";

      if (!deveOuvirRef.current) {
        setOuvindo(false);
        return;
      }

      // Alguns navegadores encerram sozinhos por timeout mesmo em modo
      // contínuo. Reinicia na hora, sem a pessoa perceber.
      const novo = criarReconhecimento();
      reconhecimentoRef.current = novo;
      novo.start();
    };

    return reconhecimento;
  }

  function alternar() {
    if (ouvindo) {
      deveOuvirRef.current = false;
      // Atualização otimista: a pessoa pediu para parar agora, a tela
      // reflete isso na hora, independente de quando o reconhecimento
      // realmente confirmar o fim (`stop` só finaliza quando o navegador
      // decide que houve silêncio, o que não acontece se o áudio não parar).
      setOuvindo(false);
      const instancia = reconhecimentoRef.current;
      instancia?.stop();
      window.setTimeout(() => {
        if (reconhecimentoRef.current === instancia) instancia?.abort();
      }, 500);
      return;
    }

    setErro(undefined);
    textoBaseRef.current = "";
    textoFinalDaSessaoRef.current = "";
    deveOuvirRef.current = true;
    const reconhecimento = criarReconhecimento();
    reconhecimentoRef.current = reconhecimento;
    reconhecimento.start();
    setOuvindo(true);
  }

  if (!suportado) return null;

  return (
    <div className="flex flex-col items-center gap-2.5 py-2">
      <button
        type="button"
        onClick={alternar}
        aria-pressed={ouvindo}
        className={cn(
          "flex size-20 items-center justify-center rounded-full border-2 transition-colors duration-150",
          ouvindo
            ? "border-negative bg-negative-soft text-negative-strong"
            : "border-brand bg-brand-soft text-brand-ink hover:bg-brand-soft-strong",
          className,
        )}
      >
        {ouvindo ? (
          <span className="flex items-end gap-1" aria-hidden>
            {[0, 150, 300, 450].map((atraso) => (
              <span
                key={atraso}
                className="h-6 w-1.5 origin-bottom animate-onda-de-voz rounded-full bg-current"
                style={{ animationDelay: `${atraso}ms` }}
              />
            ))}
          </span>
        ) : (
          <Mic aria-hidden className="size-8" />
        )}
      </button>

      <span className="text-sm font-semibold text-ink">
        {ouvindo ? "Ouvindo, toque para parar" : "Toque para ditar o que aconteceu"}
      </span>

      {erro ? <span className="text-xs text-negative-strong">{erro}</span> : null}
    </div>
  );
}
