import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

export default function ExplorerPage() {
  return (
    <>
      <PageHeader eyebrow="Cartographie" title="Explorer la Lune" />
      <EmptyState title="Explorateur en préparation" />
    </>
  );
}
