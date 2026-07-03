import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promotionSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: { businessOrigin: true },
  });
  if (!promotion) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(promotion);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const parsed = promotionSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { validFrom, validTo, businessOriginId, ...data } = parsed.data;

  const promotion = await prisma.promotion.update({
    where: { id },
    data: {
      ...data,
      ...(businessOriginId !== undefined ? { businessOriginId: businessOriginId || null } : {}),
      ...(validFrom !== undefined ? { validFrom: validFrom ? new Date(validFrom) : null } : {}),
      ...(validTo !== undefined ? { validTo: validTo ? new Date(validTo) : null } : {}),
    },
  });
  return NextResponse.json(promotion);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.promotion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
