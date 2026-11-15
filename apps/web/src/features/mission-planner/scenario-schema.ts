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

const nameField = z.string().trim().min(3, "Donnez un nom au scénario (3 caractères minimum).");
const siteIdField = z.string().min(1, "Sélectionnez un site.");
const startField = z.string().min(1, "Renseignez la date de début.");
const endField = z.string().min(1, "Renseignez la date de fin.");
const stepField = z.coerce.number().int().positive("Le pas doit être positif.");

export const siteStepSchema = z.object({
  name: nameField,
  siteId: siteIdField,
});

const windowFields = z.object({
  startUtc: startField,
  endUtc: endField,
  stepSeconds: stepField,
});

function refineWindow<T extends z.ZodType<{ startUtc: string; endUtc: string; stepSeconds: number }>>(
  schema: T,
) {
  return schema
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
}

export const windowStepSchema = refineWindow(windowFields);
export const observerStepSchema = observerSchema;

export const scenarioSchema = refineWindow(
  z.object({
    name: nameField,
    siteId: siteIdField,
    startUtc: startField,
    endUtc: endField,
    stepSeconds: stepField,
    observerName: observerSchema.shape.observerName,
    observerHeightM: observerSchema.shape.observerHeightM,
    observerMode: observerSchema.shape.observerMode,
  }),
);

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
