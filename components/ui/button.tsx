import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-out-soft outline-none select-none active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // ação primária comum usa tinta, não marca (ADR 0002)
        primary: "bg-action text-action-ink shadow-card hover:bg-action-hover",
        // marca reservada para a ação característica do produto
        brand: "bg-brand text-action-ink shadow-card hover:bg-brand-hover",
        outline:
          "border border-line-strong bg-surface-raised text-ink shadow-card hover:bg-surface-sunken",
        subtle: "bg-surface-sunken text-ink hover:bg-line",
        ghost: "bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink",
        destructive: "bg-negative text-action-ink shadow-card hover:opacity-90",
        link: "h-auto rounded-none px-0 text-brand-ink underline-offset-3 hover:underline",
      },
      size: {
        default: "h-9 px-3.5 text-sm",
        sm: "h-8 px-3 text-sm",
        lg: "h-11 px-5 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
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
  // Com asChild, o Radix Slot exige exatamente um filho, então o indicador de
  // carregamento não pode ser acrescentado ao lado. Também não faria sentido:
  // asChild é usado para links, que não têm estado de envio.
  if (asChild) {
    return (
      <Slot className={cn(buttonVariants({ variant, size, className }))} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export { buttonVariants };
