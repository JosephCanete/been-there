"use client";

import { useState, useEffect, useCallback } from "react";
import { MapState, MapStats, VisitStatus } from "@/types/map";
import {
  philippineRegions,
  getRegionColor,
  getRegionStroke,
} from "@/data/philippineRegions";
import {
  loadMapState,
  saveMapState,
  calculateMapStats,
  getNextVisitStatus,
  getStatusLabel,
} from "@/utils/mapUtils";
import MapLegend from "./MapLegend";
import MapStatsDisplay from "./MapStats";

interface InteractiveMapProps {
  className?: string;
}

/**
 * Interactive SVG Map of the Philippines
 * Allows users to mark regions as visited, stayed, or passed by
 * Persists data in localStorage and provides visual feedback
 */
export default function InteractiveMap({
  className = "",
}: InteractiveMapProps) {
  const [mapState, setMapState] = useState<MapState>({});
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<MapStats>({
    beenThere: 0,
    stayedThere: 0,
    passedBy: 0,
    notVisited: philippineRegions.length,
    total: philippineRegions.length,
  });

  // Load state from localStorage on component mount
  useEffect(() => {
    const savedState = loadMapState();
    setMapState(savedState);
    setStats(calculateMapStats(savedState, philippineRegions.length));
    setIsLoaded(true);
  }, []);

  // Save state to localStorage whenever mapState changes
  useEffect(() => {
    if (isLoaded) {
      saveMapState(mapState);
      setStats(calculateMapStats(mapState, philippineRegions.length));
    }
  }, [mapState, isLoaded]);

  // Handle region click - cycle through visit statuses
  const handleRegionClick = useCallback((regionId: string) => {
    setMapState((prev) => {
      const currentStatus = (prev[regionId] as VisitStatus) || "not-visited";
      const nextStatus = getNextVisitStatus(currentStatus);

      return {
        ...prev,
        [regionId]: nextStatus,
      };
    });
  }, []);

  // Handle region hover
  const handleRegionMouseEnter = useCallback((regionId: string) => {
    setHoveredRegion(regionId);
  }, []);

  const handleRegionMouseLeave = useCallback(() => {
    setHoveredRegion(null);
  }, []);

  // Handle keyboard navigation
  const handleRegionKeyDown = useCallback(
    (event: React.KeyboardEvent, regionId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleRegionClick(regionId);
      }
    },
    [handleRegionClick]
  );

  // Get region status for styling
  const getRegionStatus = (regionId: string): VisitStatus => {
    return (mapState[regionId] as VisitStatus) || "not-visited";
  };

  // Find region by ID for tooltip
  const getRegionById = (regionId: string) => {
    return philippineRegions.find((region) => region.id === regionId);
  };

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Map Container */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* SVG Map */}
        <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="relative w-full aspect-square max-w-4xl mx-auto">
            <svg
              viewBox="0 0 1000 1000"
              className="w-full h-full drop-shadow-lg"
              role="img"
              aria-label="Interactive map of the Philippines"
            >
              <defs>
                {/* Gradient definitions for better visuals */}
                <linearGradient
                  id="oceanGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.2" />
                </linearGradient>

                {/* Drop shadow filter */}
                <filter
                  id="dropShadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="2"
                    dy="2"
                    stdDeviation="3"
                    floodOpacity="0.3"
                  />
                </filter>
              </defs>

              {/* Ocean background */}
              <rect
                width="1000"
                height="1000"
                fill="url(#oceanGradient)"
                rx="10"
              />

              {/* Philippine regions */}
              {philippineRegions.map((region) => {
                const status = getRegionStatus(region.id);
                const isHovered = hoveredRegion === region.id;

                return (
                  <g key={region.id}>
                    {/* Region path */}
                    <path
                      d={region.pathData}
                      className={`
                        ${getRegionColor(status)}
                        ${getRegionStroke(status)}
                        stroke-2
                        cursor-pointer
                        transition-all
                        duration-200
                        ease-in-out
                        ${
                          isHovered
                            ? "stroke-4 filter drop-shadow-lg transform scale-105"
                            : ""
                        }
                      `}
                      style={{
                        filter: isHovered ? "url(#dropShadow)" : "none",
                        transformOrigin: region.center
                          ? `${region.center.x}px ${region.center.y}px`
                          : "center",
                      }}
                      onClick={() => handleRegionClick(region.id)}
                      onMouseEnter={() => handleRegionMouseEnter(region.id)}
                      onMouseLeave={handleRegionMouseLeave}
                      onKeyDown={(e) => handleRegionKeyDown(e, region.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${region.name} - ${getStatusLabel(
                        status
                      )}. Click to change status.`}
                      aria-describedby={
                        isHovered ? `tooltip-${region.id}` : undefined
                      }
                    />

                    {/* Region label (shown on hover) */}
                    {isHovered && region.center && (
                      <g>
                        <text
                          x={region.center.x}
                          y={region.center.y - 10}
                          textAnchor="middle"
                          className="fill-gray-800 text-sm font-medium pointer-events-none"
                          style={{
                            textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                          }}
                        >
                          {region.name}
                        </text>
                        <text
                          x={region.center.x}
                          y={region.center.y + 5}
                          textAnchor="middle"
                          className="fill-gray-600 text-xs pointer-events-none"
                          style={{
                            textShadow: "1px 1px 2px rgba(255,255,255,0.8)",
                          }}
                        >
                          {getStatusLabel(status)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Floating tooltip for better accessibility */}
            {hoveredRegion && (
              <div
                id={`tooltip-${hoveredRegion}`}
                className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 pointer-events-none z-10 max-w-xs"
                role="tooltip"
              >
                <h4 className="font-semibold text-gray-800">
                  {getRegionById(hoveredRegion)?.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Status:{" "}
                  <span className="font-medium">
                    {getStatusLabel(getRegionStatus(hoveredRegion))}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Click to cycle through statuses
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar with Legend and Stats */}
        <div className="lg:w-80 space-y-6">
          <MapLegend />
          <MapStatsDisplay stats={stats} />

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              How to Use
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Hover over regions to see their names</li>
              <li>• Click regions to mark your visit status</li>
              <li>• Use Tab and Enter/Space for keyboard navigation</li>
              <li>• Your progress is automatically saved</li>
            </ul>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              if (
                confirm("Are you sure you want to reset all your progress?")
              ) {
                setMapState({});
              }
            }}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );
}
