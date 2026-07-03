import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fairway-500",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
