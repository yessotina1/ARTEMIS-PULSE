import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-container text-[#03161b] border border-primary-container font-semibold hover:bg-accent-hover hover:border-accent-hover active:translate-y-px",
  secondary:
    "bg-transparent text-on-surface border border-grid hover:bg-container-high hover:border-outline",
  ghost:
    "bg-transparent text-on-surface-variant border border-transparent hover:bg-container-high hover:text-on-surface",
  danger:
    "bg-transparent text-error border border-error/60 hover:bg-error-container/40",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-2 gap-1 text-label-md",
  md: "h-10 px-3 gap-2 text-label-lg",
  lg: "h-12 px-5 gap-2 text-label-lg",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center rounded font-mono uppercase tracking-wide transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border border-current border-t-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
