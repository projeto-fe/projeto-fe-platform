import * as React from "react";

import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Aparência única de todo controle de texto do sistema. Quem precisa de um
 * input avulso (login, filtro) importa daqui em vez de repetir classes.
 */
export const estiloDeControle =
  "h-10 w-full min-w-0 rounded-md border border-line-strong bg-surface-raised px-3 text-base text-ink shadow-card outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:ring-3 focus:ring-brand-soft aria-invalid:border-negative aria-invalid:focus:ring-negative-soft disabled:bg-surface-sunken disabled:text-ink-muted disabled:shadow-none read-only:bg-surface-sunken read-only:shadow-none";

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

export function Rotulo({
  className,
  obrigatorio,
  children,
  htmlFor,
  ...props
}: React.ComponentProps<"label"> & { obrigatorio?: boolean }) {
  const conteudo = (
    <>
      {children}
      {obrigatorio ? (
        <span className="text-brand" aria-label="obrigatório">
          {" *"}
        </span>
      ) : null}
    </>
  );
  const classes = cn("text-sm font-semibold text-ink", className);

  // Sem controle associado (um dado só de leitura), <label> não faz sentido
  // semântico: vira texto comum com o mesmo desenho.
  if (!htmlFor) {
    return <span className={classes}>{conteudo}</span>;
  }

  return (
    <label htmlFor={htmlFor} className={classes} {...props}>
      {conteudo}
    </label>
  );
}

export function Ajuda({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("text-xs text-ink-muted", className)} {...props} />;
}

export function MensagemDeErro({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span role="alert" className={cn("text-xs font-medium text-negative-strong", className)} {...props} />
  );
}

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
      <Rotulo htmlFor={id} obrigatorio={obrigatorio}>
        {rotulo}
      </Rotulo>

      {children}

      {erro ? (
        <MensagemDeErro id={`${id}-erro`}>{erro}</MensagemDeErro>
      ) : ajuda ? (
        <Ajuda id={`${id}-ajuda`}>{ajuda}</Ajuda>
      ) : null}
    </div>
  );
}

export function acessibilidadeDoCampo(id: string, erro?: string, ajuda?: string) {
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
        {...acessibilidadeDoCampo(id, erro, ajuda)}
        {...resto}
      />
    </Moldura>
  );
}

export type OpcaoDeSelecao = { value: string; label: string; descricao?: string };

type PropsDeSelecao = BaseProps & {
  name?: string;
  opcoes: OpcaoDeSelecao[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (valor: string) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Seleção com o mesmo desenho em todo navegador. Aceita `value: ""` para
 * "nenhum", que o servidor já trata como nulo.
 */
export function CampoSelecao(props: PropsDeSelecao) {
  const {
    id,
    rotulo,
    obrigatorio,
    ajuda,
    erro,
    colunas,
    metadeNoCelular,
    name,
    opcoes,
    placeholder,
    value,
    defaultValue,
    onValueChange,
    disabled,
    className,
  } = props;

  return (
    <Moldura {...{ id, rotulo, obrigatorio, ajuda, erro, colunas, metadeNoCelular }}>
      <Select
        id={id}
        name={name}
        opcoes={opcoes}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        obrigatorio={obrigatorio}
        className={className}
        {...acessibilidadeDoCampo(id, erro, ajuda)}
      />
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
        className={cn(estiloDeControle, "h-auto min-h-24 resize-y py-2.5 leading-relaxed", className)}
        {...acessibilidadeDoCampo(id, erro, ajuda)}
        {...resto}
      />
    </Moldura>
  );
}

/** Grade de 12 colunas que as telas de formulário usam. */
export function GradeDeCampos({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("grid grid-cols-12 gap-x-4 gap-y-4", className)}>{children}</div>;
}

/**
 * Seção de formulário longo: título e explicação à esquerda, campos à
 * direita. No celular empilha. É o que deixa um cadastro de vinte campos
 * legível de uma passada só.
 */
export function SecaoDoFormulario({
  id,
  titulo,
  descricao,
  children,
}: {
  id?: string;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-titulo` : undefined}
      className="grid gap-4 border-t border-line py-6 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-8"
    >
      <div className="flex flex-col gap-1">
        <h3 id={id ? `${id}-titulo` : undefined} className="text-md font-semibold">
          {titulo}
        </h3>
        {descricao ? <p className="text-sm text-ink-muted">{descricao}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/**
 * Aviso dentro do formulário: erro do servidor ou informação de contexto.
 * Ícone à esquerda, texto que diz o que houve e o próximo passo.
 */
export function AvisoDoFormulario({
  tom = "erro",
  icone,
  className,
  children,
  ...props
}: React.ComponentProps<"p"> & { tom?: "erro" | "sucesso" | "info" | "atencao"; icone?: React.ReactNode }) {
  const tons = {
    erro: "bg-negative-soft text-negative-strong",
    sucesso: "bg-positive-soft text-positive-strong",
    atencao: "bg-warning-soft text-warning-strong",
    info: "bg-surface-sunken text-ink-muted",
  };
  return (
    <p
      role={tom === "erro" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-md px-3.5 py-3 text-sm leading-relaxed",
        tons[tom],
        className,
      )}
      {...props}
    >
      {icone ? <span className="mt-0.5 shrink-0 [&>svg]:size-4">{icone}</span> : null}
      <span className="min-w-0">{children}</span>
    </p>
  );
}
