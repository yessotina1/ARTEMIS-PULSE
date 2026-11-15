"use client";

import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/cn";
import { Badge, Button, Icon, Timestamp } from "@/components/ui";
import { formatAxisTick, formatElevation, formatUtc } from "@/lib/format";
import type { SeriesPoint, TimeSeries, VisibilityWindow } from "@/types";
import { TimelineTransitions } from "./timeline-transitions";

const BODY_COLORS = {
  FULL: "bg-visibility-full",
  PARTIAL: "bg-visibility-partial",
  OCCULTED: "bg-visibility-occulted",
  UNKNOWN: "bg-visibility-unknown",
} as const;

function downsample(points: SeriesPoint[], target = 420): SeriesPoint[] {
  if (points.length <= target) return points;
  const stride = Math.ceil(points.length / target);
  return points.filter((_, index) => index % stride === 0);
}

/**
 * Chronologie UTC : fenêtres d'illumination et de visibilité terrestre,
 * curseur temporel et lecture / pause.
 */
export function ScenarioTimeline({
  series,
  windows,
  cursorIndex,
  onCursorChange,
  className,
}: {
  series: TimeSeries;
  windows: VisibilityWindow[];
  cursorIndex: number;
  onCursorChange: (index: number) => void;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const cursorRef = useRef(cursorIndex);
  const lastIndex = series.points.length - 1;
  const safeIndex = Math.min(Math.max(cursorIndex, 0), lastIndex);
  const point = series.points[safeIndex];

  useEffect(() => {
    cursorRef.current = safeIndex;
  }, [safeIndex]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const next = cursorRef.current + 1;
      if (next > lastIndex) {
        setPlaying(false);
        return;
      }
      onCursorChange(next);
    }, 450);
    return () => window.clearInterval(timer);
  }, [playing, lastIndex, onCursorChange]);

  const data = downsample(series.points).map((sample) => ({
    atUtc: sample.atUtc,
    sunElevation: sample.sun.elevationDeg,
    earthElevation: sample.earth.elevationDeg,
    horizonElevationDeg: sample.horizonElevationDeg,
  }));
  const sunWindows = windows.filter((window) => window.body === "SUN");
  const earthWindows = windows.filter((window) => window.body === "EARTH");
  const spanStart = new Date(series.startUtc).getTime();
  const spanEnd = new Date(series.endUtc).getTime();
  const span = Math.max(1, spanEnd - spanStart);
  const axisMode: "time" | "date" = span > 30 * 3_600_000 ? "date" : "time";

  function offsetPercent(iso: string) {
    return ((new Date(iso).getTime() - spanStart) / span) * 100;
  }

  return (
    <section
      aria-label="Chronologie UTC du scénario"
      className={cn("rounded border border-outline-variant bg-container", className)}
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant px-3 py-2">
        <div>
          <p className="font-mono text-label-sm uppercase tracking-widest text-on-surface-variant">
            Chronologie · pas {series.stepSeconds / 60} min
          </p>
          <h2 className="text-headline-sm font-heading">Illumination & visibilité terrestre</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{series.points.length} points</Badge>
          <Timestamp value={point.atUtc} />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setPlaying(false);
              onCursorChange(Math.max(0, safeIndex - 1));
            }}
            aria-label="Pas de temps précédent"
            disabled={safeIndex === 0}
          >
            <Icon name="chevron-left" size={13} />
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (safeIndex >= lastIndex) onCursorChange(0);
              setPlaying((value) => !value);
            }}
            aria-pressed={playing}
          >
            <Icon name={playing ? "pause" : "play"} size={13} />
            {playing ? "Pause" : "Lecture"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setPlaying(false);
              onCursorChange(Math.min(lastIndex, safeIndex + 1));
            }}
            aria-label="Pas de temps suivant"
            disabled={safeIndex >= lastIndex}
          >
            <Icon name="chevron-right" size={13} />
          </Button>
        </div>
      </header>

      <div className="p-3">
        <div className="h-56 w-full" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="timeline-sun" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="timeline-earth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#adc6ff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#adc6ff" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#274060" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="atUtc"
                tickFormatter={(value: string) => formatAxisTick(value, axisMode)}
                stroke="#869397"
                tick={{ fill: "#bcc9cd", fontSize: 12 }}
                interval="preserveStartEnd"
                minTickGap={48}
              />
              <YAxis
                stroke="#869397"
                tick={{ fill: "#bcc9cd", fontSize: 12 }}
                tickFormatter={(value: number) => `${value.toFixed(0)}°`}
                domain={[-6, 8]}
              />
              <Tooltip
                contentStyle={{
                  background: "#1c283d",
                  border: "1px solid #4cd7f6",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
                labelFormatter={(label) =>
                  typeof label === "string" ? formatUtc(label) : String(label ?? "")
                }
                formatter={(value, name) => [
                  typeof value === "number" ? `${value.toFixed(2)}°` : String(value ?? "—"),
                  name === "sunElevation"
                    ? "Soleil"
                    : name === "earthElevation"
                      ? "Terre"
                      : "Horizon",
                ]}
              />
              <ReferenceLine x={point.atUtc} stroke="#4cd7f6" strokeWidth={1.5} />
              <Area
                type="monotone"
                dataKey="sunElevation"
                stroke="#fbbf24"
                strokeWidth={1.6}
                fill="url(#timeline-sun)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="earthElevation"
                stroke="#adc6ff"
                strokeWidth={1.6}
                fill="url(#timeline-earth)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="horizonElevationDeg"
                stroke="#869397"
                strokeDasharray="3 3"
                fill="none"
                strokeWidth={1}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2">
          <label
            htmlFor="timeline-cursor"
            className="mb-1 flex items-center justify-between font-mono text-label-sm uppercase text-on-surface-variant"
          >
            <span>Curseur temporel (UTC)</span>
            <span className="tabular">{formatUtc(point.atUtc)}</span>
          </label>
          <input
            id="timeline-cursor"
            type="range"
            min={0}
            max={lastIndex}
            step={1}
            value={safeIndex}
            onChange={(event) => {
              setPlaying(false);
              onCursorChange(Number(event.target.value));
            }}
            className="w-full accent-[#4cd7f6]"
            aria-valuetext={formatUtc(point.atUtc)}
          />
          <div className="flex justify-between font-mono text-label-sm text-on-surface-variant">
            <Timestamp value={series.startUtc} variant="compact" />
            <Timestamp value={series.endUtc} variant="compact" />
          </div>
        </div>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <WindowBand label="Soleil" windows={sunWindows} offsetPercent={offsetPercent} />
          <WindowBand label="Terre" windows={earthWindows} offsetPercent={offsetPercent} />
        </div>

        <TimelineTransitions windows={windows} points={series.points} onGoTo={onCursorChange} className="mt-2" />

        <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-outline-variant pt-2 font-mono text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-visibility-full" /> FULL</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-visibility-partial" /> PARTIAL</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-visibility-occulted" /> OCCULTED</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-sm bg-visibility-unknown" /> UNKNOWN</span>
          <span className="ml-auto">
            Soleil {formatElevation(point.sun.elevationDeg)} · Terre{" "}
            {formatElevation(point.earth.elevationDeg)}
          </span>
        </div>
      </div>
    </section>
  );
}

function WindowBand({
  label,
  windows,
  offsetPercent,
}: {
  label: string;
  windows: VisibilityWindow[];
  offsetPercent: (iso: string) => number;
}) {
  return (
    <div>
      <p className="mb-1 font-mono text-label-sm uppercase text-on-surface-variant">{label}</p>
      <div className="relative h-5 w-full overflow-hidden rounded-sm border border-outline-variant bg-container-lowest">
        {windows.map((window) => {
          const left = Math.max(0, Math.min(100, offsetPercent(window.startsAtUtc)));
          const right = Math.max(left, Math.min(100, offsetPercent(window.endsAtUtc)));
          return (
            <span
              key={window.id}
              title={`${window.startsAtUtc} → ${window.endsAtUtc} · ${window.visibility}`}
              className={cn("absolute inset-y-0 border-r border-container-lowest/60", BODY_COLORS[window.visibility])}
              style={{ left: `${left}%`, width: `${Math.max(0.4, right - left)}%` }}
            >
              <span className="sr-only">
                {formatUtc(window.startsAtUtc)} à {formatUtc(window.endsAtUtc)}, visibilité{" "}
                {window.visibility}
              </span>
              {window.transition !== "PARTIAL" ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-0.5 bg-container-lowest"
                />
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
