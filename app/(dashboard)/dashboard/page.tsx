import Link from "next/link";
import { CheckCircle2, Sunrise } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { FollowUpCard } from "@/components/dashboard/follow-up-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

/**
 * MI DÍA — la pantalla más importante del sistema.
 * El operador entra y de inmediato sabe qué hacer, sin navegar.
 */
export default async function MiDiaPage() {
  const now = new Date();
  const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59);
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const accountInclude = {
    accountType: true,
    businessOrigin: true,
    owner: true,
    contacts: { take: 1, orderBy: { createdAt: "asc" as const } },
  };

  const [overdue, today, abandoned, hotOpportunities, activePromotions, totals] =
    await Promise.all([
      prisma.account.findMany({
        where: { nextFollowUpDate: { lt: startOfDay }, status: { notIn: ["INACTIVE", "NOT_INTERESTED"] } },
        include: accountInclude,
        orderBy: { nextFollowUpDate: "asc" },
        take: 12,
      }),
      prisma.account.findMany({
        where: { nextFollowUpDate: { gte: startOfDay, lte: endOfDay } },
        include: accountInclude,
        take: 12,
      }),
      prisma.account.findMany({
        where: {
          status: { in: ["ACTIVE", "HIGH_PRODUCTION", "LOW_PRODUCTION"] },
          OR: [{ lastContactDate: { lt: thirtyDaysAgo } }, { lastContactDate: null }],
        },
        include: accountInclude,
        take: 6,
      }),
      prisma.opportunity.findMany({
        where: { stage: { in: ["INTERESTED", "PROPOSAL_SENT", "NEGOTIATING"] } },
        include: { account: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.promotion.findMany({ where: { status: "ACTIVE" }, take: 5 }),
      prisma.account.count(),
    ]);

  const greeting = now.getHours() < 12 ? "Buenos días" : now.getHours() < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Encabezado del día */}
      <div>
        <p className="flex items-center gap-2 text-sm text-brass-600 font-medium">
          <Sunrise className="h-4 w-4" />
          {now.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl text-fairway-900 mt-1">
          {greeting}. Hoy tienes {overdue.length + today.length} seguimiento{overdue.length + today.length === 1 ? "" : "s"}.
        </h1>
        <p className="text-sm text-ink/50 mt-1">
          {totals} cuentas en cartera · {activePromotions.length} promociones activas · {hotOpportunities.length} oportunidades calientes
        </p>
      </div>

      {/* Seguimientos vencidos — lo más urgente primero */}
      {overdue.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-ink">Seguimientos vencidos</h2>
            <Badge className="bg-danger/10 text-danger">{overdue.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {overdue.map((a) => <FollowUpCard key={a.id} account={a} />)}
          </div>
        </section>
      )}

      {/* Seguimientos para hoy */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-ink">Para hoy</h2>
          <Badge className="bg-fairway-100 text-fairway-800">{today.length}</Badge>
        </div>
        {today.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Sin seguimientos programados para hoy"
            description="Aprovecha para reactivar cuentas sin contacto reciente o enviar una promoción activa."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {today.map((a) => <FollowUpCard key={a.id} account={a} />)}
          </div>
        )}
      </section>

      {/* Cuentas sin contacto reciente */}
      {abandoned.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold text-ink">Sin contacto en más de 30 días</h2>
            <Badge className="bg-warn/15 text-warn">{abandoned.length}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {abandoned.map((a) => <FollowUpCard key={a.id} account={a} />)}
          </div>
        </section>
      )}

      {/* Oportunidades calientes + promociones activas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-ink/5 bg-white shadow-card p-5">
          <h2 className="font-semibold text-ink mb-3">Oportunidades calientes</h2>
          {hotOpportunities.length === 0 ? (
            <p className="text-sm text-ink/40">Sin oportunidades activas por ahora.</p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {hotOpportunities.map((o) => (
                <li key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/accounts/${o.accountId}`} className="text-sm font-medium hover:text-fairway-700 truncate block">
                      {o.name}
                    </Link>
                    <p className="text-xs text-ink/50">{o.account.name}</p>
                  </div>
                  <Badge className="bg-brass-500/15 text-brass-600">
                    {o.estimatedPlayers ? `${o.estimatedPlayers} jugadores` : "—"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-card border border-ink/5 bg-white shadow-card p-5">
          <h2 className="font-semibold text-ink mb-3">Promociones activas para enviar</h2>
          {activePromotions.length === 0 ? (
            <p className="text-sm text-ink/40">
              No hay promociones activas. <Link href="/promotions/new" className="text-fairway-700 underline">Crea una</Link>.
            </p>
          ) : (
            <ul className="divide-y divide-ink/5">
              {activePromotions.map((p) => (
                <li key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-ink/50">{p.type}</p>
                  </div>
                  <Link href={`/promotions`} className="text-xs text-fairway-700 font-medium whitespace-nowrap">
                    Compartir →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
