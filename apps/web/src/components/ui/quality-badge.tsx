import { Icon } from "./icons";
import { Badge } from "./badge";
import type { QualityLevel } from "@/types/enums";

const config = {
  VALIDATED: { label: "VALIDÉ", icon: "check-circle" as const, tone: "success" as const },
  ESTIMATED: { label: "ESTIMÉ", icon: "tilde" as const, tone: "info" as const },
  LOW: { label: "FAIBLE QUALITÉ", icon: "alert-triangle" as const, tone: "warning" as const },
  UNCOMPUTABLE: {
    label: "NON CALCULABLE",
    icon: "minus-circle" as const,
    tone: "danger" as const,
  },
} satisfies Record<
  QualityLevel,
  {
    label: string;
    icon: "check-circle" | "tilde" | "alert-triangle" | "minus-circle";
    tone: "success" | "info" | "warning" | "danger";
  }
>;

/** Badge de qualité de calcul : couleur + icône + libellé. */
export function QualityBadge({
  value,
  className,
}: {
  value: QualityLevel;
  className?: string;
}) {
  const item = config[value];
  return (
    <Badge tone={item.tone} icon={<Icon name={item.icon} size={13} />} className={className}>
      {item.label}
    </Badge>
  );
}

export function qualityLabel(value: QualityLevel): string {
  return config[value].label;
}
