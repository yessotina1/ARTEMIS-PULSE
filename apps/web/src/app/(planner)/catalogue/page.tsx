import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CatalogueView } from "@/features/catalogue/catalogue-view";

export const metadata: Metadata = { title: "Catalogue des sites" };

export default function CataloguePage() {
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Sites & balises géodésiques"
        description="Base de données géodésique des zones d'atterrissage, sites historiques et cibles polaires."
      />
      <CatalogueView />
    </>
  );
}
