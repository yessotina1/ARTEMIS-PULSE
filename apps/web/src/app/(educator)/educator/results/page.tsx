import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ResultsView } from "@/features/education/results-view";
export const metadata: Metadata = { title: "Résultats · Éducateur" };
export default function ResultsPage(){return <><PageHeader eyebrow="Éducateur · Évaluation" title="Résultats de classe" description="Analysez les scores de démonstration associés uniquement à des pseudonymes."/><ResultsView/></>;}
