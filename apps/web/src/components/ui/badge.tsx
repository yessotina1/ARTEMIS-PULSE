import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "border-outline-variant bg-container-high text-on-surface-variant",
  primary: "border-primary/40 bg-primary/10 text-primary",
  success: "border-quality-validated/50 bg-quality-validated-soft/50 text-quality-validated",
  warning: "border-quality-low/50 bg-quality-low-soft/50 text-quality-low",
  danger: "border-quality-uncomputable/50 bg-quality-uncomputable-soft/50 text-error",
  info: "border-quality-estimated/50 bg-quality-estimated-soft/50 text-quality-estimated",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  icon?: React.ReactNode;
};

export function Badge({ tone = "neutral", icon, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-xs rounded-sm border px-xs font-mono text-label-sm uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}
