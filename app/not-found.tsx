import Link from "next/link";

import { Logo } from "@/components/marca/logo";
import { Button } from "@/components/ui/button";

export default function NaoEncontrada() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <Logo />
        <div className="flex flex-col gap-2">
          <p className="font-display text-4xl font-semibold tracking-tight">Página não encontrada</p>
          <p className="text-sm text-ink-muted">
            O endereço pode ter mudado ou o registro foi removido. Volte ao início e siga pelo menu.
          </p>
        </div>
        <Button asChild>
          <Link href="/">Ir para o início</Link>
        </Button>
      </div>
    </main>
  );
}
