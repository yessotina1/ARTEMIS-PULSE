import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ClassesView } from "@/features/education/classes-view";
export const metadata: Metadata = { title: "Classes · Éducateur" };
export default function ClassesPage(){return <><PageHeader eyebrow="Éducateur" title="Gestion des classes" description="Créez des cohortes de démonstration et partagez un code d'accès non connecté à un backend."/><ClassesView/></>;}
