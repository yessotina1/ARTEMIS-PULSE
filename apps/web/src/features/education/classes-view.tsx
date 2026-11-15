"use client";

import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, Field, Icon, Input, Timestamp } from "@/components/ui";
import { COHORTS } from "./mock-data";

export function ClassesView() {
  const [cohorts, setCohorts] = useState(COHORTS);
  const [name, setName] = useState("");
  const [notice, setNotice] = useState("");
  function createCohort(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    const code = `LUNE-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    setCohorts((items) => [{ id: `demo-${Date.now()}`, name: clean, course: "Nouvelle cohorte · démonstration", accessCode: code, learners: 0, activeNow: 0, completionPercent: 0, updatedAtUtc: new Date().toISOString() }, ...items]);
    setName("");
    setNotice(`Cohorte créée localement. Code de démonstration : ${code}`);
  }
  async function copyCode(code: string) {
    try { await navigator.clipboard.writeText(code); setNotice(`Code ${code} copié.`); }
    catch { setNotice(`Code à partager : ${code}`); }
  }
  return <div className="space-y-3">
    <Card><CardHeader eyebrow="Gestion des classes" title="Créer une cohorte" icon={<Icon name="plus" size={16}/>}/><CardBody><form onSubmit={createCohort} className="flex flex-col gap-2 sm:flex-row sm:items-end"><Field label="Nom de la classe ou du groupe" htmlFor="cohort-name" className="flex-1"><Input id="cohort-name" value={name} onChange={(event)=>setName(event.target.value)} placeholder="Ex. Première — Orion" maxLength={80} required/></Field><Button type="submit"><Icon name="plus" size={14}/>Créer la classe</Button></form><p role="status" aria-live="polite" className="mt-2 min-h-5 text-body-sm text-primary">{notice || "Les codes de cette démonstration sont locaux et ne créent pas de compte apprenant."}</p></CardBody></Card>
    {cohorts.length === 0 ? <EmptyState title="Aucune classe" description="Créez une cohorte pour préparer une séance pédagogique."/> : <div className="grid gap-3 lg:grid-cols-2">{cohorts.map((cohort)=><Card key={cohort.id}><CardHeader eyebrow="Cohorte" title={cohort.name} icon={<Icon name="user" size={16}/>} actions={<Badge tone={cohort.activeNow ? "success" : "neutral"}>{cohort.activeNow} connectés</Badge>}/><CardBody className="space-y-2"><p className="text-body-md text-on-surface-variant">{cohort.course}</p><div className="grid grid-cols-2 gap-2"><div className="rounded border border-grid p-2"><p className="font-mono text-label-sm text-on-surface-variant">APPRENANTS</p><p className="font-mono text-data-display">{cohort.learners}</p></div><div className="rounded border border-grid p-2"><p className="font-mono text-label-sm text-on-surface-variant">PROGRESSION MOYENNE</p><p className="font-mono text-data-display">{cohort.completionPercent}%</p></div></div><div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-2"><div><p className="font-mono text-label-sm text-on-surface-variant">CODE D&apos;ACCÈS · DEMO</p><p className="font-mono text-headline-sm text-primary">{cohort.accessCode}</p></div><Button variant="secondary" size="sm" onClick={()=>void copyCode(cohort.accessCode)}><Icon name="file" size={13}/>Copier le code</Button></div><p className="font-mono text-label-sm text-on-surface-variant">Mis à jour <Timestamp value={cohort.updatedAtUtc} variant="compact"/></p></CardBody></Card>)}</div>}
  </div>;
}
