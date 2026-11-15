import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

export default function NewAnalysisPage() {
  return (
    <>
      <PageHeader eyebrow="Scénario" title="Nouvelle analyse" />
      <EmptyState title="Assistant de scénario en préparation" />
    </>
  );
}
