import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ComparatorView } from "@/features/comparator/comparator-view";

// Route bloquante : scénarios présélectionnés dans l'URL.
export const instant = false;

export const metadata: Metadata = { title: "Comparateur" };

export default async function ComparatorPage({
  searchParams,
}: PageProps<"/comparateur">) {
  const params = await searchParams;
  const scenariosParam = params.scenarios;
  const initialScenarioIds =
    typeof scenariosParam === "string" ? scenariosParam.split(",").filter(Boolean) : [];

  return (
    <>
      <PageHeader
        eyebrow="Comparateur"
        title="Comparaison de scénarios"
        description="Comparez de 2 à 4 scénarios : tableau de synthèse, courbes alignées et score optionnel."
      />
      <ComparatorView initialScenarioIds={initialScenarioIds} />
    </>
  );
}
