"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/** Modal ligero sin dependencias externas */
export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-card bg-white p-5 shadow-card max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="font-display text-lg text-fairway-900">{title}</h2>}
          <button onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1 hover:bg-sand-100">
            <X className="h-5 w-5 text-ink/60" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
