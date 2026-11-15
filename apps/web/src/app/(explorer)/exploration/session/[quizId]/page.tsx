import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { QuizSessionView } from "@/features/education/cadet-views";
export const metadata: Metadata={title:"Activité · Explorateur"};
export default async function ExplorerSessionPage({params}:PageProps<"/exploration/session/[quizId]">){const {quizId}=await params;return <><PageHeader eyebrow={`Espace Explorateur · ${quizId}`} title="Activité interactive" description="Quiz local de démonstration sur la géométrie lunaire."/><QuizSessionView/></>;}
