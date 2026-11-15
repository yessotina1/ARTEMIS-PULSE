"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Icon, Timestamp } from "@/components/ui";
import { ACTIVITIES } from "./mock-data";

export function ActivitiesView() {
  const [activities, setActivities] = useState(ACTIVITIES);
  function toggle(id: string) {
    setActivities((items)=>items.map((item)=>item.id===id?{...item,status:item.status==="DRAFT"?"PUBLISHED" as const:"DRAFT" as const,updatedAtUtc:new Date().toISOString()}:item));
  }
  return <div className="space-y-3"><div className="flex flex-wrap gap-2"><Link href="/educator/activities/new"><Button><Icon name="plus" size={14}/>Créer une séance guidée</Button></Link><Link href="/educator/quizzes/new"><Button variant="secondary"><Icon name="file" size={14}/>Créer un quiz</Button></Link></div><div className="grid gap-3 lg:grid-cols-2">{activities.map((activity)=><Card key={activity.id}><CardHeader eyebrow={activity.kind==="QUIZ"?"Évaluation":activity.kind==="GUIDED"?"Séance guidée":"Mission pédagogique"} title={activity.title} icon={<Icon name={activity.kind==="QUIZ"?"check-circle":"book"} size={16}/>} actions={<Badge tone={activity.status==="PUBLISHED"?"success":"warning"}>{activity.status==="PUBLISHED"?"Publié":"Brouillon"}</Badge>}/><CardBody className="space-y-2"><p className="text-body-md text-on-surface-variant">Durée estimée : {activity.durationMinutes} min · achèvement de démonstration : {activity.completionPercent}%</p><p className="font-mono text-label-sm text-on-surface-variant">Dernière mise à jour <Timestamp value={activity.updatedAtUtc} variant="compact"/></p><div className="flex flex-wrap gap-2 border-t border-outline-variant pt-2"><Link href={activity.kind==="QUIZ"?"/educator/quizzes/new":"/educator/activities/new"}><Button size="sm" variant="secondary">Modifier</Button></Link><Button size="sm" variant={activity.status==="PUBLISHED"?"ghost":"secondary"} onClick={()=>toggle(activity.id)}>{activity.status==="PUBLISHED"?"Dépublier":"Publier (démo)"}</Button></div></CardBody></Card>)}</div></div>;
}
