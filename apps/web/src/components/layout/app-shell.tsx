"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { Badge, DemoBanner, Icon } from "@/components/ui";
import {
  getServerSessionSnapshot,
  getSessionSnapshot,
  subscribeSession,
} from "@/lib/auth/session";
import { PROFILE_LABELS } from "@/types";
import { SidebarFooter, SidebarNav } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  return (
    <div className="flex min-h-screen">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-sm focus:py-xs focus:font-mono focus:text-on-primary"
      >
        Aller au contenu
      </a>

      {/* Barre latérale desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-outline-variant bg-container-low px-sm py-md lg:flex">
        <Link href="/dashboard" className="mb-lg flex items-center gap-sm px-sm">
          <span aria-hidden className="grid size-7 place-items-center rounded border border-primary/40 text-primary">
            <Icon name="moon" size={16} />
          </span>
          <span>
            <span className="block font-heading text-headline-sm leading-none tracking-tight">
              ARTEMIS PULSE
            </span>
            <span className="font-mono text-label-sm uppercase tracking-widest text-on-surface-variant">
              Planification lunaire
            </span>
          </span>
        </Link>
        <SidebarNav />
        <div className="mt-lg">
          <DemoBanner />
        </div>
        <SidebarFooter />
      </aside>

      {/* Tiroir mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/70 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />
        <aside
          className={cn(
            "relative flex h-full w-72 flex-col border-r border-outline-variant bg-container-low px-sm py-md transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Menu mobile"
        >
          <div className="mb-md flex items-center justify-between px-sm">
            <span className="font-heading text-headline-sm">ARTEMIS PULSE</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
              className="rounded p-xs text-on-surface-variant hover:bg-container-high"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
          <div className="mt-lg">
            <DemoBanner />
          </div>
          <SidebarFooter />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-outline-variant bg-container-low/95 backdrop-blur">
          <div className="flex h-14 items-center gap-sm px-margin-mobile md:px-margin">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu de navigation"
              aria-expanded={mobileOpen}
              className="rounded border border-grid p-xs text-on-surface-variant hover:bg-container-high hover:text-on-surface lg:hidden"
            >
              <Icon name="menu" size={18} />
            </button>
            <div className="flex min-w-0 items-center gap-sm">
              <span className="hidden font-mono text-label-md uppercase tracking-widest text-on-surface-variant sm:inline">
                ARTEMIS PULSE
              </span>
              <Badge tone="success">SYS NOMINAL</Badge>
            </div>
            <div className="ml-auto flex items-center gap-sm">
              <DemoBanner className="hidden md:inline-flex" />
              <Link
                href="/parametres"
                className="flex items-center gap-xs rounded border border-grid px-sm py-xs text-body-sm text-on-surface-variant hover:border-outline hover:text-on-surface"
              >
                <Icon name="user" size={14} />
                <span className="hidden sm:inline">
                  {session
                    ? `${session.user.fullName} · ${PROFILE_LABELS[session.user.profile]}`
                    : "Se connecter"}
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main id="contenu" className="flex-1 px-margin-mobile py-md md:px-margin">
          {children}
        </main>

        <footer className="border-t border-outline-variant px-margin-mobile py-sm font-mono text-label-sm text-on-surface-variant md:px-margin">
          <p className="flex flex-wrap gap-md">
            <span>Terre visible = visibilité géométrique, pas une garantie de liaison radio</span>
            <span aria-hidden className="hidden text-outline sm:inline">|</span>
            <span>Soleil visible ≠ énergie produite</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
