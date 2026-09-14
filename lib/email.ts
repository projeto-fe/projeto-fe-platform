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
        `${quemConvidou} criou um acesso para você no Portal do Instituto Projeto Fé,`,
        `para ${papelPorExtenso}${ondeAtua}.`,
        "",
        "Abra o link abaixo para escolher sua senha:",
        link,
        "",
        `O link vale até ${validade} e serve uma vez só.`,
        "Se você não esperava este convite, ignore esta mensagem.",
      ].join("\n"),
    },
    // Reenviar o mesmo convite não dispara dois e-mails dentro de 24 horas.
    { idempotencyKey: `convite/${para}/${expiraEm.getTime()}` },
  );

  if (error) return { enviado: false, motivo: error.message };
  return { enviado: Boolean(data?.id) };
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
  <body style="margin:0;padding:0;background:${marcaNeutros.fundo};font-family:'Open Sans',Arial,sans-serif;color:${marca.azul};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${marca.branco};border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${marca.azul};padding:24px 28px;">
                <div style="font-size:10px;letter-spacing:3px;color:${marcaNeutros.brancoTransparente70};font-weight:600;">INSTITUTO</div>
                <div style="font-size:19px;font-weight:800;color:${marca.branco};margin-top:4px;">
                  PROJETO <span style="color:${marca.laranja};">FÉ</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 14px;font-size:20px;font-weight:700;color:${marca.azul};">
                  Seu acesso ao portal está pronto
                </h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${marcaNeutros.textoCorrido};">
                  ${quemConvidou} criou um acesso para você no portal interno do Instituto,
                  para ${papelPorExtenso}${ondeAtua}.
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${marcaNeutros.textoCorrido};">
                  Clique no botão abaixo para escolher sua senha e entrar.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:${marca.laranja};border-radius:6px;">
                      <a href="${link}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:700;color:${marca.branco};text-decoration:none;">
                        Criar minha senha
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${marcaNeutros.textoDiscreto};">
                  O link vale até ${validade} e serve uma vez só.
                  Se você não esperava este convite, pode ignorar esta mensagem.
                </p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid ${marcaNeutros.linha};padding:18px 28px;font-size:12px;color:${marcaNeutros.textoDiscreto};">
                Instituto Projeto Fé · Marília, SP
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
