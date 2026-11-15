import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { EducatorDashboard } from "@/features/education/educator-dashboard";

export const metadata: Metadata = { title: "Espace Éducateur" };

export default function EducatorPage() {
  return <><PageHeader eyebrow="Console pédagogique" title="Tableau de bord enseignant" description="Cohortes, activités et résultats anonymisés des séances lunaires."/><EducatorDashboard/></>;
}
