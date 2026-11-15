import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { SiteLessonView } from "@/features/education/site-lesson-view";
export const metadata: Metadata={title:"Fiche pédagogique · Explorateur"};
export default async function ExplorerSitePage({params}:PageProps<"/exploration/sites/[siteId]">){const {siteId}=await params;return <><PageHeader eyebrow="Espace Explorateur · Fiche pédagogique" title="Étudier un site lunaire" description="Données de référence, qualité, source et question guidée."/><SiteLessonView siteId={siteId}/></>;}
