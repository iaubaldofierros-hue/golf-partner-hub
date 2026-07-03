import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PromotionForm } from "@/components/promotions/promotion-form";
import { FileManager } from "@/components/shared/file-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [promotion, origins] = await Promise.all([
    prisma.promotion.findUnique({ where: { id } }),
    prisma.businessOrigin.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!promotion) notFound();

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl text-fairway-900">Editar promoción</h1>
      <PromotionForm
        origins={origins}
        promotion={{
          id: promotion.id,
          name: promotion.name,
          type: promotion.type,
          businessOriginId: promotion.businessOriginId ?? undefined,
          targetSegment: promotion.targetSegment ?? undefined,
          validFrom: promotion.validFrom?.toISOString().slice(0, 10),
          validTo: promotion.validTo?.toISOString().slice(0, 10),
          season: promotion.season ?? undefined,
          publicRate: promotion.publicRate ? Number(promotion.publicRate) : undefined,
          promoRate: promotion.promoRate ? Number(promotion.promoRate) : undefined,
          commission: promotion.commission ? Number(promotion.commission) : undefined,
          promoCode: promotion.promoCode ?? undefined,
          restrictions: promotion.restrictions ?? undefined,
          benefits: promotion.benefits ?? undefined,
          bookingLink: promotion.bookingLink ?? undefined,
          whatsappMessage: promotion.whatsappMessage ?? undefined,
          phoneScript: promotion.phoneScript ?? undefined,
          status: promotion.status,
        }}
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Archivos adjuntos</CardTitle>
          <p className="text-xs text-ink/50">
            Videos, PDFs o imágenes de esta promoción — el link se puede incluir al enviar por WhatsApp, y se puede
            adjuntar de verdad al enviar por email.
          </p>
        </CardHeader>
        <CardContent>
          <FileManager promotionId={promotion.id} />
        </CardContent>
      </Card>
    </div>
  );
}
