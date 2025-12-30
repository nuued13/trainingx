import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const juicyButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-extrabold uppercase tracking-widest ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-1 active:border-b-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-slate-50 hover:bg-slate-900/90 border-2 border-b-[6px] border-slate-700 active:border-t-2",
        primary:
          "bg-blue-500 text-white hover:bg-blue-400 border-2 border-b-[6px] border-blue-700 active:border-blue-700",
        secondary:
          "bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-b-[6px] border-slate-300 active:border-slate-300",
        outline:
          "bg-white text-slate-500 hover:bg-slate-50 border-2 border-b-[6px] border-slate-200 active:border-slate-200",
        ghost: "hover:bg-slate-100 hover:text-slate-900 border-0 border-b-0",
        danger:
          "bg-red-500 text-white hover:bg-red-400 border-2 border-b-[6px] border-red-700 active:border-red-700",
        success:
          "bg-green-500 text-white hover:bg-green-400 border-2 border-b-[6px] border-green-700 active:border-green-700",
        warning:
          "bg-yellow-400 text-yellow-950 hover:bg-yellow-300 border-2 border-b-[6px] border-yellow-600 active:border-yellow-600",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-xl px-4 text-xs border-b-4",
        lg: "h-14 rounded-2xl px-8 text-base border-b-8",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface JuicyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof juicyButtonVariants> {
  asChild?: boolean;
}

const JuicyButton = React.forwardRef<HTMLButtonElement, JuicyButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(juicyButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
JuicyButton.displayName = "JuicyButton";

export { JuicyButton, juicyButtonVariants };
