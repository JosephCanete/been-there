"use client";

import { VisitStatus } from "@/types/map";
import { getStatusLabel, getStatusColor } from "@/utils/mapUtils";

interface MapLegendProps {
  className?: string;
}

/**
 * Legend component showing different visit status colors and labels
 */
export default function MapLegend({ className = "" }: MapLegendProps) {
  const statuses: VisitStatus[] = [
    "been-there",
    "stayed-there",
    "passed-by",
    "not-visited",
  ];

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Legend</h3>
      <div className="space-y-2">
        {statuses.map((status) => (
          <div key={status} className="flex items-center space-x-3">
            <div
              className={`w-4 h-4 rounded-sm border-2 ${
                status === "been-there"
                  ? "bg-green-500 border-green-700"
                  : status === "stayed-there"
                  ? "bg-blue-500 border-blue-700"
                  : status === "passed-by"
                  ? "bg-yellow-500 border-yellow-700"
                  : "bg-gray-300 border-gray-500"
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-sm font-medium px-2 py-1 rounded ${getStatusColor(
                status
              )}`}
            >
              {getStatusLabel(status)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Click on regions to cycle through statuses
        </p>
      </div>
    </div>
  );
}
