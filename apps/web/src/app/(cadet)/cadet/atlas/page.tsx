import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { AtlasView } from "@/features/education/atlas-view";
export const metadata: Metadata={title:"Atlas lunaire · Apprenant"};
export default function CadetAtlasPage(){return <><PageHeader eyebrow="Parcours apprenant" title="Atlas lunaire" description="Explorez les sites de démonstration et leurs repères pédagogiques."/><AtlasView/></>;}
