import { Badge } from "@/components/ui/badge";
import { ACCOUNT_STATUS_LABELS, ACCOUNT_STATUS_COLORS } from "@/lib/labels";

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={ACCOUNT_STATUS_COLORS[status] ?? "bg-sand-200 text-ink"}>
      {ACCOUNT_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
