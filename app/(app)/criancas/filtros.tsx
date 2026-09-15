"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { estiloDeControle } from "@/components/ui/campo";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function Filtros({
  atividades,
  busca,
  atividade,
}: {
  atividades: { id: string; nome: string }[];
  busca?: string;
  atividade?: string;
}) {
  const router = useRouter();
  const parametros = useSearchParams();
  const [termo, setTermo] = useState(busca ?? "");

  // Espera a digitação parar antes de navegar, senão cada tecla vira uma
  // consulta ao banco.
  useEffect(() => {
    const atual = parametros.get("busca") ?? "";
    if (termo === atual) return;

    const tempo = setTimeout(() => {
      const novos = new URLSearchParams(parametros.toString());
      if (termo) novos.set("busca", termo);
      else novos.delete("busca");
      router.replace(`/criancas?${novos.toString()}`);
    }, 350);

    return () => clearTimeout(tempo);
  }, [termo, parametros, router]);

  function trocarAtividade(valor: string) {
    const novos = new URLSearchParams(parametros.toString());
    if (valor) novos.set("atividade", valor);
    else novos.delete("atividade");
    router.replace(`/criancas?${novos.toString()}`);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div
        className={cn(
          estiloDeControle,
          "flex flex-1 items-center gap-2 px-3 focus-within:border-brand focus-within:ring-3 focus-within:ring-brand-soft",
        )}
      >
        <Search className="size-4 shrink-0 text-ink-subtle" aria-hidden />
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome"
          aria-label="Buscar criança"
          className="h-full w-full min-w-0 bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {termo ? (
          <button
            type="button"
            onClick={() => setTermo("")}
            aria-label="Limpar busca"
            className="grid size-6 shrink-0 place-items-center rounded-sm text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="sm:w-64">
        <Select
          aria-label="Filtrar por atividade"
          value={atividade ?? ""}
          onValueChange={trocarAtividade}
          opcoes={[
            { value: "", label: "Todas as atividades" },
            ...atividades.map((a) => ({ value: a.id, label: a.nome })),
          ]}
        />
      </div>
    </div>
  );
}
