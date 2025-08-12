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
    <div
      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-3 lg:p-4 ${className}`}
    >
      {/* Mobile header - only shown on mobile since desktop has sidebar header */}
      <h3 className="text-base lg:hidden font-semibold text-gray-800 mb-3">
        Your Progress
      </h3>

      {/* Progress Bar */}
      <div className="mb-3 lg:mb-4">
        <div className="flex justify-between text-xs lg:text-sm text-gray-600 mb-1 lg:mb-2">
          <span className="font-medium">Provinces Visited</span>
          <span className="font-semibold">
            {visitedTotal} of {stats.total} ({visitedPercentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 lg:h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${visitedPercentage}%` }}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={stats.total}
            aria-valuenow={visitedTotal}
            aria-label={`${visitedTotal} out of ${stats.total} provinces visited`}
          />
        </div>
        {/* Progress percentage display for mobile */}
        <div className="lg:hidden text-center mt-2">
          <span className="text-lg font-bold text-gray-700">
            {visitedPercentage}%
          </span>
          <span className="text-xs text-gray-500 ml-1">Complete</span>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-2 lg:gap-3">
        <div className="text-center p-2 lg:p-3 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors">
          <div className="text-lg lg:text-2xl font-bold text-green-600">
            {stats.beenThere}
          </div>
          <div className="text-xs lg:text-xs text-green-700 font-medium">
            Been There
          </div>
        </div>

        <div className="text-center p-2 lg:p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
          <div className="text-lg lg:text-2xl font-bold text-blue-600">
            {stats.stayedThere}
          </div>
          <div className="text-xs lg:text-xs text-blue-700 font-medium">
            Visited
          </div>
        </div>

        <div className="text-center p-2 lg:p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors">
          <div className="text-lg lg:text-2xl font-bold text-red-600">
            {stats.passedBy}
          </div>
          <div className="text-xs lg:text-xs text-red-700 font-medium">
            Lived
          </div>
        </div>

        <div className="text-center p-2 lg:p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
          <div className="text-lg lg:text-2xl font-bold text-gray-600">
            {stats.notVisited}
          </div>
          <div className="text-xs lg:text-xs text-gray-700 font-medium">
            Not Visited
          </div>
        </div>
      </div>

      {/* Achievement */}
      {visitedPercentage >= 100 && (
        <div className="mt-3 lg:mt-4 p-3 lg:p-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white rounded-lg text-center shadow-lg">
          <div className="text-base lg:text-lg font-bold flex items-center justify-center">
            <span className="mr-2">🎉</span>
            Congratulations!
            <span className="ml-2">🎊</span>
          </div>
          <div className="text-xs lg:text-sm mt-1">
            You&apos;ve visited all provinces!
          </div>
        </div>
      )}
    </div>
  );
}
