import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { AtlasView } from "@/features/education/atlas-view";
export const metadata: Metadata = { title: "Atlas lunaire · Éducateur" };
export default function EducatorAtlasPage(){return <><PageHeader eyebrow="Éducateur · Support de cours" title="Atlas sélénographique pédagogique" description="Explorez la carte polaire et contextualisez les sites avec leurs sources, qualité et limites."/><AtlasView/></>;}
