import { cn } from "@/lib/cn";
import { USE_MOCKS } from "@/lib/env";

/** Bandeau discret affiché tant que NEXT_PUBLIC_USE_MOCKS=true. */
export function DemoBanner({ className }: { className?: string }) {
  if (!USE_MOCKS) return null;
  return (
    <p
      className={cn(
        "inline-flex items-center gap-xs font-mono text-label-sm uppercase tracking-wider text-on-surface-variant/80",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-quality-low" />
      Données de démonstration
    </p>
  );
}
