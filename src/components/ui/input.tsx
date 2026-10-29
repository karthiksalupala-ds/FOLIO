import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md bg-raised px-3 text-sm text-fg placeholder:text-subtle shadow-[0_0_0_1px_var(--color-border)] outline-none focus-visible:shadow-[0_0_0_1px_var(--color-accent)] disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md bg-raised px-3 py-2 text-sm text-fg placeholder:text-subtle shadow-[0_0_0_1px_var(--color-border)] outline-none focus-visible:shadow-[0_0_0_1px_var(--color-accent)] disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export { Input, Textarea };
