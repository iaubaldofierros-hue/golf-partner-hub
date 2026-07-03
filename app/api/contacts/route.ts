import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const contacts = await prisma.contact.findMany({
    where: q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { whatsapp: { contains: q } },
            { account: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: { account: { include: { accountType: true } } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json(contacts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { nextFollowUpDate, ...data } = parsed.data;
  const contact = await prisma.contact.create({
    data: {
      ...data,
      email: data.email || null,
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
    },
  });
  return NextResponse.json(contact, { status: 201 });
}
