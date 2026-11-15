import Link from "next/link";
import { Badge, Button, Card, CardBody, CardHeader, Icon } from "@/components/ui";

const resources = [
  { id:"horizon", title:"Pourquoi le relief masque-t-il le Soleil ?", type:"Séance guidée", duration:"25 min", summary:"Explorez l'horizon topographique et l'insolation rasante avec un site polaire.", href:"/educator/activities/new", tag:"Géométrie" },
  { id:"atlas", title:"Atlas sélénographique pédagogique", type:"Atlas interactif", duration:"À explorer", summary:"Comparez des sites lunaires et leurs données de référence documentées.", href:"/cadet/atlas", tag:"Cartographie" },
  { id:"quiz", title:"Sélénodésie & insolation au pôle Sud", type:"Quiz de démonstration", duration:"15 min", summary:"Trois questions sur la visibilité géométrique, le relief et les sources.", href:"/cadet/session/quiz-704", tag:"Évaluation" },
  { id:"mission", title:"Concevoir un rover pour une zone d'ombre", type:"Mission interactive", duration:"35 min", summary:"Choisissez des objectifs et observez les compromis d'une mission simulée.", href:"/cadet/missions", tag:"Simulation" },
];

export function ResourcesView() {
  return <div className="grid gap-3 md:grid-cols-2">{resources.map((resource)=><Card key={resource.id}><CardHeader eyebrow={resource.type} title={resource.title} icon={<Icon name="book" size={16}/>} actions={<Badge tone="info">{resource.tag}</Badge>}/><CardBody className="flex min-h-36 flex-col gap-2"><p className="text-body-md text-on-surface-variant">{resource.summary}</p><div className="mt-auto flex items-center justify-between gap-2 border-t border-outline-variant pt-2"><span className="font-mono text-label-md text-on-surface-variant">{resource.duration}</span><Link href={resource.href}><Button size="sm" variant="secondary">Ouvrir<Icon name="arrow-right" size={13}/></Button></Link></div></CardBody></Card>)}</div>;
}
