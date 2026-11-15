import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { ScenarioDetailView } from "@/features/scenarios/scenario-detail-view";

// Route bloquante : identifiant de scénario lu dans l'URL.
export const instant = false;

export const metadata: Metadata = { title: "Scénario" };

export default async function ScenarioDetailPage({
  params,
}: PageProps<"/scenarios/[scenarioId]">) {
  const { scenarioId } = await params;
  return (
    <>
      <PageHeader
        eyebrow="Mes scénarios"
        title="Détail du scénario"
        breadcrumb={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/scenarios", label: "Mes scénarios" },
          { label: scenarioId },
        ]}
        actions={
          <Link href="/scenarios">
            <Button variant="secondary">Retour à la liste</Button>
          </Link>
        }
      />
      <ScenarioDetailView scenarioId={scenarioId} />
    </>
  );
}
