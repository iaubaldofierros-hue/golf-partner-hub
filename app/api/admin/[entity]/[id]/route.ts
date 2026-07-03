import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import { getEntityConfig, coerceFieldValues } from "@/lib/admin-entities";

type Params = { params: Promise<{ entity: string; id: string }> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Delegate = { update: (args: any) => Promise<any>; delete: (args: any) => Promise<any> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { entity, id } = await params;
  const config = getEntityConfig(entity);
  if (!config) return NextResponse.json({ error: "Entidad desconocida" }, { status: 404 });

  const body = await req.json();
  const data = coerceFieldValues(config, body);
  const delegate = (prisma as unknown as Record<string, Delegate>)[config.delegate];
  try {
    const updated = await delegate.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error al actualizar" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { entity, id } = await params;
  const config = getEntityConfig(entity);
  if (!config) return NextResponse.json({ error: "Entidad desconocida" }, { status: 404 });

  const delegate = (prisma as unknown as Record<string, Delegate>)[config.delegate];
  try {
    await delegate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "No se puede eliminar: este registro está en uso por otros datos relacionados." },
      { status: 400 }
    );
  }
}
