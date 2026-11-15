import type { IconName } from "@/components/ui";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

export const PLANNER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: "grid" },
  { href: "/explorer", label: "Explorer la Lune", icon: "globe" },
  { href: "/catalogue", label: "Catalogue", icon: "layers" },
  { href: "/analyses/nouvelle", label: "Nouvelle analyse", icon: "spark" },
  { href: "/scenarios", label: "Mes scénarios", icon: "chart" },
  { href: "/comparateur", label: "Comparateur", icon: "sliders" },
  { href: "/rapports", label: "Rapports", icon: "file" },
  { href: "/documentation", label: "Documentation", icon: "book" },
  { href: "/parametres", label: "Paramètres", icon: "settings" },
  { href: "/educator", label: "Espace Éducateur", icon: "book" },
  { href: "/exploration", label: "Espace Explorateur", icon: "compass" },
];

export const PUBLIC_NAV: NavItem[] = [
  { href: "/", label: "Accueil", icon: "grid" },
  { href: "/sites/shackleton-rim-001", label: "Fiche publique", icon: "layers" },
  { href: "/demo", label: "Démonstration", icon: "moon" },
];
