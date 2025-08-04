"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ReactSVG } from "react-svg";
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
 * Interactive SVG Map of the Philippines using react-svg
 * Better performance and easier manipulation compared to manual SVG parsing
 */
export default function InteractiveMapImproved({
  className = "",
}: InteractiveMapProps) {
  const { user } = useAuth();
  const [mapState, setMapState] = useState<MapState>({});
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [clickedRegion, setClickedRegion] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
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

  // Load initial state when component mounts or user changes
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialState = async () => {
      try {
        const savedState = await handleAuthStateChange(user);
        
        if (isMounted) {
          setMapState(savedState);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error("Error loading initial state:", error);
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadInitialState();
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Save state when region is clicked (not on every mapState change)
  const saveCurrentState = useCallback(async (newMapState: MapState) => {
    try {
      await saveMapState(newMapState, user);
    } catch (error) {
      console.error("Error saving map state:", error);
    }
  }, [user]);

  // Handle region click - cycle through visit statuses
  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (isPanning) return;

      console.log("Region clicked:", regionId);

      setClickedRegion(regionId);
      setTimeout(() => setClickedRegion(null), 200);

      setMapState((prev) => {
        const currentStatus = (prev[regionId] as VisitStatus) || "not-visited";
        const nextStatus = getNextVisitStatus(currentStatus);

        const newMapState = {
          ...prev,
          [regionId]: nextStatus,
        };

        // Save the new state immediately
        saveCurrentState(newMapState);

        return newMapState;
      });
    },
    [isPanning, saveCurrentState]
  );

  // Get region status for styling
  const getRegionStatus = (regionId: string): VisitStatus => {
    return (mapState[regionId] as VisitStatus) || "not-visited";
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

  // Handle SVG loaded - this is where we set up interactivity
  const handleSvgLoaded = useCallback((svgElement: SVGSVGElement) => {
    console.log("SVG loaded successfully");

    // Find all Philippine regions (paths with id starting with "PH-")
    const paths = svgElement.querySelectorAll('path[id^="PH-"]');
    console.log(`Found ${paths.length} regions`);

    // Update stats with correct region count
    const initialStats = calculateMapStats(mapState, paths.length);
    setStats(initialStats);
    previousStatsRef.current = initialStats;

    // Add interactivity to each region
    paths.forEach((path) => {
      const regionId = path.getAttribute("id");
      if (!regionId) return;

      const pathElement = path as SVGPathElement;
      const status = getRegionStatus(regionId);

      // Set initial colors
      pathElement.style.fill = getFillColor(status);
      pathElement.style.stroke = getStrokeColor(status);
      pathElement.style.strokeWidth = "1px";
      pathElement.style.cursor = "pointer";

      // Create event handlers with proper cleanup
      const handleClick = () => handleRegionClick(regionId);
      const handleMouseEnter = () => {
        setHoveredRegion(regionId);
        pathElement.style.strokeWidth = "2px";
        pathElement.style.filter = "brightness(110%)";
      };
      const handleMouseLeave = () => {
        setHoveredRegion(null);
        pathElement.style.strokeWidth = "1px";
        pathElement.style.filter = "none";
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRegionClick(regionId);
        }
      };

      // Add event listeners
      pathElement.addEventListener("click", handleClick);
      pathElement.addEventListener("mouseenter", handleMouseEnter);
      pathElement.addEventListener("mouseleave", handleMouseLeave);
      pathElement.addEventListener("keydown", handleKeyDown);

      // Add keyboard support
      pathElement.setAttribute("tabindex", "0");

      // Store cleanup function
      (pathElement as any)._cleanup = () => {
        pathElement.removeEventListener("click", handleClick);
        pathElement.removeEventListener("mouseenter", handleMouseEnter);
        pathElement.removeEventListener("mouseleave", handleMouseLeave);
        pathElement.removeEventListener("keydown", handleKeyDown);
      };
    });
  }, [mapState, handleRegionClick]);

  // Update region colors when mapState changes (simplified)
  useEffect(() => {
    if (!isLoaded) return;

    const updateColors = () => {
      const svgElement = document.querySelector(
        'svg[data-region-map="true"]'
      ) as SVGSVGElement;
      if (!svgElement) return;

      const paths = svgElement.querySelectorAll('path[id^="PH-"]');
      
      paths.forEach((path) => {
        const regionId = path.getAttribute("id");
        if (!regionId) return;

        const pathElement = path as SVGPathElement;
        const status = getRegionStatus(regionId);

        pathElement.style.fill = getFillColor(status);
        pathElement.style.stroke = getStrokeColor(status);
      });

      // Update stats
      const newStats = calculateMapStats(mapState, paths.length);
      setStats(newStats);
    };

    // Use a small delay to prevent excessive updates
    const timeoutId = setTimeout(updateColors, 10);
    
    return () => clearTimeout(timeoutId);
  }, [mapState, isLoaded]);
  }, [mapState, isLoaded]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up event listeners when component unmounts
      const svgElement = document.querySelector(
        'svg[data-region-map="true"]'
      ) as SVGSVGElement;
      if (svgElement) {
        const paths = svgElement.querySelectorAll('path[id^="PH-"]');
        paths.forEach((path) => {
          const pathElement = path as any;
          if (pathElement._cleanup) {
            pathElement._cleanup();
          }
        });
      }
    };
  }, []);

  // Handle SVG error
  const handleSvgError = (error: Error) => {
    console.error("Error loading SVG:", error);
  };

  // Pan and zoom handlers (simplified)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * zoomFactor, 0.5), 5),
    }));
  }, []);

  const resetView = useCallback(() => {
    setTransform({ scale: 1, translateX: 0, translateY: 0 });
  }, []);

  if (!isLoaded) {
    return (
      <div className={`flex flex-col lg:flex-row h-full ${className}`}>
        <div className="flex-1 relative min-h-[50vh] lg:h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 lg:h-16 lg:w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-700 font-medium">
              Loading Philippine map...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col lg:flex-row h-full ${className}`}>
      {/* Main Map Area */}
      <div className="flex-1 relative min-h-[60vh] lg:h-full">
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100"
          onWheel={handleWheel}
          style={{ cursor: isPanning ? "grabbing" : "grab" }}
        >
          <div
            style={{
              transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
              transformOrigin: "center",
              transition: isPanning ? "none" : "transform 0.1s ease-out",
            }}
          >
            <ReactSVG
              src="/philippines.svg"
              afterInjection={(svg) => {
                if (svg) {
                  // Add data attribute for identification
                  svg.setAttribute("data-region-map", "true");
                  svg.style.maxWidth = "100%";
                  svg.style.maxHeight = "100vh";
                  handleSvgLoaded(svg);
                }
              }}
              onError={(error) =>
                handleSvgError(
                  error instanceof Error ? error : new Error(String(error))
                )
              }
              loading={() => (
                <div className="animate-pulse bg-blue-200 rounded-lg w-96 h-96"></div>
              )}
            />
          </div>
        </div>

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
            +
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
            -
          </button>
          <button
            onClick={resetView}
            className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-black"
            title="Reset View"
          >
            ⌂
          </button>
          <div className="px-1 py-0.5 lg:px-2 lg:py-1 bg-white rounded shadow-lg border border-gray-200 text-xs text-black">
            {Math.round(transform.scale * 100)}%
          </div>
        </div>

        {/* Floating tooltip */}
        {hoveredRegion && (
          <div className="absolute top-2 left-2 lg:top-4 lg:left-4 bg-white rounded-lg shadow-xl p-3 lg:p-4 pointer-events-none z-20 max-w-xs border border-gray-200">
            <h4 className="font-bold text-gray-800 text-sm lg:text-lg">
              {hoveredRegion.replace("PH-", "")}
            </h4>
            <p className="text-xs lg:text-sm text-gray-600">
              Status:{" "}
              <span className="font-semibold">
                {getStatusLabel(getRegionStatus(hoveredRegion))}
              </span>
            </p>
            <p className="text-xs text-blue-600 mt-1">Click to change status</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-1/5 lg:min-w-72 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">
        <div className="p-3 lg:p-6 space-y-3 lg:space-y-6">
          <MapStatsDisplay stats={stats} />
          <MapLegend />

          <div className="bg-blue-50 rounded-lg p-3 lg:p-4">
            <h3 className="text-xs lg:text-sm font-semibold text-blue-800 mb-2">
              How to Use
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Click regions to cycle through statuses</li>
              <li>• Scroll to zoom, drag to pan</li>
              <li>• Progress saved {user ? "to your account" : "locally"}</li>
            </ul>
          </div>
        </div>

        {/* Reset Button */}
        <div className="p-3 lg:p-6 border-t border-gray-200 bg-gray-50 mt-auto">
          <button
            onClick={async () => {
              if (confirm("Reset all progress?")) {
                const emptyState = {};
                setMapState(emptyState);
                try {
                  await saveMapState(emptyState, user);
                } catch (error) {
                  console.error("Error resetting progress:", error);
                }
              }
            }}
            className="w-full px-3 py-2 text-xs lg:text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            Reset All Progress
          </button>
        </div>
      </div>
    </div>
  );
}
