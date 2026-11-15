import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

type MetricProps = {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  /** Précision pour les valeurs numériques. */
  digits?: number;
  hint?: string;
  icon?: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
  valueClassName?: string;
};

/** Cartouche métrique : libellé + valeur tabulaire + unité accolée. */
export function Metric({
  label,
  value,
  unit,
  digits = 0,
  hint,
  icon,
  size = "md",
  className,
  valueClassName,
}: MetricProps) {
  const display =
    typeof value === "number" ? formatNumber(value, digits) : value?.toString() || "—";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="flex items-center gap-1 font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "font-mono tabular text-on-surface",
          size === "lg" ? "text-headline-lg leading-8" : "text-data-display",
          valueClassName,
        )}
      >
        {display}
        {unit ? (
          <span className="ml-1 font-mono text-label-sm text-on-surface-variant">{unit}</span>
        ) : null}
      </p>
      {hint ? <p className="text-body-sm text-on-surface-variant">{hint}</p> : null}
    </div>
  );
}
