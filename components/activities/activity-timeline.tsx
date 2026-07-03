import {
  MessageCircle, Mail, Phone, MapPin, Users, FileText, StickyNote, CalendarClock, Flag,
} from "lucide-react";
import { ACTIVITY_TYPE_LABELS } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";
import type { ActivityWithRelations } from "@/types";

const ICONS: Record<string, typeof Mail> = {
  WHATSAPP_SENT: MessageCircle, WHATSAPP_RECEIVED: MessageCircle,
  EMAIL_SENT: Mail, EMAIL_RECEIVED: Mail,
  CALL_MADE: Phone, CALL_RECEIVED: Phone,
  VISIT: MapPin, MEETING: Users,
  PROPOSAL_SENT: FileText, RATE_SENT: FileText, CONTRACT_SENT: FileText,
  INTERNAL_NOTE: StickyNote, FOLLOW_UP: CalendarClock,
};

export function ActivityTimeline({ activities }: { activities: ActivityWithRelations[] }) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Flag}
        title="Aún no hay actividades"
        description="Usa los botones de WhatsApp, Email o Llamar para registrar la primera interacción."
      />
    );
  }

  return (
    <ol className="relative border-l border-ink/10 ml-3 space-y-5">
      {activities.map((a) => {
        const Icon = ICONS[a.type] ?? Flag;
        return (
          <li key={a.id} className="ml-6">
            <span className="absolute -left-[13px] flex h-[26px] w-[26px] items-center justify-center rounded-full bg-fairway-100 ring-4 ring-sand-50">
              <Icon className="h-3.5 w-3.5 text-fairway-700" />
            </span>
            <div className="flex flex-wrap items-baseline gap-x-2">
              <p className="text-sm font-medium text-ink">{ACTIVITY_TYPE_LABELS[a.type] ?? a.type}</p>
              {a.result && <span className="text-xs rounded-full bg-sand-200 px-2 py-0.5">{a.result}</span>}
              <span className="text-xs text-ink/40 ml-auto">{formatDate(a.activityDate)}</span>
            </div>
            {a.contact && (
              <p className="text-xs text-ink/50">Con {a.contact.firstName} {a.contact.lastName ?? ""}</p>
            )}
            {a.notes && <p className="text-sm text-ink/70 mt-1">{a.notes}</p>}
            {a.nextFollowUpDate && (
              <p className="text-xs text-fairway-700 mt-1 flex items-center gap-1">
                <CalendarClock className="h-3 w-3" /> Próximo seguimiento: {formatDate(a.nextFollowUpDate)}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
