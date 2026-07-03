import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-ink/15 bg-sand-50/50 py-14 px-6 text-center">
      <Icon className="h-9 w-9 text-fairway-300 mb-3" />
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink/50 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
