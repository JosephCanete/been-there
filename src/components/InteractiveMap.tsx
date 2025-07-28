"use client";

import { useState, useEffect, useCallback } from "react";
import { MapState, MapStats, VisitStatus } from "@/types/map";
import { philippineRegions, getRegionColor } from "@/data/philippineRegions";
import {
  saveMapState,
  calculateMapStats,
  getNextVisitStatus,
  getStatusLabel,
  handleAuthStateChange,
} from "@/utils/mapUtils";
import { subscribeToMapState } from "@/lib/firestore";
import { useAuth } from "./AuthProvider";
import MapLegend from "./MapLegend";
import MapStatsDisplay from "./MapStats";

interface InteractiveMapProps {
  className?: string;
}

/**
 * Interactive SVG Map of the Philippines
 * Allows users to mark regions as visited, stayed, or passed by
 * Persists data in Firestore for authenticated users, localStorage for guests
 */
export default function InteractiveMap({
  className = "",
}: InteractiveMapProps) {
  const { user } = useAuth();
  const [mapState, setMapState] = useState<MapState>({});
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingFromRealtime, setIsUpdatingFromRealtime] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [stats, setStats] = useState<MapStats>({
    beenThere: 0,
    stayedThere: 0,
    passedBy: 0,
    notVisited: philippineRegions.length,
    total: philippineRegions.length,
  });

  // Load state when component mounts or user changes
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        const savedState = await handleAuthStateChange(user);
        setMapState(savedState);
        setStats(calculateMapStats(savedState, philippineRegions.length));
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading initial state:", error);
        setIsLoaded(true);
      }
    };

    loadInitialState();
  }, [user]);

  // Subscribe to real-time updates for authenticated users
  useEffect(() => {
    if (!user || !isLoaded) return;

    const unsubscribe = subscribeToMapState(user, (newMapState) => {
      setIsUpdatingFromRealtime(true);

      // Only update if the new state is different from current state
      setMapState((prev) => {
        const isDifferent =
          JSON.stringify(prev) !== JSON.stringify(newMapState);
        if (isDifferent) {
          setStats(calculateMapStats(newMapState, philippineRegions.length));
          return newMapState;
        }
        return prev;
      });

      // Reset the flag after a short delay
      setTimeout(() => setIsUpdatingFromRealtime(false), 100);
    });

    return () => {
      unsubscribe();
    };
  }, [user, isLoaded]);

  // Save state whenever mapState changes
  useEffect(() => {
    if (isLoaded && !isUpdatingFromRealtime) {
      const saveData = async () => {
        setIsSaving(true);
        try {
          await saveMapState(mapState, user);
        } catch (error) {
          console.error("Error saving map state:", error);
        } finally {
          setIsSaving(false);
        }
      };

      // Debounce saves to avoid too many database writes
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [mapState, isLoaded, user, isUpdatingFromRealtime]);

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // Handle region hover with better boundary detection
  const handleSVGMouseMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      const target = event.target as SVGElement;

      // Check if we're hovering over a region path
      if (target.tagName === "path" && target.getAttribute("data-region-id")) {
        const regionId = target.getAttribute("data-region-id");
        if (regionId && regionId !== hoveredRegion) {
          // Clear any existing timeout
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setHoveredRegion(regionId);
        }
      }
    },
    [hoveredRegion, hoverTimeout]
  );

  const handleSVGMouseLeave = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Add a delay before clearing hover to prevent flickering
    const timeout = setTimeout(() => {
      setHoveredRegion(null);
    }, 150); // Increased delay to 150ms for better stability

    setHoverTimeout(timeout);
  }, [hoverTimeout]);

  // Handle region click - cycle through visit statuses
  const handleRegionClick = useCallback((regionId: string) => {
    setMapState((prev) => {
      const currentStatus = (prev[regionId] as VisitStatus) || "not-visited";
      const nextStatus = getNextVisitStatus(currentStatus);

      const newState = {
        ...prev,
        [regionId]: nextStatus,
      };

      return newState;
    });
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
              className="w-full h-full"
              role="img"
              aria-label="Interactive map of the Philippines"
              onMouseMove={handleSVGMouseMove}
              onMouseLeave={handleSVGMouseLeave}
              style={{
                outline: "none",
              }}
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

                {/* CSS to override any hover/focus styles */}
                <style>{`
                  path {
                    stroke-width: 1px !important;
                    stroke: #6b7280 !important;
                    vector-effect: non-scaling-stroke !important;
                    outline: none !important;
                    border: none !important;
                  }
                  path:hover {
                    stroke-width: 1px !important;
                    stroke: #6b7280 !important;
                  }
                  path:focus {
                    stroke-width: 1px !important;
                    stroke: #6b7280 !important;
                    outline: none !important;
                  }
                  path:active {
                    stroke-width: 1px !important;
                    stroke: #6b7280 !important;
                  }
                `}</style>
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

                // Don't render hovered region in this loop
                if (isHovered) return null;

                return (
                  <g key={region.id}>
                    {/* Region path */}
                    <path
                      d={region.pathData}
                      data-region-id={region.id}
                      className={`
                        ${getRegionColor(status)}
                        cursor-pointer
                      `}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRegionClick(region.id);
                      }}
                      onKeyDown={(e) => handleRegionKeyDown(e, region.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${region.name} - ${getStatusLabel(
                        status
                      )}. Click to change status.`}
                    />
                  </g>
                );
              })}

              {/* Render hovered region last (on top for z-index priority) */}
              {hoveredRegion &&
                (() => {
                  const region = getRegionById(hoveredRegion);
                  if (!region) return null;

                  const status = getRegionStatus(region.id);

                  return (
                    <g key={`${region.id}-hovered`}>
                      {/* Region path - rendered on top */}
                      <path
                        d={region.pathData}
                        data-region-id={region.id}
                        className={`
                        ${getRegionColor(status)}
                        cursor-pointer
                      `}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRegionClick(region.id);
                        }}
                        onKeyDown={(e) => handleRegionKeyDown(e, region.id)}
                        tabIndex={0}
                        role="button"
                        aria-label={`${region.name} - ${getStatusLabel(
                          status
                        )}. Click to change status.`}
                        aria-describedby={`tooltip-${region.id}`}
                      />
                    </g>
                  );
                })()}
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
              <li>
                • Your progress is automatically saved
                {user ? " to your account" : " locally"}
              </li>
            </ul>
          </div>

          {/* Save Status */}
          {isSaving && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                <span className="text-xs text-yellow-800">
                  Saving progress...
                </span>
              </div>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={async () => {
              if (
                confirm("Are you sure you want to reset all your progress?")
              ) {
                const emptyState = {};
                setMapState(emptyState);
                try {
                  await saveMapState(emptyState, user);
                } catch (error) {
                  console.error("Error resetting progress:", error);
                }
              }
            }}
            disabled={isSaving}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );
}
