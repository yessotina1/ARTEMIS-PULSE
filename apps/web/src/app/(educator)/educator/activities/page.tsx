import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ActivitiesView } from "@/features/education/activities-view";
export const metadata: Metadata = { title: "Activités · Éducateur" };
export default function ActivitiesPage(){return <><PageHeader eyebrow="Éducateur" title="Activités pédagogiques" description="Consultez les séances guidées, quiz et missions de démonstration."/><ActivitiesView/></>;}
