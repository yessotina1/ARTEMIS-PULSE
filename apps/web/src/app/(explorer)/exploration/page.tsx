import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { MissionSelectionView } from "@/features/education/cadet-views";
export const metadata: Metadata={title:"Exploration lunaire"};
export default function ExplorationPage(){return <><PageHeader eyebrow="Espace Explorateur" title="Explorer et apprendre" description="Parcourez des missions pédagogiques et des sites lunaires à partir des données de démonstration."/><MissionSelectionView/></>;}
