import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { QuickActionButtons } from "@/components/shared/quick-action-buttons";
import { AccountTabs } from "@/components/accounts/account-tabs";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { FileManager } from "@/components/shared/file-manager";
import { CHANNEL_LABELS, OPPORTUNITY_STAGE_LABELS } from "@/lib/labels";
import { timeAgo, formatDate, formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      accountType: true,
      businessOrigin: true,
      contacts: { orderBy: { createdAt: "asc" } },
      activities: {
        orderBy: { activityDate: "desc" },
        take: 50,
        include: { contact: true, promotion: true },
      },
      opportunities: { orderBy: { updatedAt: "desc" } },
    },
  });
  if (!account) notFound();

  const main = account.contacts[0];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Encabezado ejecutivo: solo lo necesario para decidir el siguiente paso */}
      <div className="rounded-card border border-ink/5 bg-white shadow-card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl text-fairway-900">{account.name}</h1>
            <p className="text-sm text-ink/50">
              {account.accountType?.name ?? "Sin tipo"} · {account.businessOrigin?.name ?? "Sin origen"}
              {account.city && ` · ${account.city}`}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={account.status} />
            <PriorityBadge priority={account.priority} />
          </div>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
          <div>
            <dt className="text-xs text-ink/40">Último contacto</dt>
            <dd>{timeAgo(account.lastContactDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/40">Próximo seguimiento</dt>
            <dd>{formatDate(account.nextFollowUpDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/40">Contacto principal</dt>
            <dd>{main ? `${main.firstName} ${main.lastName ?? ""}` : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink/40">Canal preferido</dt>
            <dd>{main ? CHANNEL_LABELS[main.preferredChannel] : "—"}</dd>
          </div>
        </dl>

        <QuickActionButtons
          accountId={account.id}
          contactId={main?.id}
          whatsapp={main?.whatsapp ?? account.mainPhone}
          email={main?.email ?? account.mainEmail}
          phone={main?.phone ?? account.mainPhone}
          size="default"
          showLabels
        />
      </div>

      <AccountTabs
        counts={{
          contacts: account.contacts.length,
          activities: account.activities.length,
          opportunities: account.opportunities.length,
        }}
        activities={<ActivityTimeline activities={account.activities} />}
        contacts={
          account.contacts.length === 0 ? (
            <EmptyState icon={Users} title="Sin contactos" description="Agrega el contacto principal de esta cuenta." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {account.contacts.map((c) => (
                <div key={c.id} className="rounded-card border border-ink/5 bg-white shadow-card p-4 space-y-2">
                  <div>
                    <p className="font-medium">{c.firstName} {c.lastName ?? ""}</p>
                    <p className="text-xs text-ink/50">{c.position ?? "—"} · {CHANNEL_LABELS[c.preferredChannel]}</p>
                  </div>
                  <QuickActionButtons
                    accountId={account.id}
                    contactId={c.id}
                    whatsapp={c.whatsapp}
                    email={c.email}
                    phone={c.phone}
                  />
                </div>
              ))}
            </div>
          )
        }
        opportunities={
          account.opportunities.length === 0 ? (
            <EmptyState icon={Target} title="Sin oportunidades" description="Crea una oportunidad cuando haya interés real de negocio." />
          ) : (
            <ul className="divide-y divide-ink/5 rounded-card border border-ink/5 bg-white shadow-card">
              {account.opportunities.map((o) => (
                <li key={o.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{o.name}</p>
                    <p className="text-xs text-ink/50">
                      {OPPORTUNITY_STAGE_LABELS[o.stage]} · {o.estimatedPlayers ? `${o.estimatedPlayers} jugadores · ` : ""}
                      {formatMoney(o.estimatedValue?.toString())}
                    </p>
                  </div>
                  <span className="text-xs text-ink/40">{formatDate(o.expectedDate)}</span>
                </li>
              ))}
            </ul>
          )
        }
        notes={
          <div className="rounded-card border border-ink/5 bg-white shadow-card p-5 text-sm whitespace-pre-wrap">
            {account.notes || <span className="text-ink/40">Sin notas. Edita la cuenta para agregar contexto comercial.</span>}
          </div>
        }
        files={<FileManager accountId={account.id} />}
      />

      <Link href="/accounts" className="inline-block text-sm text-fairway-700 hover:underline">← Volver a cuentas</Link>
    </div>
  );
}
