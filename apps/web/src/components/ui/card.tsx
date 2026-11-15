import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Couche de surface : 1 = panneau, 2 = widget, 3 = overlay. */
  level?: 1 | 2 | 3;
  active?: boolean;
  accent?: "primary" | "partial" | "occulted" | "none";
};

const levels = {
  1: "bg-container-low border-outline-variant",
  2: "bg-container border-grid",
  3: "bg-container-high border-primary/60",
} as const;

const accents = {
  primary: "border-l-[3px] border-l-primary",
  partial: "border-l-[3px] border-l-visibility-partial",
  occulted: "border-l-[3px] border-l-visibility-occulted",
  none: "",
} as const;

export function Card({
  level = 2,
  active,
  accent = "none",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded border",
        levels[level],
        accents[accent],
        active && "border-primary/50",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  eyebrow,
  icon,
  actions,
  className,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-2 border-b border-outline-variant/60 px-3 py-2",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon ? <span className="text-primary">{icon}</span> : null}
        <div className="min-w-0">
          {eyebrow ? (
            <p className="font-mono text-label-sm uppercase tracking-widest text-on-surface-variant">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-headline-sm font-heading leading-tight text-on-surface">{title}</h2>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-1">{actions}</div> : null}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-t border-outline-variant/60 px-3 py-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}
