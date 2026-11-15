"use client";

import Link from "next/link";
import { Badge, Button, Card, CardBody, CardHeader, Icon, Metric, Timestamp } from "@/components/ui";
import { ACTIVITIES, COHORTS, LEARNER_RESULTS } from "./mock-data";

export function EducatorDashboard() {
  const complete = LEARNER_RESULTS.filter((result) => result.status === "COMPLETED");
  const average = Math.round(complete.reduce((sum, result) => sum + result.scorePercent, 0) / Math.max(1, complete.length));
  return <div className="space-y-3">
    <Card accent="primary" className="flex flex-wrap items-center justify-between gap-3 p-3">
      <div><p className="font-mono text-label-md uppercase tracking-widest text-primary">Espace Éducateur · Démonstration</p><h2 className="mt-1 text-headline-lg font-heading">Pilotez vos séances lunaires</h2><p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">Préparez des activités, suivez les cohortes et consultez les résultats anonymisés.</p></div>
      <Link href="/educator/activities/new"><Button><Icon name="plus" size={14}/>Créer une activité</Button></Link>
    </Card>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card><CardBody><Metric label="Cohortes actives" value={COHORTS.length} hint={`${COHORTS.reduce((n, cohort) => n + cohort.activeNow, 0)} apprenants connectés`}/></CardBody></Card>
      <Card><CardBody><Metric label="Séances publiées" value={ACTIVITIES.filter((item) => item.status === "PUBLISHED").length} hint="Activités prêtes à lancer"/></CardBody></Card>
      <Card><CardBody><Metric label="Résultats complétés" value={complete.length} hint="Pseudonymes uniquement"/></CardBody></Card>
      <Card><CardBody><Metric label="Score moyen" value={average} unit="%" hint="Sur les quiz terminés"/></CardBody></Card>
    </div>
    <div className="grid gap-3 xl:grid-cols-2">
      <Card><CardHeader eyebrow="Suivi des cohortes" title="Classes récentes" icon={<Icon name="user" size={16}/>} actions={<Link className="font-mono text-label-md text-primary hover:underline" href="/educator/classes">Gérer →</Link>}/><CardBody className="space-y-2">{COHORTS.map((cohort) => <div key={cohort.id} className="rounded border border-grid bg-container-low p-2"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-body-md">{cohort.name}</p><p className="text-body-sm text-on-surface-variant">{cohort.course}</p></div><Badge tone={cohort.activeNow ? "success" : "neutral"}>{cohort.activeNow} en ligne</Badge></div><div className="mt-2 flex items-center justify-between gap-2 font-mono text-label-sm text-on-surface-variant"><span>{cohort.learners} apprenants · progression {cohort.completionPercent}%</span><span>Code {cohort.accessCode}</span></div><div className="mt-1 h-1.5 rounded bg-container-high"><div className="h-full rounded bg-primary" style={{width:`${cohort.completionPercent}%`}}/></div></div>)}</CardBody></Card>
      <Card><CardHeader eyebrow="Activités et évaluations" title="À reprendre ou à lancer" icon={<Icon name="book" size={16}/>} actions={<Link className="font-mono text-label-md text-primary hover:underline" href="/educator/activities">Toutes →</Link>}/><CardBody className="space-y-2">{ACTIVITIES.map((activity) => <div key={activity.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/50 pb-2 last:border-0"><div><p className="text-body-md">{activity.title}</p><p className="font-mono text-label-sm text-on-surface-variant">{activity.kind === "QUIZ" ? "Quiz" : activity.kind === "GUIDED" ? "Séance guidée" : "Mission"} · {activity.durationMinutes} min · modifié <Timestamp value={activity.updatedAtUtc} variant="compact"/></p></div><Badge tone={activity.status === "PUBLISHED" ? "success" : "warning"}>{activity.status === "PUBLISHED" ? "Publié" : "Brouillon"}</Badge></div>)}</CardBody></Card>
    </div>
    <Card><CardHeader eyebrow="Résultats anonymisés" title="Dernières réponses" icon={<Icon name="chart" size={16}/>} actions={<Link href="/educator/results"><Button size="sm" variant="secondary">Analyse de classe</Button></Link>}/><CardBody className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><caption className="sr-only">Derniers résultats anonymisés des apprenants</caption><thead><tr className="border-b border-outline-variant font-mono text-label-sm text-on-surface-variant"><th scope="col" className="py-1">Pseudonyme</th><th scope="col">Cohorte</th><th scope="col">Résultat</th><th scope="col">Dernière activité UTC</th></tr></thead><tbody>{LEARNER_RESULTS.slice(0,4).map((row)=><tr key={row.id} className="border-b border-outline-variant/40 text-body-md last:border-0"><td className="py-2">{row.pseudonym}</td><td>{COHORTS.find((c)=>c.id===row.cohortId)?.name ?? "—"}</td><td>{row.status === "COMPLETED" ? `${row.scorePercent}%` : "En cours"}</td><td><Timestamp value={row.completedAtUtc} variant="compact"/></td></tr>)}</tbody></table></CardBody></Card>
  </div>;
}
