import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsView } from "@/features/settings/settings-view";

export const metadata: Metadata = { title: "Paramètres" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Paramètres"
        title="Profil et préférences"
        description="Profil d'usage, préférences d'affichage et provenance des données."
      />
      <SettingsView />
    </>
  );
}
