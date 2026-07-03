import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      accountType: true, businessOrigin: true, owner: true,
      contacts: true,
      activities: { orderBy: { activityDate: "desc" }, take: 50, include: { contact: true, promotion: true } },
      opportunities: true,
    },
  });
  if (!account) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(account);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const { nextFollowUpDate, lastContactDate, ...rest } = body;
  const account = await prisma.account.update({
    where: { id },
    data: {
      ...rest,
      ...(nextFollowUpDate !== undefined && { nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : null }),
      ...(lastContactDate !== undefined && { lastContactDate: lastContactDate ? new Date(lastContactDate) : null }),
    },
  });
  return NextResponse.json(account);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.account.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
