"use client";

import { useState, useEffect, useCallback } from "react";
import { MapState, MapStats, VisitStatus } from "@/types/map";
import {
  saveMapState,
  calculateMapStats,
  getNextVisitStatus,
  getStatusLabel,
  handleAuthStateChange,
} from "@/utils/mapUtils";
import { useAuth } from "./AuthProvider";
import MapLegend from "./MapLegend";
import MapStatsDisplay from "./MapStats";

interface InteractiveMapProps {
  className?: string;
}

/**
 * Interactive SVG Map of the Philippines using real geographic data
 * Uses the amCharts SVG file and allows interaction with individual provinces/regions
 */
export default function InteractiveMap({
  className = "",
}: InteractiveMapProps) {
  const { user } = useAuth();
  const [mapState, setMapState] = useState<MapState>({});
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [clickedRegion, setClickedRegion] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [svgContent, setSvgContent] = useState<string>("");
  const [stats, setStats] = useState<MapStats>({
    beenThere: 0,
    stayedThere: 0,
    passedBy: 0,
    notVisited: 0,
    total: 0,
  });

  // Pan and zoom state
  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(
    null
  );

  // Load SVG content and parse regions
  useEffect(() => {
    const loadSVG = async () => {
      try {
        const response = await fetch("/philippines.svg");
        const svgText = await response.text();
        setSvgContent(svgText);

        // Count regions from SVG
        const regionMatches = svgText.match(/id="PH-[^"]+"/g);
        const regionCount = regionMatches ? regionMatches.length : 0;

        // Load saved state using auth state
        console.log("Loading map state for user:", user?.uid || "guest");
        const savedState = await handleAuthStateChange(user);
        console.log("Loaded map state:", savedState);
        setMapState(savedState);
        setStats(calculateMapStats(savedState, regionCount));
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading Philippines SVG:", error);
        setIsLoaded(true);
      }
    };

    loadSVG();
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === "INPUT") return;

      switch (e.key.toLowerCase()) {
        case "r":
          setTransform({ scale: 1, translateX: 0, translateY: 0 });
          break;
        case "=":
        case "+":
          setTransform((prev) => ({
            ...prev,
            scale: Math.min(prev.scale * 1.2, 5),
          }));
          break;
        case "-":
          setTransform((prev) => ({
            ...prev,
            scale: Math.max(prev.scale * 0.8, 0.5),
          }));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  // Save state whenever mapState changes
  useEffect(() => {
    const saveData = async () => {
      if (isLoaded && svgContent) {
        console.log("=== SAVE DEBUG ===");
        console.log("About to save mapState:", mapState);
        console.log("User:", user?.uid);
        console.log("Is loaded:", isLoaded);
        console.log("Has SVG content:", !!svgContent);

        await saveMapState(mapState, user);

        const regionMatches = svgContent.match(/id="PH-[^"]+"/g);
        const regionCount = regionMatches ? regionMatches.length : 0;
        setStats(calculateMapStats(mapState, regionCount));
      }
    };

    saveData();
  }, [mapState, isLoaded, svgContent, user]);

  // Handle region click - cycle through visit statuses
  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (isPanning) return; // Don't click regions while panning

      console.log("=== REGION CLICK DEBUG ===");
      console.log("Region ID:", regionId);
      console.log("Current user:", user?.uid);

      // Add click feedback
      setClickedRegion(regionId);
      setTimeout(() => setClickedRegion(null), 200);

      setMapState((prev) => {
        const currentStatus = (prev[regionId] as VisitStatus) || "not-visited";
        const nextStatus = getNextVisitStatus(currentStatus);

        console.log(
          `Changing ${regionId} from ${currentStatus} to ${nextStatus}`
        );

        const newState = {
          ...prev,
          [regionId]: nextStatus,
        };

        console.log("New map state:", newState);
        return newState;
      });
    },
    [isPanning, user]
  );

  // Pan and zoom handlers
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.5), 5);

      // Zoom towards mouse position
      const scaleChange = newScale / transform.scale;
      const newTranslateX =
        transform.translateX -
        (mouseX - centerX - transform.translateX) * (scaleChange - 1);
      const newTranslateY =
        transform.translateY -
        (mouseY - centerY - transform.translateY) * (scaleChange - 1);

      setTransform({
        scale: newScale,
        translateX: newTranslateX,
        translateY: newTranslateY,
      });
    },
    [transform]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left mouse button
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;

        setTransform((prev) => ({
          ...prev,
          translateX: prev.translateX + deltaX,
          translateY: prev.translateY + deltaY,
        }));

        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
    },
    [isPanning, lastPanPoint]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Reset zoom and pan
  const resetView = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  // Touch handlers for mobile
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      setLastPanPoint({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      setLastTouchDistance(getTouchDistance(e.touches));
    }
    e.preventDefault();
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1 && isPanning) {
        const deltaX = e.touches[0].clientX - lastPanPoint.x;
        const deltaY = e.touches[0].clientY - lastPanPoint.y;

        setTransform((prev) => ({
          ...prev,
          translateX: prev.translateX + deltaX,
          translateY: prev.translateY + deltaY,
        }));

        setLastPanPoint({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      } else if (e.touches.length === 2 && lastTouchDistance) {
        const newDistance = getTouchDistance(e.touches);
        if (newDistance) {
          const zoomFactor = newDistance / lastTouchDistance;
          const newScale = Math.min(
            Math.max(transform.scale * zoomFactor, 0.5),
            5
          );

          setTransform((prev) => ({ ...prev, scale: newScale }));
          setLastTouchDistance(newDistance);
        }
      }
      e.preventDefault();
    },
    [isPanning, lastPanPoint, lastTouchDistance, transform.scale]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    setLastTouchDistance(null);
  }, []);

  // Get region status for styling
  const getRegionStatus = (regionId: string): VisitStatus => {
    return (mapState[regionId] as VisitStatus) || "not-visited";
  };

  // Get region name from title attribute
  const getRegionName = (regionId: string): string => {
    const titleMatch = svgContent.match(
      new RegExp(`id="${regionId}"[^>]*title="([^"]+)"`)
    );
    return titleMatch ? titleMatch[1] : regionId.replace("PH-", "");
  };

  // Get fill color based on status
  const getFillColor = (status: VisitStatus): string => {
    switch (status) {
      case "been-there":
        return "#10b981"; // green-500
      case "stayed-there":
        return "#3b82f6"; // blue-500
      case "passed-by":
        return "#eab308"; // yellow-500
      case "not-visited":
      default:
        return "#d1d5db"; // gray-300
    }
  };

  // Get stroke color based on status
  const getStrokeColor = (status: VisitStatus): string => {
    switch (status) {
      case "been-there":
        return "#047857"; // green-700
      case "stayed-there":
        return "#1d4ed8"; // blue-700
      case "passed-by":
        return "#a16207"; // yellow-700
      case "not-visited":
      default:
        return "#6b7280"; // gray-500
    }
  };

  // Render interactive SVG
  const renderInteractiveSVG = () => {
    if (!svgContent) return null;

    // Parse the SVG content
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = doc.querySelector("svg");

    if (!svgElement) return null;

    // Get all path elements (regions)
    const paths = Array.from(svgElement.querySelectorAll('path[id^="PH-"]'));

    return (
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: isPanning ? "grabbing" : "grab", touchAction: "none" }}
      >
        <svg
          viewBox="-20 -20 770 1250"
          className="max-w-full max-h-full select-none"
          style={{
            aspectRatio: "770/1250",
            transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
            transformOrigin: "center",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
          role="img"
          aria-label="Interactive map of the Philippines - Click regions to track your visits"
        >
          {/* Render all Philippine regions */}
          {paths.map((path) => {
            const regionId = path.getAttribute("id") || "";
            const pathData = path.getAttribute("d") || "";
            const status = getRegionStatus(regionId);
            const isHovered = hoveredRegion === regionId;
            const isClicked = clickedRegion === regionId;

            return (
              <path
                key={regionId}
                id={`interactive-${regionId}`}
                d={pathData}
                fill={getFillColor(status)}
                stroke={getStrokeColor(status)}
                strokeWidth={isHovered || isClicked ? "2" : "1"}
                className={`cursor-pointer transition-all duration-200 ease-in-out ${
                  isClicked
                    ? "brightness-125 scale-105"
                    : isHovered
                    ? "brightness-110 scale-102"
                    : "hover:brightness-105"
                }`}
                style={{
                  filter:
                    isHovered || isClicked
                      ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                      : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                  transformOrigin: "center",
                }}
                onClick={() => handleRegionClick(regionId)}
                onMouseEnter={() => setHoveredRegion(regionId)}
                onMouseLeave={() => setHoveredRegion(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleRegionClick(regionId);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`${getRegionName(regionId)} - ${getStatusLabel(
                  status
                )}. Click to change status.`}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <div className={`flex flex-col lg:flex-row h-full ${className}`}>
        {/* Map Loading Skeleton */}
        <div className="flex-1 relative min-h-[50vh] lg:h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700 font-medium">
              Loading Philippine map...
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Preparing your travel tracker
            </p>
          </div>
        </div>

        {/* Sidebar Loading Skeleton */}
        <div className="w-full lg:w-1/5 lg:min-w-72 bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
          <div className="p-3 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="h-6 bg-blue-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-blue-100 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="p-3 lg:p-6 space-y-4">
            <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row h-full ${className}`}>
      {/* Main Map Area - Full width on mobile, 80% on desktop */}
      <div className="flex-1 relative min-h-[60vh] lg:h-full">
        {renderInteractiveSVG()}

        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 lg:top-4 lg:right-4 flex flex-col gap-1 lg:gap-2 z-30">
          <button
            onClick={() =>
              setTransform((prev) => ({
                ...prev,
                scale: Math.min(prev.scale * 1.2, 5),
              }))
            }
            className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-black"
            title="Zoom In"
          >
            <svg
              className="w-4 h-4 lg:w-5 lg:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
          <button
            onClick={() =>
              setTransform((prev) => ({
                ...prev,
                scale: Math.max(prev.scale * 0.8, 0.5),
              }))
            }
            className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-black"
            title="Zoom Out"
          >
            <svg
              className="w-4 h-4 lg:w-5 lg:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 12H6"
              />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-black"
            title="Reset View"
          >
            <svg
              className="w-4 h-4 lg:w-5 lg:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <div className="px-1 py-0.5 lg:px-2 lg:py-1 bg-white rounded shadow-lg border border-gray-200 text-xs text-black">
            {Math.round(transform.scale * 100)}%
          </div>
        </div>

        {/* Enhanced floating tooltip */}
        {hoveredRegion && !isPanning && (
          <div className="absolute top-2 left-2 lg:top-4 lg:left-4 bg-white rounded-lg shadow-xl p-3 lg:p-4 pointer-events-none z-20 max-w-xs border border-gray-200 transform transition-all duration-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-gray-800 text-sm lg:text-lg">
                {getRegionName(hoveredRegion)}
              </h4>
              <div
                className="w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2"
                style={{
                  backgroundColor: getFillColor(getRegionStatus(hoveredRegion)),
                  borderColor: getStrokeColor(getRegionStatus(hoveredRegion)),
                }}
              ></div>
            </div>
            <div className="space-y-1">
              <p className="text-xs lg:text-sm text-gray-600">
                Current:{" "}
                <span className="font-semibold text-gray-800">
                  {getStatusLabel(getRegionStatus(hoveredRegion))}
                </span>
              </p>
              <p className="text-xs text-blue-600">
                Next:{" "}
                <span className="font-medium">
                  {getStatusLabel(
                    getNextVisitStatus(getRegionStatus(hoveredRegion))
                  )}
                </span>
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 9.293 10.793a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Click to update status
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Full width on mobile, 20% on desktop */}
      <div className="w-full lg:w-1/5 lg:min-w-72 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 hidden lg:block">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-1 lg:mb-2">
            Your Progress
          </h2>
          <p className="text-xs lg:text-sm text-gray-600">
            Track your Philippine adventures across all {stats.total} regions
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 lg:p-6 space-y-3 lg:space-y-6">
            <MapStatsDisplay stats={stats} />
            <MapLegend />

            {/* Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 lg:p-4 border border-blue-200">
              <h3 className="text-xs lg:text-sm font-semibold text-blue-800 mb-2 lg:mb-3 flex items-center">
                <svg
                  className="w-3 h-3 lg:w-4 lg:h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                How to Use
              </h3>
              <ul className="text-xs text-blue-700 space-y-1 lg:space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Hover over regions to see their names and current status
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Click regions to cycle through: Not Visited → Passed By →
                    Been There → Stayed There
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Drag to pan around the map</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Scroll to zoom in/out or use zoom controls</span>
                </li>
                <li className="flex items-start lg:hidden">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Use pinch gestures to zoom on touch devices</span>
                </li>
                <li className="hidden lg:flex lg:items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Use Tab and Enter/Space for keyboard navigation</span>
                </li>
                <li className="hidden lg:flex lg:items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Press R to reset view, +/- to zoom</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>
                    Your progress is automatically saved
                    {user ? " to your account" : " locally"}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer with Reset Button */}
        <div className="p-3 lg:p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={async () => {
              if (
                confirm(
                  "Are you sure you want to reset all your progress? This cannot be undone."
                )
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
            className="w-full px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
          >
            <svg
              className="w-3 h-3 lg:w-4 lg:h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );
}
