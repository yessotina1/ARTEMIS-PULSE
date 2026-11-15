"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AssumptionBanner,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  Input,
  LoadingState,
  Metric,
  QualityBadge,
  Select,
  Timestamp,
  VisibilityBadge,
} from "@/components/ui";
import { useCreateScenario, useSites } from "@/hooks";
import { countSteps, fromUtcIso, toUtcIso } from "@/lib/datetime-input";
import { formatPercent } from "@/lib/format";
import type { UserProfileKind } from "@/types";
import { cn } from "@/lib/cn";
import {
  WARNING_STEPS,
  collectErrors,
  observerStepSchema,
  scenarioSchema,
  siteStepSchema,
  stepCountLabel,
  windowStepSchema,
  type FieldErrors,
  type ScenarioFormValues,
} from "./scenario-schema";

const STEPS = [
  { id: 0, label: "Site", hint: "Cible géodésique" },
  { id: 1, label: "Temps UTC", hint: "Fenêtre de calcul" },
  { id: 2, label: "Observateur", hint: "Point de vue" },
  { id: 3, label: "Récapitulatif", hint: "Validation" },
];

const STEP_OPTIONS = [
  { value: "60", label: "1 min" },
  { value: "300", label: "5 min" },
  { value: "600", label: "10 min" },
  { value: "1800", label: "30 min" },
  { value: "3600", label: "1 h" },
];

const PROFILE_HINT: Record<UserProfileKind, string> = {
  PLANNER: "Vos scénarios seront marqués comme planification opérationnelle.",
  EDUCATOR: "Vos scénarios seront rattachés à vos activités pédagogiques.",
  EXPLORER: "Vos scénarios restent privés et exploratoires.",
};

export function ScenarioWizard({
  initialSiteId,
  profile = "PLANNER",
}: {
  initialSiteId?: string;
  profile?: UserProfileKind;
}) {
  const router = useRouter();
  const sitesQuery = useSites();
  const createScenario = useCreateScenario();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [values, setValues] = useState<ScenarioFormValues>({
    name: "Analyse Shackleton — fenêtre 14 jours",
    siteId: initialSiteId ?? "site-shk-001",
    startUtc: "2030-01-01T00:00:00Z",
    endUtc: "2030-01-15T00:00:00Z",
    stepSeconds: 3600,
    observerName: "Observateur principal",
    observerHeightM: 1.8,
    observerMode: "SITE_SURFACE",
  });

  const sites = useMemo(() => sitesQuery.data ?? [], [sitesQuery.data]);
  const selectedSite = sites.find((site) => site.id === values.siteId);
  const filteredSites = sites;
  const steps = countSteps(values.startUtc, values.endUtc, values.stepSeconds);

  function update<K extends keyof ScenarioFormValues>(key: K, value: ScenarioFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function validateCurrentStep(): boolean {
    const result =
      step === 0
        ? siteStepSchema.safeParse(values)
        : step === 1
          ? windowStepSchema.safeParse(values)
          : step === 2
            ? observerStepSchema.safeParse(values)
            : scenarioSchema.safeParse(values);

    if (!result.success) {
      setErrors(collectErrors(result.error));
      return false;
    }
    setErrors({});
    return true;
  }

  function next() {
    if (!validateCurrentStep()) return;
    setStep((previous) => Math.min(STEPS.length - 1, previous + 1));
  }

  function previous() {
    setErrors({});
    setStep((current) => Math.max(0, current - 1));
  }

  async function submit() {
    const result = scenarioSchema.safeParse(values);
    if (!result.success) {
      setErrors(collectErrors(result.error));
      return;
    }
    setSubmitError(null);
    try {
      const scenario = await createScenario.mutateAsync({
        name: result.data.name,
        siteId: result.data.siteId,
        window: {
          startUtc: result.data.startUtc,
          endUtc: result.data.endUtc,
          stepSeconds: result.data.stepSeconds,
        },
        observer: {
          name: result.data.observerName,
          heightM: result.data.observerHeightM,
          mode: result.data.observerMode,
        },
      });
      router.push(`/analyses/${scenario.lastRunId ?? scenario.id}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Création du scénario impossible.");
    }
  }

  if (sitesQuery.isPending) return <LoadingState label="Chargement des sites…" rows={4} />;
  if (sitesQuery.isError) {
    return (
      <ErrorState
        message={sitesQuery.error instanceof Error ? sitesQuery.error.message : undefined}
        onRetry={() => void sitesQuery.refetch()}
      />
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader
          eyebrow="Assistant de scénario"
          title={`Étape ${step + 1} sur 4 — ${STEPS[step].label}`}
          icon={<Icon name="spark" size={16} />}
          actions={<Badge tone="primary">{STEPS[step].hint}</Badge>}
        />

        <nav aria-label="Étapes de l'assistant" className="border-b border-outline-variant px-3 py-2">
          <ol className="flex flex-wrap gap-1">
            {STEPS.map((item) => {
              const current = item.id === step;
              const done = item.id < step;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.id < step) setStep(item.id);
                    }}
                    aria-current={current ? "step" : undefined}
                    disabled={item.id > step}
                    className={cn(
                      "flex items-center gap-1 rounded border px-2 py-1 font-mono text-label-sm uppercase tracking-wider",
                      current
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : done
                          ? "border-outline-variant text-tertiary hover:bg-container-high"
                          : "border-grid text-on-surface-variant opacity-70",
                    )}
                  >
                    {done ? <Icon name="check" size={12} /> : <span aria-hidden>{item.id + 1}</span>}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <CardBody className="space-y-3">
          {Object.keys(errors).length > 0 ? (
            <p role="alert" className="rounded border border-error/50 bg-error-container/30 px-2 py-1 text-body-sm text-error">
              Corrigez les champs signalés pour continuer.
            </p>
          ) : null}

          {step === 0 ? (
            <div className="space-y-3">
              <Field label="Nom du scénario" htmlFor="scenario-name" required error={errors.name}>
                <Input
                  id="scenario-name"
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  invalid={Boolean(errors.name)}
                />
              </Field>

              <fieldset>
                <legend className="mb-1 font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
                  Site cible <span aria-hidden className="text-primary">*</span>
                </legend>
                <div className="grid gap-1 sm:grid-cols-2">
                  {filteredSites.map((site) => {
                    const active = site.id === values.siteId;
                    return (
                      <label
                        key={site.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-2 rounded border px-2 py-1",
                          active
                            ? "border-primary/60 bg-primary/10"
                            : "border-grid hover:border-outline-variant hover:bg-container-high",
                        )}
                      >
                        <input
                          type="radio"
                          name="siteId"
                          value={site.id}
                          checked={active}
                          onChange={() => update("siteId", site.id)}
                          className="mt-1 accent-primary"
                        />
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-1">
                            <span className="text-body-md text-on-surface">{site.name}</span>
                            <QualityBadge value={site.quality} />
                          </span>
                          <span className="block font-mono text-label-sm text-on-surface-variant">
                            {site.coordinates.latitudeDeg.toFixed(3)}° ·{" "}
                            {site.coordinates.longitudeDeg.toFixed(3)}° · {site.coordinates.altitudeM} m
                          </span>
                          <span className="block text-body-sm text-on-surface-variant">
                            DEM{" "}
                            {site.dem.status === "FULL"
                              ? `${site.dem.resolutionM} m/px`
                              : site.dem.status === "PARTIAL"
                                ? "partielle"
                                : "absente"}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.siteId ? (
                  <p role="alert" className="mt-1 text-body-sm text-error">{errors.siteId}</p>
                ) : null}
              </fieldset>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Début (UTC)"
                htmlFor="window-start"
                required
                error={errors.startUtc}
                hint="Interprété en UTC, jamais en heure locale."
              >
                <Input
                  id="window-start"
                  type="datetime-local"
                  step={60}
                  value={fromUtcIso(values.startUtc)}
                  onChange={(event) => update("startUtc", toUtcIso(event.target.value))}
                  invalid={Boolean(errors.startUtc)}
                />
              </Field>
              <Field label="Fin (UTC)" htmlFor="window-end" required error={errors.endUtc}>
                <Input
                  id="window-end"
                  type="datetime-local"
                  step={60}
                  value={fromUtcIso(values.endUtc)}
                  onChange={(event) => update("endUtc", toUtcIso(event.target.value))}
                  invalid={Boolean(errors.endUtc)}
                />
              </Field>
              <Field label="Pas de calcul" htmlFor="window-step" error={errors.stepSeconds}>
                <Select
                  id="window-step"
                  options={STEP_OPTIONS}
                  value={String(values.stepSeconds)}
                  onChange={(event) => update("stepSeconds", Number(event.target.value))}
                />
              </Field>
              <div className="rounded border border-grid bg-container-low p-2">
                <p className="font-mono text-label-md uppercase text-on-surface-variant">
                  Volume de calcul
                </p>
                <p className="mt-1 font-mono text-data-display tabular text-on-surface">
                  {stepCountLabel(steps)}
                </p>
                {steps > WARNING_STEPS ? (
                  <p className="mt-1 flex items-start gap-1 text-body-sm text-quality-low">
                    <Icon name="alert-triangle" size={14} className="mt-0.5 shrink-0" />
                    Volume important : le calcul peut dépasser plusieurs minutes. Réduisez la
                    période ou augmentez le pas.
                  </p>
                ) : (
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    Volume compatible avec un calcul interactif.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nom de l'observateur" htmlFor="observer-name" required error={errors.observerName}>
                <Input
                  id="observer-name"
                  value={values.observerName}
                  onChange={(event) => update("observerName", event.target.value)}
                  invalid={Boolean(errors.observerName)}
                />
              </Field>
              <Field
                label="Hauteur de l'observateur"
                htmlFor="observer-height"
                required
                error={errors.observerHeightM}
                hint="En mètres, entre 0 et 10."
              >
                <Input
                  id="observer-height"
                  type="number"
                  min={0}
                  max={10}
                  step="0.1"
                  inputMode="decimal"
                  value={values.observerHeightM}
                  onChange={(event) => update("observerHeightM", Number(event.target.value))}
                  invalid={Boolean(errors.observerHeightM)}
                />
              </Field>
              <fieldset className="sm:col-span-2">
                <legend className="mb-1 font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
                  Mode d&apos;observation
                </legend>
                <div className="grid gap-1 sm:grid-cols-2">
                  {[
                    { value: "SITE_SURFACE", label: "Surface du site", hint: "Horizon topographique local." },
                    { value: "ZENITH", label: "Zénith", hint: "Horizon dégagé, sans masque de crête." },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        "flex cursor-pointer items-start gap-2 rounded border px-2 py-1",
                        values.observerMode === option.value
                          ? "border-primary/60 bg-primary/10"
                          : "border-grid hover:border-outline-variant",
                      )}
                    >
                      <input
                        type="radio"
                        name="observerMode"
                        value={option.value}
                        checked={values.observerMode === option.value}
                        onChange={() =>
                          update("observerMode", option.value as ScenarioFormValues["observerMode"])
                        }
                        className="mt-1 accent-primary"
                      />
                      <span>
                        <span className="block text-body-md">{option.label}</span>
                        <span className="block text-body-sm text-on-surface-variant">{option.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-2">
              <dl className="grid gap-2 sm:grid-cols-2">
                {[
                  ["Scénario", values.name],
                  ["Site", selectedSite?.name ?? values.siteId],
                  ["Début", values.startUtc],
                  ["Fin", values.endUtc],
                  ["Pas", `${values.stepSeconds / 60} min`],
                  ["Pas de calcul", stepCountLabel(steps)],
                  ["Observateur", values.observerName],
                  ["Hauteur", `${values.observerHeightM} m`],
                  ["Mode", values.observerMode === "ZENITH" ? "Zénith" : "Surface du site"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-baseline justify-between gap-2 border-b border-outline-variant/60 pb-1">
                    <dt className="text-body-sm text-on-surface-variant">{label}</dt>
                    <dd className="text-right font-mono text-label-md text-on-surface">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="flex items-start gap-2 rounded border border-quality-low/40 bg-quality-low-soft/20 px-2 py-1 text-body-sm text-quality-low">
                <Icon name="alert-triangle" size={14} className="mt-0.5 shrink-0" />
                Le lancement crée un run de calcul asynchrone. Vous pourrez suivre son statut sur la
                page d&apos;analyse ; aucun résultat partiel n&apos;est affiché.
              </p>
              {submitError ? (
                <p role="alert" className="rounded border border-error/50 bg-error-container/30 px-2 py-1 text-body-sm text-error">
                  {submitError}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-2">
            <Button variant="secondary" onClick={previous} disabled={step === 0}>
              Précédent
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>
                Suivant
                <Icon name="chevron-right" size={14} />
              </Button>
            ) : (
              <Button onClick={() => void submit()} loading={createScenario.isPending}>
                Lancer le calcul
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <aside className="space-y-3">
        <Card>
          <CardHeader eyebrow="Sélection" title={selectedSite?.name ?? "Aucun site"} icon={<Icon name="pin" size={16} />} />
          <CardBody className="space-y-2">
            {selectedSite ? (
              <>
                <QualityBadge value={selectedSite.quality} />
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Latitude" value={selectedSite.coordinates.latitudeDeg.toFixed(3)} unit="°" />
                  <Metric label="Longitude" value={selectedSite.coordinates.longitudeDeg.toFixed(3)} unit="°" />
                  <Metric label="Altitude" value={selectedSite.coordinates.altitudeM} unit="m" />
                  <Metric
                    label="Illumination"
                    value={selectedSite.illuminationPercent ?? "—"}
                    unit="%"
                    digits={1}
                  />
                </div>
                <div className="flex flex-wrap gap-1 border-t border-outline-variant pt-2">
                  <VisibilityBadge value="FULL" variant="compact" />
                  <Badge tone="neutral">DEM {selectedSite.dem.resolutionM ?? "—"} m/px</Badge>
                </div>
                <Timestamp value={selectedSite.referenceEphemerisUtc} />
                <p className="font-mono text-label-sm text-on-surface-variant">
                  Illumination moyenne {formatPercent(selectedSite.illuminationPercent, 1)}
                </p>
              </>
            ) : (
              <EmptyState title="Sélectionnez un site" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-1">
            <p className="font-mono text-label-md uppercase text-on-surface-variant">Profil</p>
            <p className="text-body-sm text-on-surface-variant">{PROFILE_HINT[profile]}</p>
            <Link href="/parametres" className="font-mono text-label-sm text-primary hover:underline">
              Gérer mon profil
            </Link>
          </CardBody>
        </Card>

        <AssumptionBanner
          compact
          model="MOLA/LOLA DEM 20 m · éphémérides DE440"
          source="SPICE / MOON_PA_DE440"
          version="2029.1"
          limits={[
            "Terre visible = visibilité géométrique, pas une garantie de liaison radio",
            "Soleil visible ≠ énergie produite",
          ]}
          href="/documentation"
        />
      </aside>
    </div>
  );
}
