"use client";

import { cn } from "@/lib/cn";
import { Button } from "./button";
import { Card } from "./card";
import { Icon, type IconName } from "./icons";

export function LoadingState({
  label = "Chargement des données…",
  rows = 3,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <Card className={cn("p-md", className)} aria-busy="true" aria-live="polite">
      <p className="flex items-center gap-sm font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border border-primary border-t-transparent"
        />
        {label}
      </p>
      <div className="mt-md space-y-sm" aria-hidden>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-8 animate-pulse rounded-sm border border-outline-variant/50 bg-container-high"
          />
        ))}
      </div>
    </Card>
  );
}

export function EmptyState({
  title,
  description,
  icon = "file",
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: IconName;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col items-center gap-sm p-xl text-center", className)}>
      <span className="rounded-full border border-outline-variant p-sm text-on-surface-variant">
        <Icon name={icon} size={20} />
      </span>
      <h2 className="text-headline-sm font-heading">{title}</h2>
      {description ? (
        <p className="max-w-md text-body-md text-on-surface-variant">{description}</p>
      ) : null}
      {action ? <div className="mt-sm">{action}</div> : null}
    </Card>
  );
}

export function ErrorState({
  title = "Impossible de charger les données",
  message,
  code,
  requestId,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  code?: string;
  requestId?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <Card accent="occulted" className={cn("p-md", className)} role="alert">
      <div className="flex items-start gap-sm">
        <Icon name="alert-triangle" size={18} className="mt-0.5 shrink-0 text-error" />
        <div className="min-w-0 flex-1">
          <h2 className="text-headline-sm font-heading">{title}</h2>
          <p className="mt-xs text-body-md text-on-surface-variant">
            {message ?? "Une erreur est survenue. Réessayez dans quelques instants."}
          </p>
          <p className="mt-sm flex flex-wrap gap-md font-mono text-label-sm text-on-surface-variant">
            {code ? <span>code : {code}</span> : null}
            {requestId ? <span>requestId : {requestId}</span> : null}
          </p>
          {onRetry ? (
            <Button variant="secondary" size="sm" className="mt-sm" onClick={onRetry}>
              Réessayer
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

export function PartialDataNotice({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-sm rounded border border-quality-low/40 bg-quality-low-soft/20 px-md py-sm text-body-sm text-quality-low",
        className,
      )}
      role="status"
    >
      <Icon name="alert-triangle" size={14} className="mt-0.5 shrink-0" />
      <p>{message}</p>
    </div>
  );
}
