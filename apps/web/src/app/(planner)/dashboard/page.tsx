import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

export default function DashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Console planificateur" title="Tableau de bord" />
      <EmptyState title="Tableau de bord en préparation" />
    </>
  );
}
