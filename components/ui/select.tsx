import * as React from "react";
import { cn } from "@/lib/utils";

/** Select nativo estilizado — rápido y mobile friendly para el operador */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-500",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";
