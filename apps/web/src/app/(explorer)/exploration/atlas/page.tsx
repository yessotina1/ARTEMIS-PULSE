import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { AtlasView } from "@/features/education/atlas-view";
export const metadata: Metadata={title:"Atlas lunaire · Explorateur"};
export default function ExplorerAtlasPage(){return <><PageHeader eyebrow="Espace Explorateur" title="Atlas lunaire interactif" description="Sélectionnez un site dans la carte ou la liste pour consulter sa fiche pédagogique."/><AtlasView/></>;}
