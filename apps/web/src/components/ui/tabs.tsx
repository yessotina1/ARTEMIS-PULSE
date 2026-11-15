"use client";

import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";

export type TabItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
};

/**
 * Barre d'onglets accessible (flèches gauche/droite, Home/End).
 * Le contenu est rendu par le consommateur via `TabsPanel`.
 */
export function Tabs({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  panelIdPrefix,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
  panelIdPrefix?: string;
}) {
  const fallbackId = useId();
  const prefix = panelIdPrefix ?? fallbackId;
  const listRef = useRef<HTMLDivElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    let next = index;
    if (event.key === "ArrowRight") next = index === last ? 0 : index + 1;
    else if (event.key === "ArrowLeft") next = index === 0 ? last : index - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    else return;
    event.preventDefault();
    onChange(items[next].id);
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[next]?.focus();
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap gap-1 border-b border-outline-variant", className)}
    >
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${prefix}-tab-${item.id}`}
            aria-selected={selected}
            aria-controls={`${prefix}-panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "-mb-px inline-flex items-center gap-1 border-b-2 px-3 py-2 font-mono text-label-md uppercase tracking-wider transition-colors",
              selected
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:border-outline hover:text-on-surface",
            )}
          >
            {item.icon}
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}

export function TabsPanel({
  id,
  value,
  children,
  className,
  panelIdPrefix,
}: {
  id: string;
  value: string;
  children: React.ReactNode;
  className?: string;
  panelIdPrefix?: string;
}) {
  const fallbackId = useId();
  const prefix = panelIdPrefix ?? fallbackId;
  if (id !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${prefix}-panel-${id}`}
      aria-labelledby={`${prefix}-tab-${id}`}
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
}
