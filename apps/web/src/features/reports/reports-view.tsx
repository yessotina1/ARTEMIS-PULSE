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
  LoadingState,
  QualityBadge,
  Select,
  Timestamp,
} from "@/components/ui";
import { useReports } from "@/hooks";
import type { Report, ReportKind, ReportStatus } from "@/types";

const KIND_LABELS: Record<ReportKind, string> = {
  SCENARIO: "Scénario",
  COMPARISON: "Comparaison",
  SITE: "Site",
  RUN: "Run",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  READY: "PRÊT",
  GENERATING: "EN GÉNÉRATION",
  FAILED: "ÉCHEC",
};

const STATUS_TONES = {
  READY: "success",
  GENERATING: "info",
  FAILED: "danger",
} as const;

const KIND_OPTIONS = [
  { value: "ALL", label: "Tous les types" },
  { value: "SCENARIO", label: "Scénarios" },
  { value: "COMPARISON", label: "Comparaisons" },
  { value: "RUN", label: "Runs" },
  { value: "SITE", label: "Sites" },
];

function formatSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export function ReportsView() {
  const reportsQuery = useReports();
  const [kind, setKind] = useState("ALL");

  const reports = useMemo(() => {
    const all = reportsQuery.data ?? [];
    return kind === "ALL" ? all : all.filter((report) => report.kind === kind);
  }, [reportsQuery.data, kind]);

  if (reportsQuery.isPending) return <LoadingState label="Chargement des rapports…" rows={4} />;
  if (reportsQuery.isError) {
    return (
      <ErrorState
        message={reportsQuery.error instanceof Error ? reportsQuery.error.message : undefined}
        onRetry={() => void reportsQuery.refetch()}
      />
    );
  }

  function exportDemo(report: Report) {
    const payload = {
      id: report.id,
      title: report.title,
      kind: report.kind,
      createdAt: report.createdAt,
      scenarios: report.scenarioIds,
      sites: report.siteIds,
      source: report.source,
      note: "Export de démonstration — aucune donnée scientifique réelle.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-md">
      <Card>
        <CardBody className="flex flex-wrap items-end justify-between gap-sm">
          <div className="min-w-56">
            <label
              htmlFor="report-kind"
              className="mb-xs block font-mono text-label-md uppercase tracking-wider text-on-surface-variant"
            >
              Filtrer par type
            </label>
            <Select
              id="report-kind"
              options={KIND_OPTIONS}
              value={kind}
              onChange={(event) => setKind(event.target.value)}
            />
          </div>
          <p className="font-mono text-label-sm text-on-surface-variant" role="status">
            {reports.length} rapport(s) · exports de démonstration
          </p>
        </CardBody>
      </Card>

      {reports.length === 0 ? (
        <EmptyState
          icon="file"
          title="Aucun rapport pour ce filtre"
          description="Les rapports sont générés à partir des scénarios et des comparaisons."
          action={
            <Link href="/scenarios">
              <Button variant="secondary">Voir mes scénarios</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-md md:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.id} accent={report.status === "FAILED" ? "occulted" : "none"}>
              <CardHeader
                eyebrow={`${KIND_LABELS[report.kind]} · ${report.format}`}
                title={report.title}
                icon={<Icon name="file" size={16} />}
                actions={<Badge tone={STATUS_TONES[report.status]}>{STATUS_LABELS[report.status]}</Badge>}
              />
              <CardBody className="space-y-sm">
                <div className="flex flex-wrap items-center gap-xs">
                  <QualityBadge value={report.quality} />
                  <Badge tone="neutral">{formatSize(report.sizeBytes)}</Badge>
                  <Badge tone="neutral">{report.author}</Badge>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-xs border-t border-outline-variant/60 pt-xs font-mono text-label-sm text-on-surface-variant">
                  <Timestamp value={report.createdAt} variant="compact" />
                  <span>{report.id}</span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Scénarios : {report.scenarioIds.join(", ") || "—"}
                  <br />
                  Sites : {report.siteIds.join(", ") || "—"}
                </p>
                <div className="flex flex-wrap gap-sm border-t border-outline-variant pt-sm">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={report.status !== "READY"}
                    onClick={() => exportDemo(report)}
                  >
                    <Icon name="download" size={13} />
                    Télécharger (démo)
                  </Button>
                  {report.scenarioIds[0] ? (
                    <Link href={`/scenarios/${report.scenarioIds[0]}`}>
                      <Button size="sm" variant="ghost">Voir le scénario</Button>
                    </Link>
                  ) : null}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader eyebrow="Statuts" title="Files de génération" icon={<Icon name="clock" size={16} />} />
        <CardBody className="flex flex-wrap gap-sm">
          {(["READY", "GENERATING", "FAILED"] as ReportStatus[]).map((status) => (
            <span key={status} className="flex items-center gap-xs font-mono text-label-sm text-on-surface-variant">
              <Badge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Badge>
              {(reportsQuery.data ?? []).filter((report) => report.status === status).length}
            </span>
          ))}
        </CardBody>
      </Card>

      <AssumptionBanner
        model="MOLA/LOLA DEM 20 m · éphémérides DE440"
        source="SPICE / MOON_PA_DE440"
        version="2029.1"
        href="/documentation"
      />
    </div>
  );
}
