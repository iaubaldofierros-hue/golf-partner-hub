import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { quickActivitySchema } from "@/lib/validations";

const CHANNEL_BY_TYPE: Record<string, string> = {
  WHATSAPP_SENT: "WHATSAPP", WHATSAPP_RECEIVED: "WHATSAPP",
  EMAIL_SENT: "EMAIL", EMAIL_RECEIVED: "EMAIL",
  CALL_MADE: "PHONE", CALL_RECEIVED: "PHONE",
  VISIT: "IN_PERSON", MEETING: "IN_PERSON",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = quickActivitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { accountId, contactId, type, result, notes, nextFollowUpDate, promotionId } = parsed.data;
  const followUp = nextFollowUpDate ? new Date(nextFollowUpDate) : null;

  const activity = await prisma.activity.create({
    data: {
      accountId,
      contactId: contactId || null,
      type: type as never,
      channel: (CHANNEL_BY_TYPE[type] as never) ?? "OTHER",
      result: result || null,
      notes: notes || null,
      promotionId: promotionId || null,
      nextFollowUpDate: followUp,
    },
  });

  // Mantener la cuenta actualizada: último contacto y próximo seguimiento
  await prisma.account.update({
    where: { id: accountId },
    data: {
      lastContactDate: new Date(),
      ...(followUp && { nextFollowUpDate: followUp }),
    },
  });

  if (contactId) {
    await prisma.contact.update({
      where: { id: contactId },
      data: { lastContactDate: new Date(), ...(followUp && { nextFollowUpDate: followUp }) },
    });
  }

  return NextResponse.json(activity, { status: 201 });
}
