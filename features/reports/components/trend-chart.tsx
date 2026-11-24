"use client";

import { useId, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatCompactNumber, formatNumber } from "@/lib/format/number";
import type { FinancialTrendPoint, TrendGranularity } from "@/types/domain";

type TrendChartProps = {
  points: FinancialTrendPoint[];
  granularity: TrendGranularity;
};

const WIDTH = 920;
const HEIGHT = 340;
const PAD = { top: 24, right: 18, bottom: 40, left: 62 };
const INNER_W = WIDTH - PAD.left - PAD.right;
const INNER_H = HEIGHT - PAD.top - PAD.bottom;

const GRANULARITY_LABEL: Record<TrendGranularity, string> = {
  day: "روزانه",
  week: "هفتگی",
  month: "ماهانه",
};

/** Rounds an axis maximum up to a readable step so the gridlines land on round numbers. */
function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function linePath(values: number[], x: (i: number) => number, y: (v: number) => number) {
  return values
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"}${x(index).toFixed(2)},${y(value).toFixed(2)}`,
    )
    .join(" ");
}

/**
 * The money flow over the selected period.
 *
 * Three series share one axis: what was invoiced, what was collected, and what
 * is still overdue. A line chart rather than bars because the day granularity
 * can produce hundreds of points, where bars collapse into a smear. Hovering a
 * point opens a tooltip with the exact figures for that bucket.
 */
export function TrendChart({ points, granularity }: TrendChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const gradientId = useId();

  if (points.length === 0) {
    return (
      <EmptyState
        title="داده‌ای برای این بازه نیست"
        description="بازهٔ دیگری را انتخاب کنید یا بازه را گسترده‌تر کنید."
      />
    );
  }

  const max = niceMax(
    Math.max(
      ...points.map((point) =>
        Math.max(point.invoicedAmount, point.collectedAmount, point.overdueAmount),
      ),
      1,
    ),
  );

  const x = (index: number) =>
    points.length === 1
      ? PAD.left + INNER_W / 2
      : PAD.left + (index / (points.length - 1)) * INNER_W;
  const y = (value: number) => PAD.top + INNER_H * (1 - value / max);

  const invoiced = points.map((point) => point.invoicedAmount);
  const collected = points.map((point) => point.collectedAmount);
  const overdue = points.map((point) => point.overdueAmount);

  const areaPath =
    `${linePath(invoiced, x, y)} L${x(points.length - 1).toFixed(2)},${(PAD.top + INNER_H).toFixed(2)} ` +
    `L${x(0).toFixed(2)},${(PAD.top + INNER_H).toFixed(2)} Z`;

  // Keep the x-axis readable: at most ~8 labels, evenly spaced.
  const labelStep = Math.max(1, Math.ceil(points.length / 8));
  const activePoint = active === null ? null : points[active];
  const tooltipX =
    active === null
      ? 0
      : Math.min(Math.max(x(active) - 90, PAD.left), WIDTH - PAD.right - 180);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-ink-muted">
        <Legend color="bg-brand-500" label="فروش فاکتور شده" />
        <Legend color="bg-success" label="وصول شده" />
        <Legend color="bg-danger" label="معوقه (با جریمه)" />
        <span className="ms-auto rounded-full bg-surface-muted px-2.5 py-0.5 font-bold">
          {GRANULARITY_LABEL[granularity]}
        </span>
      </div>

      <div className="overflow-hidden rounded-field bg-surface-sunken/60 p-2">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="نمودار جریان مالی در بازهٔ انتخابی"
          className="h-auto w-full"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-500)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--brand-500)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const value = max * (1 - ratio);
            const lineY = PAD.top + INNER_H * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={lineY}
                  y2={lineY}
                  stroke="var(--line)"
                  strokeDasharray="4 6"
                />
                <text
                  x={PAD.left - 10}
                  y={lineY + 4}
                  textAnchor="end"
                  className="fill-ink-muted text-[10px]"
                >
                  {formatCompactNumber(value)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={linePath(invoiced, x, y)}
            fill="none"
            stroke="var(--brand-600)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={linePath(collected, x, y)}
            fill="none"
            stroke="var(--green-600)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={linePath(overdue, x, y)}
            fill="none"
            stroke="var(--red-500)"
            strokeWidth="2"
            strokeDasharray="6 5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.length <= 31
            ? points.map((point, index) => (
                <circle
                  key={`dot-${point.key}`}
                  cx={x(index)}
                  cy={y(point.invoicedAmount)}
                  r={active === index ? 4.5 : 2.5}
                  fill="var(--surface)"
                  stroke="var(--brand-600)"
                  strokeWidth="2"
                />
              ))
            : null}

          {points.map((point, index) => (
            <text
              key={`label-${point.key}`}
              x={x(index)}
              y={HEIGHT - 14}
              textAnchor="middle"
              className="fill-ink-muted text-[10px]"
              opacity={index % labelStep === 0 || index === points.length - 1 ? 1 : 0}
            >
              {point.label}
            </text>
          ))}

          {active !== null ? (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={PAD.top}
              y2={PAD.top + INNER_H}
              stroke="var(--brand-400)"
              strokeDasharray="3 4"
            />
          ) : null}

          {activePoint && active !== null ? (
            <g transform={`translate(${tooltipX}, ${PAD.top + 6})`} pointerEvents="none">
              <rect
                width="180"
                height="104"
                rx="12"
                fill="var(--surface)"
                stroke="var(--line)"
              />
              <text x="12" y="20" className="fill-ink text-[11px] font-bold">
                {activePoint.label}
              </text>
              <text x="12" y="42" className="fill-ink-muted text-[10px]">
                فاکتور شده: {formatNumber(activePoint.invoicedAmount)}
              </text>
              <text x="12" y="60" className="fill-ink-muted text-[10px]">
                وصول شده: {formatNumber(activePoint.collectedAmount)}
              </text>
              <text x="12" y="78" className="fill-ink-muted text-[10px]">
                سررسید: {formatNumber(activePoint.dueAmount)}
              </text>
              <text x="12" y="96" className="fill-ink-muted text-[10px]">
                معوقه: {formatNumber(activePoint.overdueAmount)}
              </text>
            </g>
          ) : null}

          {points.map((point, index) => (
            <rect
              key={`hit-${point.key}`}
              x={
                x(index) -
                (points.length === 1 ? INNER_W / 2 : INNER_W / (points.length - 1) / 2)
              }
              y={PAD.top}
              width={points.length === 1 ? INNER_W : INNER_W / (points.length - 1)}
              height={INNER_H}
              fill="transparent"
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2.5 rounded-full ${color}`} aria-hidden="true" />
      {label}
    </span>
  );
}
