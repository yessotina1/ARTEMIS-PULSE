import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

// Route bloquante : données de démonstration chargées côté serveur.
export const instant = false;

export default async function SiteDetailPage({ params }: PageProps<"/catalogue/[siteId]">) {
  const { siteId } = await params;
  return (
    <>
      <PageHeader eyebrow="Catalogue" title={`Site ${siteId}`} />
      <EmptyState title="Fiche détaillée en préparation" />
    </>
  );
}
