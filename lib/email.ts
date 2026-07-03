/**
 * Servicio de email — listo para conectar Resend.
 * En Fase 1 solo se define la interfaz; activar con RESEND_API_KEY.
 */
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  previewText?: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail(input: SendEmailInput) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada — email no enviado:", input.subject);
    return { ok: false, reason: "not_configured" as const };
  }
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Golf Partner Hub <onboarding@resend.dev>",
    to: Array.isArray(input.to) ? input.to : [input.to],
    subject: input.subject,
    html: input.html,
    ...(input.attachments && { attachments: input.attachments }),
  });
  if (error) return { ok: false as const, reason: error.message };
  return { ok: true as const, id: data?.id };
}
