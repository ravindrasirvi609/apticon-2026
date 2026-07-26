import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border border-[var(--gold-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] placeholder:text-[var(--muted-text)]/50 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
