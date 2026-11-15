import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

export default function ReportsPage() {
  return (
    <>
      <PageHeader eyebrow="Rapports" title="Rapports de mission" />
      <EmptyState title="Rapports en préparation" />
    </>
  );
}
