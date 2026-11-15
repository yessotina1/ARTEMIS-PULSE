import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { AnalysisView } from "@/features/mission-planner/analysis-view";

// Route bloquante : identifiant de run lu dans l'URL.
export const instant = false;

export const metadata: Metadata = { title: "Espace d'analyse" };

export default async function AnalysisPage({ params }: PageProps<"/analyses/[runId]">) {
  const { runId } = await params;
  return (
    <>
      <PageHeader
        eyebrow="Espace d'analyse"
        title="Soleil / Terre — scénario calculé"
        breadcrumb={[
          { href: "/dashboard", label: "Tableau de bord" },
          { href: "/scenarios", label: "Mes scénarios" },
          { label: runId },
        ]}
        actions={
          <Link href="/scenarios">
            <Button variant="secondary">Mes scénarios</Button>
          </Link>
        }
      />
      <AnalysisView runId={runId} />
    </>
  );
}
