"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

const educatorItems = [
  { href: "/educator", label: "Tableau de bord", icon: "grid" as const },
  { href: "/educator/classes", label: "Classes", icon: "user" as const },
  { href: "/educator/activities", label: "Activités", icon: "book" as const },
  { href: "/educator/results", label: "Résultats", icon: "chart" as const },
  { href: "/educator/resources", label: "Ressources", icon: "layers" as const },
  { href: "/educator/atlas", label: "Atlas pédagogique", icon: "map" as const },
];
const learnerItems = [
  { href: "/cadet/missions", label: "Missions", icon: "target" as const },
  { href: "/cadet/atlas", label: "Atlas lunaire", icon: "map" as const },
  { href: "/cadet/progression", label: "Progression", icon: "chart" as const },
];

export function EducationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const explorer = pathname.startsWith("/exploration");
  const educator = pathname.startsWith("/educator");
  const items = educator ? educatorItems : learnerItems.map((item) => ({
    ...item,
    href: explorer ? item.href.replace("/cadet", "/exploration") : item.href,
  }));
  const title = educator ? "Espace Éducateur" : explorer ? "Espace Explorateur" : "Parcours apprenant";
  const home = educator ? "/educator" : explorer ? "/exploration" : "/cadet/missions";
  return (
    <div className="min-h-screen bg-container-lowest text-on-surface">
      <header className="border-b border-outline-variant bg-container-low">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 md:px-6">
          <Link href={home} className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded border border-primary/40 text-primary"><Icon name="moon" size={17} /></span>
            <span><span className="block font-heading text-headline-sm">ARTEMIS PULSE</span><span className="block font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">{title} · Démo</span></span>
          </Link>
          <Link href="/dashboard" className="font-mono text-label-md text-primary hover:underline">← Espace Planificateur</Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-3 px-3 py-3 md:grid-cols-[210px_minmax(0,1fr)] md:px-6">
        <nav aria-label={`Navigation · ${title}`} className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex shrink-0 items-center gap-2 rounded border px-2 py-2 text-body-md", active ? "border-primary/40 bg-primary/10 text-primary" : "border-transparent text-on-surface-variant hover:border-grid hover:bg-container-high")}><Icon name={item.icon} size={15} />{item.label}</Link>;
          })}
          {!educator && <Link href="/exploration" aria-current={explorer ? "page" : undefined} className={cn("flex shrink-0 items-center gap-2 rounded border px-2 py-2 text-body-md", explorer ? "border-primary/40 bg-primary/10 text-primary" : "border-transparent text-on-surface-variant hover:border-grid hover:bg-container-high")}><Icon name="globe" size={15} />Espace Explorateur</Link>}
          {!educator && <Link href="/educator" className="flex shrink-0 items-center gap-2 rounded border border-transparent px-2 py-2 text-body-md text-on-surface-variant hover:border-grid hover:bg-container-high"><Icon name="book" size={15} />Espace Éducateur</Link>}
        </nav>
        <main id="contenu" className="min-w-0">{children}</main>
      </div>
      <footer className="border-t border-outline-variant px-3 py-2 text-center text-body-sm text-on-surface-variant">Données pédagogiques de démonstration · pseudonymes uniquement · aucun compte apprenant réel.</footer>
    </div>
  );
}
