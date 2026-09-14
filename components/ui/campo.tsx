import * as React from "react";

import { cn } from "@/lib/utils";

const estiloDeControle =
  "h-10 w-full rounded-sm border border-line-strong bg-surface-raised px-3 outline-none transition-colors focus:border-brand focus:ring-3 focus:ring-brand-soft disabled:bg-surface-sunken disabled:text-ink-muted read-only:bg-surface-sunken read-only:text-ink-muted";

type BaseProps = {
  id: string;
  rotulo: string;
  obrigatorio?: boolean;
  ajuda?: string;
  erro?: string;
  /** Quantas das 12 colunas o campo ocupa no desktop. */
  colunas?: 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12;
  /** No celular, ocupa metade da largura em vez da linha inteira. */
  metadeNoCelular?: boolean;
};

const larguras: Record<number, string> = {
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
  5: "md:col-span-5",
  6: "md:col-span-6",
  7: "md:col-span-7",
  8: "md:col-span-8",
  9: "md:col-span-9",
  10: "md:col-span-10",
  12: "md:col-span-12",
};

function Moldura({
  id,
  rotulo,
  obrigatorio,
  ajuda,
  erro,
  colunas = 12,
  metadeNoCelular,
  children,
}: BaseProps & { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1.5",
        metadeNoCelular ? "col-span-6" : "col-span-12",
        larguras[colunas],
      )}
    >
      <label
        htmlFor={id}
        className="font-display text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase"
      >
        {rotulo}
        {obrigatorio ? (
          <span className="text-brand" aria-label="obrigatório">
            {" *"}
          </span>
        ) : null}
      </label>

      {children}

      {erro ? (
        <span id={`${id}-erro`} role="alert" className="text-xs text-negative-strong">
          {erro}
        </span>
      ) : ajuda ? (
        <span id={`${id}-ajuda`} className="text-xs text-ink-muted">
          {ajuda}
        </span>
      ) : null}
    </div>
  );
}

function acessibilidade(id: string, erro?: string, ajuda?: string) {
  return {
    "aria-invalid": erro ? (true as const) : undefined,
    "aria-describedby": erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined,
  };
}

export function Campo({
  className,
  ...props
}: BaseProps & Omit<React.ComponentProps<"input">, "id">) {
  const { id, rotulo, obrigatorio, ajuda, erro, colunas, metadeNoCelular, ...resto } = props;

  return (
    <Moldura {...{ id, rotulo, obrigatorio, ajuda, erro, colunas, metadeNoCelular }}>
      <input
        id={id}
        required={obrigatorio}
        className={cn(estiloDeControle, className)}
        {...acessibilidade(id, erro, ajuda)}
        {...resto}
      />
    </Moldura>
  );
}

export function CampoSelecao({
  className,
  children,
  ...props
}: BaseProps & Omit<React.ComponentProps<"select">, "id">) {
  const { id, rotulo, obrigatorio, ajuda, erro, colunas, metadeNoCelular, ...resto } = props;

  return (
    <Moldura {...{ id, rotulo, obrigatorio, ajuda, erro, colunas, metadeNoCelular }}>
      <select
        id={id}
        required={obrigatorio}
        className={cn(estiloDeControle, "cursor-pointer", className)}
        {...acessibilidade(id, erro, ajuda)}
        {...resto}
      >
        {children}
      </select>
    </Moldura>
  );
}

export function CampoTexto({
  className,
  ...props
}: BaseProps & Omit<React.ComponentProps<"textarea">, "id">) {
  const { id, rotulo, obrigatorio, ajuda, erro, colunas, metadeNoCelular, ...resto } = props;

  return (
    <Moldura {...{ id, rotulo, obrigatorio, ajuda, erro, colunas, metadeNoCelular }}>
      <textarea
        id={id}
        required={obrigatorio}
        rows={3}
        className={cn(estiloDeControle, "h-auto resize-y py-2.5 text-sm", className)}
        {...acessibilidade(id, erro, ajuda)}
        {...resto}
      />
    </Moldura>
  );
}

/** Grade de 12 colunas que as telas de formulário usam. */
export function GradeDeCampos({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-12 gap-3">{children}</div>;
}

/** Bloco com título, para agrupar campos por assunto dentro do formulário. */
export function SecaoDoFormulario({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-display text-[0.9375rem] font-semibold">{titulo}</h3>
        {descricao ? <p className="text-xs text-ink-muted">{descricao}</p> : null}
      </div>
      {children}
    </section>
  );
}
