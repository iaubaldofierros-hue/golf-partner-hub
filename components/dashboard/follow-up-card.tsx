import Link from "next/link";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { QuickActionButtons } from "@/components/shared/quick-action-buttons";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { timeAgo, formatDate, overdueDays } from "@/lib/utils";
import type { AccountWithRelations } from "@/types";

/**
 * Responde de un vistazo: ¿a quién contacto, por qué, por cuál canal y cuál es el siguiente paso?
 */
export function FollowUpCard({ account }: { account: AccountWithRelations }) {
  const main = account.contacts[0];
  const days = overdueDays(account.nextFollowUpDate);
  const overdue = days > 0;

  return (
    <div className="rounded-card border border-ink/5 bg-white shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/accounts/${account.id}`} className="font-medium text-ink hover:text-fairway-700 truncate block">
            {account.name}
          </Link>
          <p className="text-xs text-ink/50 truncate">
            {account.accountType?.name ?? "Sin tipo"} · {account.city ?? "Sin ciudad"}
            {main && ` · ${main.firstName} ${main.lastName ?? ""}`}
          </p>
        </div>
        <PriorityBadge priority={account.priority} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <StatusBadge status={account.status} />
        <span className="text-ink/50">Último contacto: {timeAgo(account.lastContactDate)}</span>
      </div>

      <div className={`flex items-center gap-1.5 text-xs font-medium ${overdue ? "text-danger" : "text-fairway-700"}`}>
        {overdue ? <AlertTriangle className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
        {overdue
          ? `Seguimiento vencido hace ${days} día${days === 1 ? "" : "s"}`
          : `Seguimiento: ${formatDate(account.nextFollowUpDate)}`}
      </div>

      <QuickActionButtons
        accountId={account.id}
        contactId={main?.id}
        whatsapp={main?.whatsapp ?? account.mainPhone}
        email={main?.email ?? account.mainEmail}
        phone={main?.phone ?? account.mainPhone}
        showLabels
      />
    </div>
  );
}
