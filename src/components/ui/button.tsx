import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-accent/70 active:not-disabled:scale-[0.96] transition-[scale,background-color,color,opacity] duration-150 ease-out",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-fg hover:bg-accent/90",
        secondary:
          "bg-raised text-fg hover:bg-raised/80 shadow-[0_0_0_1px_var(--color-border)]",
        ghost: "text-fg hover:bg-raised",
        outline:
          "text-fg shadow-[0_0_0_1px_var(--color-border)] hover:bg-raised",
        danger: "bg-danger text-danger-fg hover:bg-danger/90",
        paper: "bg-paper text-ink hover:bg-paper-2",
        tool: "bg-[var(--tool,var(--color-accent))] text-on-tool hover:brightness-95",
      },
      size: {
        default: "h-10 px-3.5",
        sm: "h-8 px-2.5 text-[13px]",
        lg: "h-11 px-4",
        icon: "size-10",
        tool: "size-9 rounded-[10px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
