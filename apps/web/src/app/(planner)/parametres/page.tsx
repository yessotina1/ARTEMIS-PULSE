import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui";

export default function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Paramètres" title="Profil et préférences" />
      <EmptyState title="Paramètres en préparation" />
    </>
  );
}
