import { cn } from "@/lib/cn";
import { formatUtc } from "@/lib/format";
import { Icon } from "./icons";

/** Horodatage strict UTC `YYYY-MM-DD HH:mm UTC` en JetBrains Mono. */
export function Timestamp({
  value,
  variant = "inline",
  className,
}: {
  value: string | Date | null | undefined;
  variant?: "inline" | "block" | "compact";
  className?: string;
}) {
  if (!value) {
    return (
      <span className={cn("font-mono text-label-md text-on-surface-variant", className)}>
        <span aria-hidden>—</span>
        <span className="sr-only">Horodatage indisponible</span>
      </span>
    );
  }

  const formatted = formatUtc(value);

  if (variant === "block") {
    return (
      <span className={cn("flex items-center gap-2", className)}>
        <Icon name="clock" size={14} className="text-on-surface-variant" />
        <time dateTime={new Date(value).toISOString()} className="font-mono text-label-lg tabular">
          {formatted}
        </time>
      </span>
    );
  }

  return (
    <time
      dateTime={new Date(value).toISOString()}
      className={cn(
        "font-mono tabular text-on-surface-variant",
        variant === "compact" ? "text-label-sm" : "text-label-md",
        className,
      )}
    >
      {formatted}
    </time>
  );
}
