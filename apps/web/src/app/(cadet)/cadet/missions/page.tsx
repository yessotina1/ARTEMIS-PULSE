import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { MissionSelectionView } from "@/features/education/cadet-views";
export const metadata: Metadata={title:"Missions · Apprenant"};
export default function MissionsPage(){return <><PageHeader eyebrow="Parcours apprenant" title="Missions lunaires" description="Choisissez un objectif de découverte, du relief local aux régions polaires."/><MissionSelectionView/></>;}
