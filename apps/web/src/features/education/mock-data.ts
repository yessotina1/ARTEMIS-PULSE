import type { SiteSummary } from "@/types";

/** Démonstration locale de l'espace éducation, en attente du contrat API education. */
export interface Cohort {
  id: string;
  name: string;
  course: string;
  accessCode: string;
  learners: number;
  activeNow: number;
  completionPercent: number;
  updatedAtUtc: string;
}

export interface LearningActivity {
  id: string;
  title: string;
  kind: "GUIDED" | "QUIZ" | "MISSION";
  status: "DRAFT" | "PUBLISHED";
  durationMinutes: number;
  completionPercent: number;
  updatedAtUtc: string;
}

export interface LearnerResult {
  id: string;
  pseudonym: string;
  cohortId: string;
  scorePercent: number;
  completedAtUtc: string;
  durationMinutes: number;
  status: "COMPLETED" | "IN_PROGRESS";
}

export interface QuizQuestion {
  prompt: string;
  choices: string[];
  correctChoice: number;
  explanation: string;
}

export const COHORTS: Cohort[] = [
  { id: "apollo", name: "Terminale Spé PC — Apollo", course: "Physique · Terminale", accessCode: "APOLLO-24", learners: 24, activeNow: 8, completionPercent: 72, updatedAtUtc: "2026-11-14T10:30:00Z" },
  { id: "orion", name: "1re Générale — Orion", course: "Sciences physiques · Première", accessCode: "ORION-18", learners: 18, activeNow: 3, completionPercent: 54, updatedAtUtc: "2026-11-13T15:00:00Z" },
  { id: "artemis", name: "L1 Physique Stellaire — Artemis", course: "Physique · Licence 1", accessCode: "ARTEMIS-12", learners: 12, activeNow: 0, completionPercent: 86, updatedAtUtc: "2026-11-12T09:15:00Z" },
];

export const ACTIVITIES: LearningActivity[] = [
  { id: "horizon", title: "Comprendre l'effet du relief sur l'illumination", kind: "GUIDED", status: "PUBLISHED", durationMinutes: 25, completionPercent: 78, updatedAtUtc: "2026-11-14T10:30:00Z" },
  { id: "quiz-704", title: "Sélénodésie & insolation au pôle Sud", kind: "QUIZ", status: "PUBLISHED", durationMinutes: 15, completionPercent: 64, updatedAtUtc: "2026-11-13T14:00:00Z" },
  { id: "rover-intro", title: "Concevoir un rover polaire", kind: "MISSION", status: "DRAFT", durationMinutes: 35, completionPercent: 0, updatedAtUtc: "2026-11-12T08:20:00Z" },
];

export const LEARNER_RESULTS: LearnerResult[] = [
  { id: "cadet-01", pseudonym: "lola", cohortId: "apollo", scorePercent: 92, completedAtUtc: "2026-11-14T10:42:00Z", durationMinutes: 12, status: "COMPLETED" },
  { id: "cadet-02", pseudonym: "shackleton", cohortId: "apollo", scorePercent: 48, completedAtUtc: "2026-11-14T10:39:00Z", durationMinutes: 18, status: "COMPLETED" },
  { id: "cadet-03", pseudonym: "orient", cohortId: "orion", scorePercent: 76, completedAtUtc: "2026-11-13T15:22:00Z", durationMinutes: 14, status: "COMPLETED" },
  { id: "cadet-04", pseudonym: "polaris", cohortId: "apollo", scorePercent: 0, completedAtUtc: "2026-11-14T10:44:00Z", durationMinutes: 4, status: "IN_PROGRESS" },
  { id: "cadet-05", pseudonym: "faustini", cohortId: "artemis", scorePercent: 100, completedAtUtc: "2026-11-12T09:36:00Z", durationMinutes: 9, status: "COMPLETED" },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    prompt: "Pourquoi un rayon solaire peut-il être occulté alors que le Soleil est au-dessus de l'horizon astronomique ?",
    choices: ["La Lune possède une atmosphère dense", "Le relief local peut masquer la ligne de visée", "La Terre absorbe le rayonnement solaire"],
    correctChoice: 1,
    explanation: "L'horizon topographique dépend du relief autour du site : une crête peut masquer le Soleil même si son élévation géométrique est positive.",
  },
  {
    prompt: "Que signifie une visibilité Terre FULL dans cet atlas ?",
    choices: ["Une liaison radio est garantie", "La visibilité géométrique n'est pas occultée", "Le signal est toujours disponible"],
    correctChoice: 1,
    explanation: "FULL décrit uniquement la visibilité géométrique. Cela ne garantit ni liaison radio, ni disponibilité d'un relais.",
  },
  {
    prompt: "Quelle information accompagne un résultat scientifique ?",
    choices: ["La source, la version et ses limites", "Seulement une couleur", "Aucune métadonnée"],
    correctChoice: 0,
    explanation: "La provenance et les hypothèses sont nécessaires pour interpréter correctement une valeur.",
  },
];

export function cohortFor(id: string): Cohort | undefined {
  return COHORTS.find((cohort) => cohort.id === id);
}

export function pedagogyForSite(site: SiteSummary): { summary: string; challenge: string } {
  if (site.category === "CRATER_RIM" || site.tags.some((tag) => tag.toLowerCase().includes("psr"))) {
    return { summary: "Comparez le relief local aux fenêtres d'illumination et aux zones d'ombre permanente.", challenge: "Pourquoi la résolution du terrain compte-t-elle pour caractériser une occultation près du bord ?" };
  }
  if (site.category === "PLATEAU") {
    return { summary: "Un plateau élevé offre un point de comparaison pour les horizons solaire et terrestre.", challenge: "Une Terre géométriquement visible garantit-elle un canal de communication ?" };
  }
  return { summary: "Étudiez comment une crête modifie l'horizon apparent et l'éclairement direct.", challenge: "À quelle condition le relief local peut-il masquer un astre situé au-dessus de l'horizon astronomique ?" };
}
