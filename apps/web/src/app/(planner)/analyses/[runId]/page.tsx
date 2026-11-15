import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

// Route bloquante : données de démonstration chargées côté serveur.
export const instant = false;

export default async function AnalysisPage({ params }: PageProps<"/analyses/[runId]">) {
  const { runId } = await params;
  return (
    <>
      <PageHeader eyebrow="Analyse" title={`Run ${runId}`} />
      <EmptyState title="Espace d'analyse en préparation" />
    </>
  );
}
