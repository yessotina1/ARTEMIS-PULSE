import { cn } from "@/lib/cn";
import { Icon } from "./icons";

const DEFAULT_LIMITS = [
  "Terre visible = visibilité géométrique, pas une garantie de liaison radio",
  "Soleil visible ≠ énergie produite",
];

/** Bannière d'hypothèses et limites scientifiques (DESIGN.md §3). */
export function AssumptionBanner({
  title = "Hypothèses et limites",
  model,
  limits = DEFAULT_LIMITS,
  source,
  version,
  tone = "primary",
  href,
  className,
  compact,
}: {
  title?: string;
  /** Modèle d'élévation / éphémérides utilisé. */
  model?: string;
  limits?: string[];
  source?: string;
  version?: string;
  tone?: "primary" | "warning";
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        "hatched rounded border border-outline-variant bg-container-low px-3 py-2",
        tone === "primary" ? "border-l-[3px] border-l-primary" : "border-l-[3px] border-l-quality-low",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <h2 className="flex items-center gap-1 font-mono text-label-md uppercase tracking-wider text-on-surface">
          <Icon name="info" size={14} className="text-primary" />
          {title}
        </h2>
        {href ? (
          <a
            href={href}
            className="font-mono text-label-sm text-primary underline-offset-2 hover:underline"
          >
            Hypothèses et limites
          </a>
        ) : null}
      </div>
      <ul
        className={cn(
          "mt-1 space-y-1 text-body-sm text-on-surface-variant",
          !compact && "sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0",
        )}
      >
        {limits.map((limit) => (
          <li key={limit} className="flex items-start gap-1">
            <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-outline" />
            {limit}
          </li>
        ))}
      </ul>
      {model || source || version ? (
        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t border-outline-variant/60 pt-1 font-mono text-label-sm text-on-surface-variant">
          {model ? <span>Modèle : {model}</span> : null}
          {source ? <span>Source : {source}</span> : null}
          {version ? <span>Version : {version}</span> : null}
        </p>
      ) : null}
    </section>
  );
}
