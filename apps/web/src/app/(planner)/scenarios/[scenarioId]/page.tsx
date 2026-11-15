import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

// Route bloquante : données de démonstration chargées côté serveur.
export const instant = false;

export default async function ScenarioDetailPage({
  params,
}: PageProps<"/scenarios/[scenarioId]">) {
  const { scenarioId } = await params;
  return (
    <>
      <PageHeader eyebrow="Scénario" title={`Scénario ${scenarioId}`} />
      <EmptyState title="Détail du scénario en préparation" />
    </>
  );
}
