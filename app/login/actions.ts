"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { criarClienteDoServidor } from "@/lib/supabase/server";

const entrada = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha."),
  proximo: z.string().optional(),
  lembrar: z.string().optional(),
});

export type EstadoDoLogin = { erro?: string };

export async function entrar(
  _anterior: EstadoDoLogin,
  dados: FormData,
): Promise<EstadoDoLogin> {
  const analise = entrada.safeParse({
    email: dados.get("email"),
    senha: dados.get("senha"),
    proximo: dados.get("proximo") ?? undefined,
    lembrar: dados.get("lembrar") ?? undefined,
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Confira os campos." };
  }

  const supabase = await criarClienteDoServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: analise.data.email,
    password: analise.data.senha,
  });

  if (error) {
    // Mensagem única de propósito: dizer que o e-mail existe mas a senha está
    // errada entrega quem tem conta para quem estiver tentando descobrir.
    return { erro: "E-mail ou senha incorretos. Tente de novo." };
  }

  // "Lembrar de mim" desmarcado: o login acabou de gravar o cookie de sessão
  // com a validade padrão (persiste entre reinícios do navegador). Regrava
  // os mesmos cookies sem validade, virando cookie de sessão, apagado ao
  // fechar o navegador. Precisa ser depois do signIn, que é quem os cria.
  if (!analise.data.lembrar) {
    const armazemDeCookies = await cookies();
    for (const cookie of armazemDeCookies.getAll()) {
      if (cookie.name.startsWith("sb-")) {
        armazemDeCookies.set(cookie.name, cookie.value);
      }
    }
  }

  // Só aceita caminho interno, senão vira redirecionamento para fora.
  const proximo = analise.data.proximo;
  const destino = proximo && proximo.startsWith("/") && !proximo.startsWith("//") ? proximo : "/";

  redirect(destino);
}
