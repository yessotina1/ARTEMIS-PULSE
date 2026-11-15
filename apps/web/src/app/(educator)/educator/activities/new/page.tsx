import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityEditor } from "@/features/education/activity-editor";
export const metadata: Metadata = { title: "Créer une activité · Éducateur" };
export default function NewActivityPage(){return <><PageHeader eyebrow="Éducateur · Éditeur" title="Créer une séance guidée" description="Rédigez un parcours pédagogique de démonstration, sans publier de données vers un service."/><ActivityEditor/></>;}
