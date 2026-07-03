import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { getEntityConfig, coerceFieldValues } from "@/lib/admin-entities";

type Params = { params: Promise<{ entity: string }> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Delegate = { findMany: (args: any) => Promise<any[]>; create: (args: any) => Promise<any> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { entity } = await params;
  const config = getEntityConfig(entity);
  if (!config) return NextResponse.json({ error: "Entidad desconocida" }, { status: 404 });

  const delegate = (prisma as unknown as Record<string, Delegate>)[config.delegate];
  const rows = await delegate.findMany({
    include: config.include,
    orderBy: { id: "desc" },
    take: 500,
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { entity } = await params;
  const config = getEntityConfig(entity);
  if (!config) return NextResponse.json({ error: "Entidad desconocida" }, { status: 404 });
  if (!config.allowCreate) return NextResponse.json({ error: "No se permite crear este tipo de registro aquí" }, { status: 400 });

  const body = await req.json();
  for (const field of config.fields) {
    if (field.required && !body[field.key]) {
      return NextResponse.json({ error: `El campo "${field.label}" es obligatorio` }, { status: 400 });
    }
  }

  const data = coerceFieldValues(config, body);
  const delegate = (prisma as unknown as Record<string, Delegate>)[config.delegate];
  try {
    const created = await delegate.create({ data });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al crear" }, { status: 400 });
  }
}
