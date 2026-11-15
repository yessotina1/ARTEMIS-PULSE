import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/features/reports/reports-view";

export const metadata: Metadata = { title: "Rapports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Rapports"
        title="Rapports de mission"
        description="Exports des scénarios, comparaisons et runs de calcul."
      />
      <ReportsView />
    </>
  );
}
