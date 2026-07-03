import Link from "next/link";
import { Tag, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PromotionCard, type PromotionCardData } from "@/components/promotions/promotion-card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { id: "", label: "Todas" },
  { id: "ACTIVE", label: "Activas" },
  { id: "DRAFT", label: "Borradores" },
  { id: "PAUSED", label: "Pausadas" },
  { id: "EXPIRED", label: "Vencidas" },
];

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const promotions = await prisma.promotion.findMany({
    where: status ? { status: status as never } : { status: { not: "ARCHIVED" } },
    include: { businessOrigin: true },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    take: 100,
  });

  const cards: PromotionCardData[] = promotions.map((p: (typeof promotions)[number]) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    status: p.status,
    promoRate: p.promoRate?.toString() ?? null,
    publicRate: p.publicRate?.toString() ?? null,
    commission: p.commission?.toString() ?? null,
    validTo: p.validTo?.toISOString() ?? null,
    bookingLink: p.bookingLink,
    whatsappMessage: p.whatsappMessage,
    originName: p.businessOrigin?.name ?? null,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-fairway-900">Promociones</h1>
        <Link href="/promotions/new">
          <Button>
            <Plus className="h-4 w-4" /> Nueva promoción
          </Button>
        </Link>
      </div>

      {/* Filtros de un clic */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((fl) => (
          <Link
            key={fl.id}
            href={fl.id ? `/promotions?status=${fl.id}` : "/promotions"}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              (status ?? "") === fl.id
                ? "border-fairway-700 bg-fairway-700 text-white"
                : "border-ink/15 bg-white text-ink/70 hover:border-fairway-500"
            )}
          >
            {fl.label}
          </Link>
        ))}
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Sin promociones"
          description="Crea tu primera promoción y genera los copies con IA en un clic."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((p) => (
            <PromotionCard key={p.id} promo={p} />
          ))}
        </div>
      )}
    </div>
  );
}
