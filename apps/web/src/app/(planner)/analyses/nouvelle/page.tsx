import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { ScenarioWizard } from "@/features/mission-planner/scenario-wizard";

// Route bloquante : lecture de `searchParams` (site présélectionné).
export const instant = false;

export const metadata: Metadata = { title: "Nouvelle analyse" };

export default async function NewAnalysisPage({
  searchParams,
}: PageProps<"/analyses/nouvelle">) {
  const params = await searchParams;
  const siteParam = params.siteId;

  return (
    <>
      <PageHeader
        eyebrow="Nouvelle analyse"
        title="Assistant de scénario"
        description="Site, fenêtre temporelle UTC, observateur puis récapitulatif. Le calcul est lancé côté API."
        breadcrumb={[
          { href: "/dashboard", label: "Tableau de bord" },
          { label: "Nouvelle analyse" },
        ]}
        actions={
          <Link href="/scenarios">
            <Button variant="secondary">Mes scénarios</Button>
          </Link>
        }
      />
      <ScenarioWizard initialSiteId={typeof siteParam === "string" ? siteParam : undefined} />
    </>
  );
}
