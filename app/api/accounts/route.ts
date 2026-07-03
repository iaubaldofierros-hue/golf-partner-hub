import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { accountSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const accounts = await prisma.account.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { contacts: { some: { firstName: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : undefined,
    include: { accountType: true, businessOrigin: true, contacts: { take: 1 } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  return NextResponse.json(accounts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = accountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { contactFirstName, contactWhatsapp, contactEmail, nextFollowUpDate, ...data } = parsed.data;

  const account = await prisma.account.create({
    data: {
      ...data,
      status: (data.status as never) ?? "PROSPECT",
      mainEmail: data.mainEmail || null,
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null,
      // Flujo "Nueva cuenta rápida": crear contacto principal en el mismo paso
      contacts: contactFirstName
        ? {
            create: {
              firstName: contactFirstName,
              whatsapp: contactWhatsapp || null,
              email: contactEmail || null,
            },
          }
        : undefined,
    },
  });
  return NextResponse.json(account, { status: 201 });
}
