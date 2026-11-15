"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import { PLANNER_NAV } from "./nav-config";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation principale" className="flex flex-col gap-1">
      {PLANNER_NAV.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded border border-transparent px-2 py-1 text-body-md transition-colors",
              active
                ? "border-primary/30 bg-primary/10 text-primary"
                : "text-on-surface-variant hover:border-outline-variant hover:bg-container-high hover:text-on-surface",
            )}
          >
            <Icon name={item.icon} size={15} className="shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SidebarFooter() {
  return (
    <div className="mt-auto space-y-1 border-t border-outline-variant px-2 pt-2 font-mono text-label-sm text-on-surface-variant">
      <p className="flex items-center gap-1">
        <span aria-hidden className="size-1.5 rounded-full bg-quality-validated" />
        DE440 / MOON
      </p>
      <p>Version des données 2029.1</p>
      <Link href="/documentation" className="block text-primary hover:underline">
        Hypothèses et limites
      </Link>
    </div>
  );
}
