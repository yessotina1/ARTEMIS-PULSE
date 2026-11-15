import { Icon } from "./icons";
import { Badge } from "./badge";
import type { VisibilityClass } from "@/types/enums";

const config = {
  FULL: {
    label: "Visibilité totale",
    short: "FULL",
    icon: "check-circle" as const,
    tone: "success" as const,
  },
  PARTIAL: {
    label: "Visibilité partielle",
    short: "PARTIAL",
    icon: "alert-triangle" as const,
    tone: "warning" as const,
  },
  OCCULTED: {
    label: "Masquée",
    short: "OCCULTED",
    icon: "eye-off" as const,
    tone: "danger" as const,
  },
  UNKNOWN: {
    label: "Indéterminée",
    short: "UNKNOWN",
    icon: "help-circle" as const,
    tone: "neutral" as const,
  },
} satisfies Record<
  VisibilityClass,
  { label: string; short: string; icon: "check-circle" | "alert-triangle" | "eye-off" | "help-circle"; tone: "success" | "warning" | "danger" | "neutral" }
>;

/**
 * Classe de visibilité : toujours libellé + icône (jamais la couleur seule).
 */
export function VisibilityBadge({
  value,
  variant = "full",
  className,
}: {
  value: VisibilityClass;
  /** `full` = libellé métier + code, `compact` = code seul + icône. */
  variant?: "full" | "compact";
  className?: string;
}) {
  const item = config[value];
  return (
    <Badge
      tone={item.tone}
      icon={<Icon name={item.icon} size={13} />}
      className={className}
      title={`${item.label} (${item.short})`}
    >
      {variant === "full" ? `${item.label} · ${item.short}` : item.short}
    </Badge>
  );
}

export function visibilityLabel(value: VisibilityClass): string {
  return `${config[value].label} (${config[value].short})`;
}
