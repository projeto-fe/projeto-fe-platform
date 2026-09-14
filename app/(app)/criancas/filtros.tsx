"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex h-10 min-w-48 flex-1 items-center gap-2 rounded-sm border border-line bg-surface-raised px-3">
        <Search className="size-4 shrink-0 text-ink-subtle" aria-hidden />
        <input
          type="search"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar por nome ou nome de jogador"
          aria-label="Buscar criança"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <select
        value={atividade ?? ""}
        onChange={(e) => trocarAtividade(e.target.value)}
        aria-label="Filtrar por atividade"
        className="h-10 cursor-pointer rounded-sm border border-line bg-surface-raised px-2.5 text-sm font-semibold"
      >
        <option value="">Todas as atividades</option>
        {atividades.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
