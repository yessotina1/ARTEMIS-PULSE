import { Badge } from "./badge";
import { Icon } from "./icons";
import type { RunStatus } from "@/types";

const config = {
  QUEUED: { label: "EN FILE", tone: "neutral" as const, icon: "clock" as const },
  RUNNING: { label: "EN COURS", tone: "info" as const, icon: "spark" as const },
  SUCCEEDED: { label: "TERMINÉ", tone: "success" as const, icon: "check-circle" as const },
  FAILED: { label: "ÉCHEC", tone: "danger" as const, icon: "alert-triangle" as const },
};

/** Statut de run : libellé + icône, jamais la couleur seule. */
export function RunStatusBadge({ status, className }: { status: RunStatus; className?: string }) {
  const item = config[status];
  return (
    <Badge
      tone={item.tone}
      icon={<Icon name={item.icon} size={13} className={status === "RUNNING" ? "animate-pulse" : undefined} />}
      className={className}
    >
      {item.label}
    </Badge>
  );
}
