import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ExplorerView } from "@/features/lunar-explorer/explorer-view";

export const metadata: Metadata = { title: "Explorer la Lune" };

export default function ExplorerPage() {
  return (
    <>
      <PageHeader
        eyebrow="Cartographie"
        title="Explorer la Lune"
        description="Cartographie polaire sud et globe 3D des sites d'atterrissage candidats."
      />
      <ExplorerView />
    </>
  );
}
