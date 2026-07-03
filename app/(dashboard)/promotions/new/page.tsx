import { prisma } from "@/lib/prisma";
import { PromotionForm } from "@/components/promotions/promotion-form";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  const origins = await prisma.businessOrigin.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl text-fairway-900">Nueva promoción</h1>
      <PromotionForm origins={origins} />
    </div>
  );
}
