import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-gradient text-white shadow-sm hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.03] hover:brightness-110 active:brightness-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.03]",
        outline: "border border-border bg-transparent hover:bg-secondary hover:scale-[1.03] hover:border-primary/40",
        ghost: "hover:bg-secondary hover:scale-[1.03]",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-[1.03]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
