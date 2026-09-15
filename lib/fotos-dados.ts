import { criarClienteAdministrativo } from "@/lib/supabase/server";

const BUCKET = "fotos";
const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 4 * 1024 * 1024; // 4 MB

type ResultadoDoEnvio = { erro?: string };

/**
 * Valida e grava a foto. Sempre pelo cliente administrativo: mesma decisão
 * de convite e redefinição de senha, autorização decidida em código, não em
 * RLS de `storage.objects` (o bucket é privado e sem nenhuma policy).
 *
 * `upsert` faz o novo arquivo substituir o anterior no mesmo caminho, então
 * trocar de foto nunca deixa um upload velho, em outro formato, para trás.
 */
export async function enviarFoto(caminho: string, arquivo: File): Promise<ResultadoDoEnvio> {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return { erro: "Envie uma imagem JPEG, PNG ou WEBP." };
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return { erro: "A imagem precisa ter no máximo 4 MB." };
  }
  if (arquivo.size === 0) {
    return { erro: "Escolha um arquivo de imagem." };
  }

  const admin = criarClienteAdministrativo();
  const { error } = await admin.storage.from(BUCKET).upload(caminho, arquivo, {
    upsert: true,
    contentType: arquivo.type,
  });

  if (error) return { erro: "Não foi possível enviar a foto. Tente de novo." };
  return {};
}

export async function removerFoto(caminho: string) {
  const admin = criarClienteAdministrativo();
  await admin.storage.from(BUCKET).remove([caminho]);
}

/** Baixa os bytes da foto, para a rota que serve a imagem. `null` se não existir. */
export async function baixarFoto(caminho: string) {
  const admin = criarClienteAdministrativo();
  const { data, error } = await admin.storage.from(BUCKET).download(caminho);
  if (error || !data) return null;
  return data;
}
