import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session-auth";

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const accountId = req.nextUrl.searchParams.get("accountId") ?? undefined;
  const promotionId = req.nextUrl.searchParams.get("promotionId") ?? undefined;
  if (!accountId && !promotionId) {
    return NextResponse.json({ error: "Falta accountId o promotionId" }, { status: 400 });
  }

  const files = await prisma.file.findMany({
    where: { ...(accountId && { accountId }), ...(promotionId && { promotionId }) },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(files);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "El almacenamiento de archivos no está configurado (falta BLOB_READ_WRITE_TOKEN)." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const accountId = formData.get("accountId");
  const promotionId = formData.get("promotionId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }
  if (!accountId && !promotionId) {
    return NextResponse.json({ error: "Falta accountId o promotionId" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "El archivo supera el límite de 50 MB." }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const created = await prisma.file.create({
    data: {
      name: file.name,
      url: blob.url,
      mimeType: file.type || null,
      size: file.size,
      accountId: typeof accountId === "string" && accountId ? accountId : null,
      promotionId: typeof promotionId === "string" && promotionId ? promotionId : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
