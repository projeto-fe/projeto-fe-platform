"use client";

import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { Toaster as Sonner } from "sonner";

/**
 * Aviso de ação concluída. Uma só instância, no layout raiz, para que
 * qualquer tela dispare `toast.success("...")` e o resultado apareça igual.
 * Estilizado só com tokens: o sonner entra sem tema próprio.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      offset={20}
      mobileOffset={{ bottom: 84, left: 16, right: 16 }}
      gap={10}
      duration={3600}
      icons={{
        success: <CheckCircle2 className="size-4 text-positive-strong" aria-hidden />,
        error: <AlertCircle className="size-4 text-negative-strong" aria-hidden />,
        info: <Info className="size-4 text-ink-muted" aria-hidden />,
        loading: <Loader2 className="size-4 animate-spin text-ink-muted" aria-hidden />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-lg border border-line bg-surface-raised px-4 py-3.5 text-sm text-ink shadow-pop sm:w-90",
          title: "font-semibold",
          description: "text-xs text-ink-muted",
          icon: "mt-0.5 shrink-0",
          actionButton:
            "ml-auto h-7 shrink-0 rounded-md bg-action px-2.5 text-xs font-semibold text-action-ink",
          cancelButton:
            "ml-auto h-7 shrink-0 rounded-md bg-surface-sunken px-2.5 text-xs font-semibold text-ink",
        },
      }}
    />
  );
}
