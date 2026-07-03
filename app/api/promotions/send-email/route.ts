import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { requireSession } from "@/lib/session-auth";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { promotionId, accountId, contactId, to, subject, html, fileId } = body as {
    promotionId?: string;
    accountId?: string;
    contactId?: string;
    to?: string;
    subject?: string;
    html?: string;
    fileId?: string;
  };

  if (!to || !subject || !html) {
    return NextResponse.json({ error: "Faltan destinatario, asunto o contenido del correo." }, { status: 400 });
  }

  let attachments: { filename: string; content: Buffer }[] | undefined;
  if (fileId) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });
    if (!file) return NextResponse.json({ error: "El archivo adjunto ya no existe." }, { status: 404 });
    try {
      const fileRes = await fetch(file.url);
      if (!fileRes.ok) throw new Error("No se pudo descargar el archivo adjunto.");
      const buffer = Buffer.from(await fileRes.arrayBuffer());
      attachments = [{ filename: file.name, content: buffer }];
    } catch {
      return NextResponse.json({ error: "No se pudo preparar el archivo adjunto." }, { status: 500 });
    }
  }

  const result = await sendEmail({ to, subject, html, attachments });

  if (!result.ok) {
    if (result.reason === "not_configured") {
      return NextResponse.json(
        { error: "El envío de correo no está configurado (falta RESEND_API_KEY en el servidor)." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: result.reason ?? "No se pudo enviar el correo." }, { status: 502 });
  }

  if (accountId) {
    await prisma.activity.create({
      data: {
        accountId,
        contactId: contactId || null,
        type: "EMAIL_SENT",
        notes: `Email enviado: ${subject}`,
        promotionId: promotionId || null,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
