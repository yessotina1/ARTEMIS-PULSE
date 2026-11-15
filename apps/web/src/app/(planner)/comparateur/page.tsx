import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

export default function ComparatorPage() {
  return (
    <>
      <PageHeader eyebrow="Comparateur" title="Comparaison de scénarios" />
      <EmptyState title="Comparateur en préparation" />
    </>
  );
}
