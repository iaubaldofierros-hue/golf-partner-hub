import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { QuickActionButtons } from "@/components/shared/quick-action-buttons";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { timeAgo, formatDate, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Filtros rápidos de un clic — sin construir filtros complejos */
const QUICK_FILTERS = [
  { id: "concierges", label: "Concierges" },
  { id: "hoteles", label: "Hoteles" },
  { id: "dmc", label: "DMC" },
  { id: "touroperadores", label: "Tour Operadores" },
  { id: "nacionales", label: "Agencias Nacionales" },
  { id: "prioridad", label: "Alta prioridad" },
  { id: "sinseguimiento", label: "Sin seguimiento" },
  { id: "vencido", label: "Seguimiento vencido" },
];

const ORIGIN_BY_FILTER: Record<string, string> = {
  concierges: "Concierges",
  hoteles: "Hoteles",
  dmc: "DMC",
  touroperadores: "Tour Operadores",
  nacionales: "Agencias Nacionales",
};

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; f?: string }>;
}) {
  const { q, f } = await searchParams;

  const where: Prisma.AccountWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { accountType: { name: { contains: q, mode: "insensitive" } } },
      { contacts: { some: { firstName: { contains: q, mode: "insensitive" } } } },
    ];
  }
  if (f && ORIGIN_BY_FILTER[f]) where.businessOrigin = { name: ORIGIN_BY_FILTER[f] };
  if (f === "prioridad") where.priority = { in: ["HIGH", "VIP"] };
  if (f === "sinseguimiento") where.nextFollowUpDate = null;
  if (f === "vencido") where.nextFollowUpDate = { lt: new Date() };

  const accounts = await prisma.account.findMany({
    where,
    include: { accountType: true, businessOrigin: true, contacts: { take: 1 } },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-fairway-900">Cuentas comerciales</h1>
          <p className="text-sm text-ink/50">{accounts.length} cuenta{accounts.length === 1 ? "" : "s"}{q && ` para “${q}”`}</p>
        </div>
        <Link href="/accounts/new">
          <Button><Plus className="h-4 w-4" /> Nueva cuenta</Button>
        </Link>
      </div>

      {/* Filtros de un clic */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <Link
          href="/accounts"
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap",
            !f ? "bg-fairway-800 text-white border-fairway-800" : "bg-white border-ink/10 text-ink/60 hover:border-fairway-500"
          )}
        >
          Todas
        </Link>
        {QUICK_FILTERS.map((qf) => (
          <Link
            key={qf.id}
            href={`/accounts?f=${qf.id}`}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap",
              f === qf.id ? "bg-fairway-800 text-white border-fairway-800" : "bg-white border-ink/10 text-ink/60 hover:border-fairway-500"
            )}
          >
            {qf.label}
          </Link>
        ))}
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No hay cuentas con este filtro"
          description="Crea una nueva cuenta o ajusta la búsqueda."
          action={<Link href="/accounts/new"><Button size="sm">Nueva cuenta</Button></Link>}
        />
      ) : (
        <div className="rounded-card border border-ink/5 bg-white shadow-card overflow-hidden">
          {/* Tabla en desktop, tarjetas en móvil */}
          <table className="hidden md:table w-full text-sm">
            <thead className="bg-sand-100 text-left text-xs text-ink/50 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-medium">Cuenta</th>
                <th className="px-4 py-3 font-medium">Estatus</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Último contacto</th>
                <th className="px-4 py-3 font-medium">Próximo seguimiento</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {accounts.map((a) => {
                const c = a.contacts[0];
                return (
                  <tr key={a.id} className="hover:bg-sand-50/60">
                    <td className="px-4 py-3">
                      <Link href={`/accounts/${a.id}`} className="font-medium hover:text-fairway-700">{a.name}</Link>
                      <p className="text-xs text-ink/50">{a.accountType?.name ?? "—"} · {a.city ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={a.priority} /></td>
                    <td className="px-4 py-3 text-ink/60">{timeAgo(a.lastContactDate)}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDate(a.nextFollowUpDate)}</td>
                    <td className="px-4 py-3">
                      <QuickActionButtons
                        accountId={a.id}
                        contactId={c?.id}
                        whatsapp={c?.whatsapp ?? a.mainPhone}
                        email={c?.email ?? a.mainEmail}
                        phone={c?.phone ?? a.mainPhone}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="md:hidden divide-y divide-ink/5">
            {accounts.map((a) => {
              const c = a.contacts[0];
              return (
                <div key={a.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/accounts/${a.id}`} className="font-medium">{a.name}</Link>
                    <PriorityBadge priority={a.priority} />
                  </div>
                  <div className="flex flex-wrap gap-2 items-center text-xs text-ink/50">
                    <StatusBadge status={a.status} />
                    <span>{a.accountType?.name}</span>
                  </div>
                  <QuickActionButtons
                    accountId={a.id}
                    contactId={c?.id}
                    whatsapp={c?.whatsapp ?? a.mainPhone}
                    email={c?.email ?? a.mainEmail}
                    phone={c?.phone ?? a.mainPhone}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
