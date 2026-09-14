import { Logo } from "@/components/marca/logo";

type Props = {
  titulo: string;
  /** Ação principal da tela. Fica no cabeçalho, não no corpo. */
  acao?: React.ReactNode;
};

export function CabecalhoDaPagina({ titulo, acao }: Props) {
  return (
    <header className="flex h-[60px] shrink-0 items-center gap-3 border-b border-line bg-surface-raised px-4 md:px-5">
      <span className="md:hidden">
        <Logo compacto />
      </span>
      <h1 className="font-display text-lg font-semibold">{titulo}</h1>
      <span className="flex-1" />
      {acao}
    </header>
  );
}

export function CorpoDaPagina({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-auto p-4 pb-20 md:p-5 md:pb-5">
      {children}
    </div>
  );
}
