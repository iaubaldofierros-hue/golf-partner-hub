import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, PRIORITY_COLORS } from "@/lib/labels";

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Badge className={PRIORITY_COLORS[priority] ?? "bg-sand-200 text-ink"}>
      {PRIORITY_LABELS[priority] ?? priority}
    </Badge>
  );
}
