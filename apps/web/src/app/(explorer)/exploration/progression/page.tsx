import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressView } from "@/features/education/cadet-views";
export const metadata: Metadata={title:"Carnet · Explorateur"};
export default function ExplorerProgressPage(){return <><PageHeader eyebrow="Espace Explorateur" title="Carnet d'exploration" description="Progression locale illustrative, sans profil personnel enregistré."/><ProgressView/></>;}
