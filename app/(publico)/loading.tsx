import { Loader2 } from "lucide-react";

export default function Carregando() {
  return (
    <div className="grid min-h-[50dvh] place-items-center">
      <Loader2 className="size-6 animate-spin text-brand-canvas-ink/60" aria-label="Carregando" />
    </div>
  );
}
