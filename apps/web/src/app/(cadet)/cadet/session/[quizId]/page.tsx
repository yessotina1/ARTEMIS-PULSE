import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { QuizSessionView } from "@/features/education/cadet-views";
export const metadata: Metadata={title:"Session apprenant · Démonstration"};
export default async function CadetSessionPage({params}:PageProps<"/cadet/session/[quizId]">){const {quizId}=await params;return <><PageHeader eyebrow={`Session · ${quizId}`} title="Quiz pédagogique" description="Répondez à une courte activité. Les réponses restent dans le navigateur et ne sont pas envoyées."/><QuizSessionView/></>;}
