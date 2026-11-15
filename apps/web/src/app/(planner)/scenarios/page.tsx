import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

export default function ScenariosPage() {
  return (
    <>
      <PageHeader eyebrow="Planificateur" title="Mes scénarios" />
      <EmptyState title="Liste des scénarios en préparation" />
    </>
  );
}
