import { Resend } from "resend";

import { marca, marcaNeutros } from "@/lib/brand";

/**
 * Envio de e-mail transacional.
 *
 * Enquanto RESEND_API_KEY não existir, o sistema continua funcionando: o
 * convite é criado e aparece como pendente na tela de administração, e quem
 * convidou vê que o e-mail não saiu. Falha silenciosa aqui seria pior que
 * não enviar, porque a pessoa esperaria por uma mensagem que nunca chega.
 */
export function envioConfigurado() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_REMETENTE);
}

type ResultadoDoEnvio = { enviado: boolean; motivo?: string };

export async function enviarConviteNoEmail({
  para,
  link,
  quemConvidou,
  papel,
  area,
  expiraEm,
}: {
  para: string;
  link: string;
  quemConvidou: string;
  papel: "coordenador" | "voluntario";
  area?: string;
  expiraEm: Date;
}): Promise<ResultadoDoEnvio> {
  if (!envioConfigurado()) {
    return { enviado: false, motivo: "envio de e-mail ainda não configurado" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const validade = expiraEm.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
  });

  const papelPorExtenso = papel === "coordenador" ? "coordenação" : "voluntariado";
  const ondeAtua = area ? ` na área ${area}` : "";

  // O SDK devolve { data, error } e não lança exceção, então o erro é
  // verificado no retorno, não com try/catch.
  const { data, error } = await resend.emails.send(
    {
      from: process.env.EMAIL_REMETENTE!,
      to: [para],
      subject: "Seu acesso ao Portal Projeto Fé",
      html: montarHtmlDoConvite({ link, quemConvidou, papelPorExtenso, ondeAtua, validade }),
      text: [
        `${quemConvidou} convidou você para o Portal do Instituto Projeto Fé,`,
        `para ${papelPorExtenso}${ondeAtua}.`,
        "",
        "Crie sua senha aqui:",
        link,
        "",
        `O link vale até ${validade}.`,
        "Não esperava este convite? É só ignorar.",
      ].join("\n"),
    },
    // Reenviar o mesmo convite não dispara dois e-mails dentro de 24 horas.
    { idempotencyKey: `convite/${para}/${expiraEm.getTime()}` },
  );

  if (error) return { enviado: false, motivo: error.message };
  return { enviado: Boolean(data?.id) };
}

export async function enviarRedefinicaoDeSenhaNoEmail({
  para,
  link,
}: {
  para: string;
  link: string;
}): Promise<ResultadoDoEnvio> {
  if (!envioConfigurado()) {
    return { enviado: false, motivo: "envio de e-mail ainda não configurado" };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send(
    {
      from: process.env.EMAIL_REMETENTE!,
      to: [para],
      subject: "Redefinir sua senha no Portal Projeto Fé",
      html: montarHtmlDaRedefinicao({ link }),
      text: [
        "Alguém (esperamos que você) pediu para trocar a senha da sua conta",
        "no Portal do Instituto Projeto Fé.",
        "",
        "Escolha uma nova senha aqui:",
        link,
        "",
        "O link vale por 1 hora e só funciona uma vez.",
        "Não pediu isso? É só ignorar: sua senha continua a mesma.",
      ].join("\n"),
    },
    // Pedir de novo dentro de 1 hora não dispara dois e-mails.
    { idempotencyKey: `redefinicao/${para}/${new Date().toISOString().slice(0, 13)}` },
  );

  if (error) return { enviado: false, motivo: error.message };
  return { enviado: Boolean(data?.id) };
}

function montarHtmlDaRedefinicao({ link }: { link: string }) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Redefinir sua senha</title>
  </head>
  <body style="margin:0;padding:0;background:${marcaNeutros.fundo};font-family:'Open Sans',Arial,sans-serif;color:${marca.azul};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:${marca.branco};border-radius:12px;overflow:hidden;">
            <tr>
              <td align="center" style="background:${marca.azul};padding:26px 28px;">
                <div style="font-size:10px;letter-spacing:3px;color:${marcaNeutros.brancoTransparente70};font-weight:600;">INSTITUTO</div>
                <div style="font-size:20px;font-weight:800;color:${marca.branco};margin-top:5px;">
                  PROJETO <span style="color:${marca.laranja};">FÉ</span>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 28px 8px;">
                <h1 style="margin:0;font-size:20px;font-weight:700;color:${marca.azul};">
                  Redefinir sua senha
                </h1>
                <p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:${marcaNeutros.textoCorrido};">
                  Alguém pediu para trocar a senha desta conta. Se foi você, escolha uma nova.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 28px 26px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${marca.laranja};border-radius:6px;">
                      <a href="${link}" style="display:inline-block;padding:14px 30px;font-size:16px;font-weight:700;color:${marca.branco};text-decoration:none;">
                        Escolher nova senha
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0;font-size:13px;color:${marcaNeutros.textoDiscreto};">
                  O link vale por 1 hora e só funciona uma vez.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="border-top:1px solid ${marcaNeutros.linha};padding:16px 28px;font-size:12px;line-height:1.5;color:${marcaNeutros.textoDiscreto};">
                Instituto Projeto Fé · Marília, SP<br>
                Não pediu isso? É só ignorar: sua senha continua a mesma.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function montarHtmlDoConvite({
  link,
  quemConvidou,
  papelPorExtenso,
  ondeAtua,
  validade,
}: {
  link: string;
  quemConvidou: string;
  papelPorExtenso: string;
  ondeAtua: string;
  validade: string;
}) {
  // E-mail não compartilha o CSS do aplicativo: cliente de e-mail não entende
  // variável CSS, então as cores da marca vêm de lib/brand.
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <!-- Sem esta declaração, cliente de e-mail que não assume UTF-8 troca
         cada acento por caractere estranho, e "PROJETO FÉ" vira "PROJETO FÃ‰". -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Seu acesso ao Portal Projeto Fé</title>
  </head>
  <body style="margin:0;padding:0;background:${marcaNeutros.fundo};font-family:'Open Sans',Arial,sans-serif;color:${marca.azul};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:${marca.branco};border-radius:12px;overflow:hidden;">
            <tr>
              <td align="center" style="background:${marca.azul};padding:26px 28px;">
                <!-- Nome em texto, não imagem: aparece sempre, inclusive nos
                     clientes que bloqueiam imagem por padrão. -->
                <div style="font-size:10px;letter-spacing:3px;color:${marcaNeutros.brancoTransparente70};font-weight:600;">INSTITUTO</div>
                <div style="font-size:20px;font-weight:800;color:${marca.branco};margin-top:5px;">
                  PROJETO <span style="color:${marca.laranja};">FÉ</span>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 28px 8px;">
                <h1 style="margin:0;font-size:20px;font-weight:700;color:${marca.azul};">
                  ${quemConvidou} convidou você
                </h1>
                <p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:${marcaNeutros.textoCorrido};">
                  Para ${papelPorExtenso}${ondeAtua}.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:20px 28px 26px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${marca.laranja};border-radius:6px;">
                      <a href="${link}" style="display:inline-block;padding:14px 30px;font-size:16px;font-weight:700;color:${marca.branco};text-decoration:none;">
                        Criar minha senha
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:16px 0 0;font-size:13px;color:${marcaNeutros.textoDiscreto};">
                  O link vale até ${validade}.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="border-top:1px solid ${marcaNeutros.linha};padding:16px 28px;font-size:12px;line-height:1.5;color:${marcaNeutros.textoDiscreto};">
                Instituto Projeto Fé · Marília, SP<br>
                Não esperava este convite? É só ignorar.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
