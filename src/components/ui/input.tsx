import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-input border border-line bg-surface px-3 text-sm text-ink",
        "placeholder:text-muted/70 transition-colors duration-150",
        "hover:border-accent/40 focus:border-accent focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-xs font-medium tracking-wide text-muted", className)}
      {...props}
    />
  );
}
