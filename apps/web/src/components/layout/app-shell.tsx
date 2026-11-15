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
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-2 focus:py-1 focus:font-mono focus:text-on-primary"
      >
        Aller au contenu
      </a>

      {/* Barre latérale desktop */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-outline-variant bg-container-low px-2 py-3 lg:flex">
        <Link href="/dashboard" className="mb-5 flex items-center gap-2 px-2">
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
        <div className="mt-5">
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
        inert={!mobileOpen}
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
            "relative flex h-full w-72 flex-col border-r border-outline-variant bg-container-low px-2 py-3 transition-transform",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Menu mobile"
        >
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="font-heading text-headline-sm">ARTEMIS PULSE</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Fermer le menu"
              className="rounded p-1 text-on-surface-variant hover:bg-container-high"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
          <div className="mt-5">
            <DemoBanner />
          </div>
          <SidebarFooter />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-outline-variant bg-container-low/95 backdrop-blur">
          <div className="flex h-14 items-center gap-2 px-margin-mobile md:px-margin">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu de navigation"
              aria-expanded={mobileOpen}
              className="rounded border border-grid p-1 text-on-surface-variant hover:bg-container-high hover:text-on-surface lg:hidden"
            >
              <Icon name="menu" size={18} />
            </button>
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-mono text-label-md uppercase tracking-widest text-on-surface-variant">
                ARTEMIS PULSE
              </span>
              <Badge tone="success">SYS NOMINAL</Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:block">
                <DemoBanner />
              </div>
              <Link
                href="/parametres"
                className="flex items-center gap-1 rounded border border-grid px-2 py-1 text-body-sm text-on-surface-variant hover:border-outline hover:text-on-surface"
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

        <main id="contenu" className="flex-1 px-margin-mobile py-3 md:px-margin">
          {children}
        </main>

        <footer className="border-t border-outline-variant px-margin-mobile py-2 font-mono text-label-sm text-on-surface-variant md:px-margin">
          <p className="flex flex-wrap gap-3">
            <span>Terre visible = visibilité géométrique, pas une garantie de liaison radio</span>
            <span aria-hidden className="hidden text-outline sm:inline">|</span>
            <span>Soleil visible ≠ énergie produite</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
