import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Icon } from "@/components/ui";
import { DashboardView } from "@/features/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Console planificateur"
        title="Tableau de bord"
        description="État de la télémétrie, runs récents et scénarios en cours."
        actions={
          <>
            <Link href="/catalogue">
              <Button variant="secondary">
                <Icon name="layers" size={14} />
                Catalogue
              </Button>
            </Link>
            <Link href="/analyses/nouvelle">
              <Button>
                <Icon name="spark" size={14} />
                Nouvelle analyse
              </Button>
            </Link>
          </>
        }
      />
      <DashboardView />
    </>
  );
}
