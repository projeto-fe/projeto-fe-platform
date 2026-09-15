import { criarClienteAdministrativo } from "@/lib/supabase/server";

const BUCKET = "arquivos";
const TIPOS_ACEITOS = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 20 * 1024 * 1024; // 20 MB

type ResultadoDoEnvio = { erro?: string };

/** Mesma decisão de `lib/fotos-dados.ts`: cliente administrativo, autorização em código. */
export async function enviarArquivo(caminho: string, arquivo: File): Promise<ResultadoDoEnvio> {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return { erro: "Envie um PDF, JPEG, PNG ou WEBP." };
  }
  if (arquivo.size > TAMANHO_MAXIMO) {
    return { erro: "O arquivo precisa ter no máximo 20 MB." };
  }
  if (arquivo.size === 0) {
    return { erro: "Escolha um arquivo." };
  }

  const admin = criarClienteAdministrativo();
  const { error } = await admin.storage.from(BUCKET).upload(caminho, arquivo, {
    upsert: true,
    contentType: arquivo.type,
  });

  if (error) return { erro: "Não foi possível enviar o arquivo. Tente de novo." };
  return {};
}

export async function existeArquivo(caminho: string) {
  const admin = criarClienteAdministrativo();
  const partes = caminho.split("/");
  const nome = partes.pop()!;
  const pasta = partes.join("/");

  const { data } = await admin.storage.from(BUCKET).list(pasta, { search: nome });
  return Boolean(data?.some((item) => item.name === nome));
}

/** Baixa os bytes do arquivo, para a rota que serve o download. `null` se não existir. */
export async function baixarArquivo(caminho: string) {
  const admin = criarClienteAdministrativo();
  const { data, error } = await admin.storage.from(BUCKET).download(caminho);
  if (error || !data) return null;
  return data;
}
