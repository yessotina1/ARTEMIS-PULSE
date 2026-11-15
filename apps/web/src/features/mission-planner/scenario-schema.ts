import { z } from "zod";

export const MAX_STEPS = 20_000;
export const WARNING_STEPS = 5_000;

const observerSchema = z.object({
  observerName: z
    .string()
    .trim()
    .min(2, "Indiquez un nom d'observateur (2 caractères minimum)."),
  observerHeightM: z.coerce
    .number()
    .min(0, "La hauteur ne peut pas être négative.")
    .max(10, "Hauteur maximale supportée : 10 m."),
  observerMode: z.enum(["SITE_SURFACE", "ZENITH"], {
    message: "Choisissez un mode d'observation.",
  }),
});

const windowSchema = z
  .object({
    startUtc: z.string().min(1, "Renseignez la date de début."),
    endUtc: z.string().min(1, "Renseignez la date de fin."),
    stepSeconds: z.coerce.number().int().positive("Le pas doit être positif."),
  })
  .refine((value) => new Date(value.endUtc).getTime() > new Date(value.startUtc).getTime(), {
    message: "La fin de fenêtre doit être postérieure au début.",
    path: ["endUtc"],
  })
  .refine(
    (value) => {
      const steps =
        (new Date(value.endUtc).getTime() - new Date(value.startUtc).getTime()) /
        1000 /
        value.stepSeconds;
      return steps <= MAX_STEPS;
    },
    {
      message: `La fenêtre dépasse ${MAX_STEPS.toLocaleString("fr-FR")} pas de calcul. Augmentez le pas ou réduisez la période.`,
      path: ["stepSeconds"],
    },
  );

export const siteStepSchema = z.object({
  name: z.string().trim().min(3, "Donnez un nom au scénario (3 caractères minimum)."),
  siteId: z.string().min(1, "Sélectionnez un site."),
});

export const windowStepSchema = windowSchema;
export const observerStepSchema = observerSchema;

export const scenarioSchema = siteStepSchema.merge(windowSchema).merge(observerSchema);

export type ScenarioFormValues = z.infer<typeof scenarioSchema>;

export type FieldErrors = Partial<Record<string, string>>;

export function collectErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function stepCountLabel(steps: number): string {
  return `${steps.toLocaleString("fr-FR")} pas`;
}
