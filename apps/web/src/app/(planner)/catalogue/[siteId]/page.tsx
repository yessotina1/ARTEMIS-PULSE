import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { SiteDetailView } from "@/features/catalogue/site-detail-view";

// Route bloquante : données de démonstration chargées côté serveur.
export const instant = false;

export const metadata: Metadata = { title: "Fiche du site" };

export default async function SiteDetailPage({ params }: PageProps<"/catalogue/[siteId]">) {
  const { siteId } = await params;
  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Fiche détaillée du site"
        breadcrumb={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/catalogue", label: "Catalogue" },
          { label: "Site" },
        ]}
        actions={
          <Link href="/catalogue">
            <Button variant="secondary">Retour au catalogue</Button>
          </Link>
        }
      />
      <SiteDetailView siteId={siteId} />
    </>
  );
}
