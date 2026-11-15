import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ResourcesView } from "@/features/education/resources-view";
export const metadata: Metadata = { title: "Ressources · Éducateur" };
export default function ResourcesPage(){return <><PageHeader eyebrow="Éducateur · Bibliothèque" title="Ressources pédagogiques" description="Séances, atlas et quiz de démonstration prêts à adapter."/><ResourcesView/></>;}
