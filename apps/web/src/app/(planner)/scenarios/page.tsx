import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Icon } from "@/components/ui";
import { ScenariosView } from "@/features/scenarios/scenarios-view";

export const metadata: Metadata = { title: "Mes scénarios" };

export default function ScenariosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Planificateur"
        title="Mes scénarios"
        description="Scénarios sauvegardés, derniers runs et accès aux analyses."
        actions={
          <Link href="/analyses/nouvelle">
            <Button>
              <Icon name="plus" size={14} />
              Nouvelle analyse
            </Button>
          </Link>
        }
      />
      <ScenariosView />
    </>
  );
}
