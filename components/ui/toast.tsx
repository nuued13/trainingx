"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

type ToastContextValue = {
  viewport: HTMLDivElement | null;
  setViewport: React.Dispatch<React.SetStateAction<HTMLDivElement | null>>;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);

  return (
    <ToastContext.Provider value={{ viewport, setViewport }}>
      {children}
    </ToastContext.Provider>
  );
};

const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("Toast components must be used within <ToastProvider />");
  }
  return context;
};

const assignRef = <T,>(ref: React.ForwardedRef<T>, value: T) => {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    (ref as React.MutableRefObject<T>).current = value;
  }
};

export const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { setViewport } = useToastContext();
  const composedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      assignRef(ref, node);
      setViewport(node);
    },
    [ref, setViewport],
  );

  return (
    <div
      ref={composedRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-[100] flex flex-col items-end gap-3 p-4 sm:inset-auto sm:bottom-0 sm:right-0 sm:top-auto",
        className,
      )}
      {...props}
    />
  );
});
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full max-w-sm items-center justify-between space-x-4 overflow-hidden rounded-md border bg-background p-6 pr-8 text-foreground shadow-lg transition-all data-[state=closed]:animate-out data-[state=open]:animate-in",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "border-destructive/50 bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type ToastVariants = VariantProps<typeof toastVariants>;

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  ToastVariants & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  };

type ToastItemContextValue = {
  onClose?: () => void;
};

const ToastItemContext = React.createContext<ToastItemContextValue | null>(
  null,
);

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, open = true, onOpenChange, children, ...props }, ref) => {
    const { viewport } = useToastContext();
    const [node, setNode] = React.useState<HTMLDivElement | null>(null);

    React.useEffect(() => {
      if (!open && node) {
        node.setAttribute("data-state", "closed");
      } else if (node) {
        node.setAttribute("data-state", "open");
      }
    }, [open, node]);

    const mergedRef = React.useCallback(
      (instance: HTMLDivElement | null) => {
        assignRef(ref, instance);
        setNode(instance);
      },
      [ref],
    );

    if (!open) {
      return null;
    }

    const body = (
      <ToastItemContext.Provider
        value={{ onClose: () => onOpenChange?.(false) }}
      >
        <div
          ref={mergedRef}
          className={cn(toastVariants({ variant }), className)}
          {...props}
        >
          {children}
        </div>
      </ToastItemContext.Provider>
    );

    if (viewport) {
      return createPortal(body, viewport);
    }

    return body;
  },
);
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

export type ToastActionElement = React.ReactElement<typeof ToastAction>;

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(ToastItemContext);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => context?.onClose?.()}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 transition-opacity hover:text-foreground focus:outline-none focus:ring-2",
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
});
ToastClose.displayName = "ToastClose";
