import { Loader2 } from "lucide-react";

/**
 * Cai sobre o conteúdo de qualquer página do portal enquanto ela busca dado
 * no servidor. A barra lateral e a barra do celular continuam de pé: só o
 * miolo pisca, porque são eles que já estão montados e não dependem da
 * navegação atual.
 */
export default function Carregando() {
  return (
    <div className="grid flex-1 place-items-center py-24">
      <Loader2 className="size-6 animate-spin text-ink-subtle" aria-label="Carregando" />
    </div>
  );
}
