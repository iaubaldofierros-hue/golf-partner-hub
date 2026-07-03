import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-ink/10 bg-white px-3 text-sm placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-500 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
