import { NextRequest, NextResponse } from "next/server";
import { generateCopySchema } from "@/lib/validations";
import { generateCommercialCopy } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = generateCopySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Configura ANTHROPIC_API_KEY en .env para generar copies con IA." },
      { status: 503 }
    );
  }
  try {
    const copy = await generateCommercialCopy(parsed.data);
    return NextResponse.json(copy);
  } catch (e) {
    console.error("[ai/generate-copy]", e);
    return NextResponse.json({ error: "No se pudo generar el copy. Intenta de nuevo." }, { status: 500 });
  }
}
