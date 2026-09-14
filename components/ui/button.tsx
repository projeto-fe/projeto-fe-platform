import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-sm font-semibold whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // ação primária comum usa tinta, não marca (ADR 0002)
        primary: "bg-action text-action-ink hover:bg-action-hover",
        // marca reservada para a ação característica do produto
        brand: "bg-brand text-action-ink hover:bg-brand-hover",
        outline: "border border-line-strong bg-transparent text-ink hover:bg-surface-sunken",
        ghost: "bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink",
        destructive: "bg-negative text-action-ink hover:opacity-90",
      },
      size: {
        default: "h-9 px-4 text-sm",
        sm: "h-8 px-3 text-sm",
        lg: "h-11 px-6",
        icon: "size-9",
      },
    },
    // botão sem variante nasce primário, não "preto por acidente"
    defaultVariants: { variant: "primary", size: "default" },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </Comp>
  );
}

export { buttonVariants };
