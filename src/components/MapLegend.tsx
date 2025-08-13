"use client";

import { VisitStatus } from "@/types/map";
import {
  getStatusLabel,
  getStatusColor,
  getFillColor,
  getStrokeColor,
} from "@/utils/mapUtils";

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
              className="w-4 h-4 rounded-sm border-2"
              aria-hidden="true"
              style={{
                backgroundColor: getFillColor(status),
                borderColor: getStrokeColor(status),
              }}
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
    </div>
  );
}
