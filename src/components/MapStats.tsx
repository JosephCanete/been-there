"use client";

import { MapStats } from "@/types/map";

interface MapStatsProps {
  stats: MapStats;
  className?: string;
}

/**
 * Component displaying statistics about visited regions
 */
export default function MapStatsDisplay({
  stats,
  className = "",
}: MapStatsProps) {
  const visitedTotal = stats.beenThere + stats.stayedThere + stats.passedBy;
  const visitedPercentage =
    stats.total > 0 ? Math.round((visitedTotal / stats.total) * 100) : 0;

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Your Progress
      </h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Regions Visited</span>
          <span>
            {visitedTotal} of {stats.total} ({visitedPercentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${visitedPercentage}%` }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={stats.total}
            aria-valuenow={visitedTotal}
            aria-label={`${visitedTotal} out of ${stats.total} regions visited`}
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {stats.beenThere}
          </div>
          <div className="text-xs text-green-700">Been There</div>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {stats.stayedThere}
          </div>
          <div className="text-xs text-blue-700">Stayed There</div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.passedBy}
          </div>
          <div className="text-xs text-yellow-700">Passed By</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {stats.notVisited}
          </div>
          <div className="text-xs text-gray-700">Not Visited</div>
        </div>
      </div>

      {/* Achievement */}
      {visitedPercentage >= 100 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-center">
          <div className="text-lg font-bold">🎉 Congratulations!</div>
          <div className="text-sm">You&apos;ve visited all regions!</div>
        </div>
      )}
    </div>
  );
}
