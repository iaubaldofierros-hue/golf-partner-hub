"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-ink/10">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
            active === t.id
              ? "border-brass-500 text-fairway-900"
              : "border-transparent text-ink/50 hover:text-ink"
          )}
        >
          {t.label}
          {t.count != null && <span className="ml-1.5 text-xs text-ink/40">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
