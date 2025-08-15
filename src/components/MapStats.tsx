"use client";

import { MapStats } from "@/types/map";
import {
  getVisitedTotal,
  getVisitedPercentage,
  percentOf,
} from "@/utils/mapUtils";

interface MapStatsProps {
  stats: MapStats;
  className?: string;
}

/**
 * Component displaying statistics about visited regions
 * Aligned with the Share page's more engaging progress card
 */
export default function MapStatsDisplay({
  stats,
  className = "",
}: MapStatsProps) {
  const visitedTotal = getVisitedTotal(stats);
  const visitedPercentage = getVisitedPercentage(stats);

  // Category percentages for mini bars
  const totalProvinces = stats.total;
  const pct = (v: number) => percentOf(v, totalProvinces);
  const pctBeen = pct(stats.beenThere);
  const pctStayed = pct(stats.stayedThere);
  const pctPassed = pct(stats.passedBy);
  const pctNot = pct(stats.notVisited);

  return (
    <div
      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-3 lg:p-4 ${className}`}
    >
      {/* Mobile header - mirrors Share page wording */}
      <h3 className="text-base lg:hidden font-semibold text-gray-800 mb-3">
        Progress
      </h3>

      {/* Progress header with donut and linear bar */}
      <div className="flex items-center gap-4 mb-4">
        {/* Donut chart */}
        <div className="relative w-20 h-20 lg:w-24 lg:h-24 shrink-0">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#3b82f6 ${
                visitedPercentage * 3.6
              }deg, #e5e7eb 0deg)`,
            }}
            aria-hidden
          />
          <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
            <span className="text-sm lg:text-base font-bold text-gray-800">
              {visitedPercentage}%
            </span>
          </div>
        </div>

        {/* Title + linear progress */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-800">Progress</h2>
          <p className="text-sm text-gray-600">
            Visited {visitedTotal} of {stats.total} provinces
          </p>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${visitedPercentage}%`,
                background: "linear-gradient(90deg, #60a5fa, #6366f1)",
              }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={stats.total}
              aria-valuenow={visitedTotal}
              aria-label={`${visitedTotal} out of ${stats.total} provinces visited`}
            />
          </div>
        </div>
      </div>

      {/* Category breakdown (counts + tiny progress bars) */}
      <div className="space-y-3">
        {/* Been There */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#10b981" }}
                aria-hidden
              />
              <span className="text-gray-700">Been There</span>
            </div>
            <span className="font-semibold text-gray-900">
              {stats.beenThere}
            </span>
          </div>
          <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded"
              style={{ width: `${pctBeen}%`, backgroundColor: "#10b981" }}
            />
          </div>
        </div>

        {/* Visited (Stayed There) */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#3b82f6" }}
                aria-hidden
              />
              <span className="text-gray-700">Stayed There</span>
            </div>
            <span className="font-semibold text-gray-900">
              {stats.stayedThere}
            </span>
          </div>
          <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded"
              style={{ width: `${pctStayed}%`, backgroundColor: "#3b82f6" }}
            />
          </div>
        </div>

        {/* Lived (Passed By) */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#dc2626" }}
                aria-hidden
              />
              <span className="text-gray-700">Lived There</span>
            </div>
            <span className="font-semibold text-gray-900">
              {stats.passedBy}
            </span>
          </div>
          <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded"
              style={{ width: `${pctPassed}%`, backgroundColor: "#dc2626" }}
            />
          </div>
        </div>

        {/* Not Visited */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: "#9ca3af" }}
                aria-hidden
              />
              <span className="text-gray-700">Not Visited</span>
            </div>
            <span className="font-semibold text-gray-900">
              {stats.notVisited}
            </span>
          </div>
          <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded"
              style={{ width: `${pctNot}%`, backgroundColor: "#9ca3af" }}
            />
          </div>
        </div>
      </div>

      {/* Footer with total provinces */}
      <div className="mt-3 lg:mt-4 text-sm text-gray-600">
        Total provinces:{" "}
        <span className="font-semibold text-gray-800">{stats.total}</span>
      </div>
    </div>
  );
}
