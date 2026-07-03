"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Mail, Pencil, CalendarDays, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PromotionShareModal } from "@/components/promotions/promotion-share-modal";
import { PromotionEmailModal } from "@/components/promotions/promotion-email-modal";
import { PROMOTION_STATUS_LABELS, PROMOTION_STATUS_COLORS } from "@/lib/labels";
import { cn, formatDate } from "@/lib/utils";

export interface PromotionCardData {
  id: string;
  name: string;
  type: string;
  status: string;
  promoRate?: string | null;
  publicRate?: string | null;
  commission?: string | null;
  validTo?: string | null;
  bookingLink?: string | null;
  whatsappMessage?: string | null;
  benefits?: string | null;
  originName?: string | null;
}

export function PromotionCard({ promo }: { promo: PromotionCardData }) {
  const [share, setShare] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  return (
    <Card className="p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-ink">{promo.name}</p>
          <p className="text-xs text-ink/50">
            {promo.type}
            {promo.originName ? ` · ${promo.originName}` : ""}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
            PROMOTION_STATUS_COLORS[promo.status] ?? "bg-sand-100 text-ink/70"
          )}
        >
          {PROMOTION_STATUS_LABELS[promo.status] ?? promo.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
        {promo.promoRate && (
          <span className="font-medium text-fairway-900">
            ${promo.promoRate} USD
            {promo.publicRate && <span className="ml-1 text-ink/40 line-through">${promo.publicRate}</span>}
          </span>
        )}
        {promo.commission && (
          <span className="flex items-center gap-1">
            <Percent className="h-3 w-3" /> {promo.commission}% comisión
          </span>
        )}
        {promo.validTo && (
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" /> hasta {formatDate(new Date(promo.validTo))}
          </span>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        <Button size="sm" variant="whatsapp" onClick={() => setShare(true)} disabled={promo.status !== "ACTIVE"}>
          <Send className="h-4 w-4" /> Enviar
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEmailOpen(true)} disabled={promo.status !== "ACTIVE"}>
          <Mail className="h-4 w-4" /> Email
        </Button>
        <Link href={`/promotions/${promo.id}`}>
          <Button size="sm" variant="outline">
            <Pencil className="h-4 w-4" /> Editar
          </Button>
        </Link>
      </div>

      {share && (
        <PromotionShareModal
          promotion={{
            id: promo.id,
            name: promo.name,
            promoRate: promo.promoRate,
            validTo: promo.validTo,
            bookingLink: promo.bookingLink,
            whatsappMessage: promo.whatsappMessage,
          }}
          open
          onClose={() => setShare(false)}
        />
      )}
      {emailOpen && (
        <PromotionEmailModal
          promotion={{
            id: promo.id,
            name: promo.name,
            promoRate: promo.promoRate,
            validTo: promo.validTo,
            bookingLink: promo.bookingLink,
            benefits: promo.benefits,
          }}
          open
          onClose={() => setEmailOpen(false)}
        />
      )}
    </Card>
  );
}
