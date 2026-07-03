import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { promotionSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const promotions = await prisma.promotion.findMany({
    where: status ? { status: status as never } : undefined,
    include: { businessOrigin: true },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 100,
  });
  return NextResponse.json(promotions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = promotionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { validFrom, validTo, businessOriginId, ...data } = parsed.data;

  const promotion = await prisma.promotion.create({
    data: {
      ...data,
      businessOriginId: businessOriginId || null,
      validFrom: validFrom ? new Date(validFrom) : null,
      validTo: validTo ? new Date(validTo) : null,
    },
  });
  return NextResponse.json(promotion, { status: 201 });
}
