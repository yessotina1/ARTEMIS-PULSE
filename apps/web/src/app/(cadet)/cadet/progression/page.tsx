import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressView } from "@/features/education/cadet-views";
export const metadata: Metadata={title:"Progression · Apprenant"};
export default function ProgressionPage(){return <><PageHeader eyebrow="Parcours apprenant" title="Progression" description="Un aperçu pédagogique anonyme, non sauvegardé entre les sessions."/><ProgressView/></>;}
