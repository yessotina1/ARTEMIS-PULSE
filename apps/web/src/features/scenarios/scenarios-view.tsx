"use client";

import Link from "next/link";
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
  Icon,
  Input,
  LoadingState,
  QualityBadge,
  RunStatusBadge,
  Select,
  Timestamp,
} from "@/components/ui";
import { useScenarios, useRuns } from "@/hooks";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "READY", label: "Prêts" },
  { value: "QUEUED", label: "En file" },
  { value: "RUNNING", label: "En cours" },
  { value: "FAILED", label: "Échecs" },
  { value: "DRAFT", label: "Brouillons" },
];

export function ScenariosView() {
  const scenariosQuery = useScenarios();
  const runsQuery = useRuns();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const scenarios = useMemo(() => scenariosQuery.data ?? [], [scenariosQuery.data]);
  const runs = useMemo(() => runsQuery.data ?? [], [runsQuery.data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return scenarios.filter((scenario) => {
      const matchesSearch =
        needle.length === 0 ||
        scenario.name.toLowerCase().includes(needle) ||
        scenario.siteName.toLowerCase().includes(needle) ||
        scenario.tags.some((tag) => tag.toLowerCase().includes(needle));
      const matchesStatus = status === "ALL" || scenario.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [scenarios, search, status]);

  if (scenariosQuery.isPending || runsQuery.isPending) {
    return <LoadingState label="Chargement des scénarios…" rows={4} />;
  }
  if (scenariosQuery.isError || runsQuery.isError) {
    return (
      <ErrorState
        message={(scenariosQuery.error ?? runsQuery.error)?.message}
        onRetry={() => {
          void scenariosQuery.refetch();
          void runsQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardBody className="grid gap-2 md:grid-cols-[1.6fr_1fr_auto] md:items-end">
          <div>
            <label
              htmlFor="scenario-search"
              className="mb-1 block font-mono text-label-md uppercase tracking-wider text-on-surface-variant"
            >
              Rechercher
            </label>
            <Input
              id="scenario-search"
              type="search"
              placeholder="Nom du scénario, site ou tag"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="scenario-status"
              className="mb-1 block font-mono text-label-md uppercase tracking-wider text-on-surface-variant"
            >
              Statut
            </label>
            <Select
              id="scenario-status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            />
          </div>
          <Link href="/analyses/nouvelle">
            <Button fullWidth>
              <Icon name="plus" size={14} />
              Nouvelle analyse
            </Button>
          </Link>
        </CardBody>
        <p className="border-t border-outline-variant px-3 py-1 font-mono text-label-sm text-on-surface-variant" role="status">
          {filtered.length} scénario(s) sur {scenarios.length}
        </p>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="search"
          title="Aucun scénario ne correspond"
          description="Ajustez la recherche ou créez un nouveau scénario."
          action={
            <Link href="/analyses/nouvelle">
              <Button>Nouvelle analyse</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((scenario) => {
            const lastRun = runs.find((run) => run.id === scenario.lastRunId);
            return (
              <Card key={scenario.id} accent={scenario.status === "FAILED" ? "occulted" : "none"}>
                <CardHeader
                  eyebrow={`${scenario.id} · ${scenario.siteName}`}
                  title={scenario.name}
                  icon={<Icon name="spark" size={16} />}
                  actions={<QualityBadge value={scenario.quality} />}
                />
                <CardBody className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1">
                    {lastRun ? <RunStatusBadge status={lastRun.status} /> : <Badge tone="neutral">SANS RUN</Badge>}
                    <Badge tone="neutral">{scenario.window.steps} pas</Badge>
                    <Badge tone="neutral">{scenario.window.stepSeconds / 60} min</Badge>
                    {scenario.tags.map((tag) => (
                      <Badge key={tag} tone="primary">{tag}</Badge>
                    ))}
                  </div>
                  <dl className="grid gap-1 sm:grid-cols-2">
                    <div className="flex justify-between gap-2 border-b border-outline-variant/50 pb-1">
                      <dt className="text-body-sm text-on-surface-variant">Début</dt>
                      <dd><Timestamp value={scenario.window.startUtc} variant="compact" /></dd>
                    </div>
                    <div className="flex justify-between gap-2 border-b border-outline-variant/50 pb-1">
                      <dt className="text-body-sm text-on-surface-variant">Fin</dt>
                      <dd><Timestamp value={scenario.window.endUtc} variant="compact" /></dd>
                    </div>
                    <div className="flex justify-between gap-2 border-b border-outline-variant/50 pb-1">
                      <dt className="text-body-sm text-on-surface-variant">Observateur</dt>
                      <dd className="font-mono text-label-sm">{scenario.observer.name}</dd>
                    </div>
                    <div className="flex justify-between gap-2 border-b border-outline-variant/50 pb-1">
                      <dt className="text-body-sm text-on-surface-variant">Mis à jour</dt>
                      <dd><Timestamp value={scenario.updatedAt} variant="compact" /></dd>
                    </div>
                  </dl>
                  {lastRun?.error ? (
                    <p className="rounded border border-error/40 bg-error-container/20 px-2 py-1 text-body-sm text-error">
                      {lastRun.error.message}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 border-t border-outline-variant pt-2">
                    <Link href={`/scenarios/${scenario.id}`}>
                      <Button size="sm" variant="secondary">Détail</Button>
                    </Link>
                    {lastRun ? (
                      <Link href={`/analyses/${lastRun.id}`}>
                        <Button size="sm">Analyse</Button>
                      </Link>
                    ) : null}
                    <Link href={`/comparateur?scenarios=${scenario.id}`}>
                      <Button size="sm" variant="ghost">Comparer</Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <AssumptionBanner
        model="MOLA/LOLA DEM 20 m · éphémérides DE440"
        source="SPICE / MOON_PA_DE440"
        version="2029.1"
        href="/documentation"
      />
    </div>
  );
}
