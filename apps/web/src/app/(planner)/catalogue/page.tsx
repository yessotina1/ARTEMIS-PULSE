import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

export default function CataloguePage() {
  return (
    <>
      <PageHeader eyebrow="Catalogue" title="Sites lunaires" />
      <EmptyState title="Catalogue en préparation" />
    </>
  );
}
