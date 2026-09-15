"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * O cadastro redireciona para a lista com `?salvo=<id>`. Este componente
 * transforma isso num aviso e limpa o parâmetro, para que recarregar a
 * página não repita a mensagem.
 */
export function AvisoDeSalvo() {
  const parametros = useSearchParams();
  const router = useRouter();
  const salvo = parametros.get("salvo");

  useEffect(() => {
    if (!salvo) return;
    toast.success("Cadastro salvo.");
    const novos = new URLSearchParams(parametros.toString());
    novos.delete("salvo");
    const resto = novos.toString();
    router.replace(resto ? `/criancas?${resto}` : "/criancas");
  }, [salvo, parametros, router]);

  return null;
}
