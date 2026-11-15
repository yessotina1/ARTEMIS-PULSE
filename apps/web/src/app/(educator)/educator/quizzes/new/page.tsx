import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityEditor } from "@/features/education/activity-editor";
export const metadata: Metadata = { title: "Créer un quiz · Éducateur" };
export default function NewQuizPage(){return <><PageHeader eyebrow="Éducateur · Évaluation" title="Concepteur de quiz" description="Composez des questions et un aperçu apprenant local. Le partage serveur attend l'API Education."/><ActivityEditor quiz/></>;}
