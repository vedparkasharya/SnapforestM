import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#1a472a] text-white hover:bg-[#236b3a]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-white/20 bg-transparent text-white hover:bg-white/5 hover:border-white/40",
        secondary: "bg-[#2a2a2a] text-white hover:bg-[#333333]",
        ghost: "hover:bg-white/5 text-white",
        link: "text-[#c8e6c9] underline-offset-4 hover:underline",
        neon: "bg-[#1a472a] text-white hover:bg-[#236b3a] hover:shadow-[0_0_20px_rgba(26,71,42,0.3)]",
        sun: "bg-[#f9a825] text-[#111111] hover:bg-[#f9a825]/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
