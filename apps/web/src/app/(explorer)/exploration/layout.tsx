import { Suspense } from "react";
import { EducationShell } from "@/features/education/education-shell";
export default function ExplorationLayout({children}:LayoutProps<"/exploration">){return <Suspense fallback={<main className="min-h-screen bg-container-lowest" aria-busy="true" />}><EducationShell>{children}</EducationShell></Suspense>;}
