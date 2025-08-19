"use client";
/* eslint-disable */

import { useState, useEffect, useCallback, useRef } from "react";
import { MapState, MapStats, VisitStatus } from "@/types/map";
import {
  saveMapState,
  calculateMapStats,
  getNextVisitStatus,
  getStatusLabel,
  handleAuthStateChange,
  getFillColor,
  getStrokeColor,
} from "@/utils/mapUtils";
import { useAuth } from "./AuthProvider";
import MapStatsDisplay from "./MapStats";
import MapSnapshot from "./MapSnapshot";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useRouter } from "next/navigation";
import { loadUsername, saveSnapshot, buildShareUrl } from "@/utils/share";

interface InteractiveMapProps {
  initialSvgContent: string;
  initialValidProvinceIds: string[];
}

export default function InteractiveMap({
  initialSvgContent,
  initialValidProvinceIds,
}: InteractiveMapProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [mapState, setMapState] = useState<MapState>({});
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [clickedRegion, setClickedRegion] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [svgContent] = useState<string>(initialSvgContent);
  // Province ids we count for stats (derived from SVG PH-* ids)
  const [validProvinceIds] = useState<string[]>(initialValidProvinceIds);
  const [stats, setStats] = useState<MapStats>({
    beenThere: 0,
    stayedThere: 0,
    passedBy: 0,
    notVisited: 0,
    total: 0,
  });

  // Pan and zoom state (managed by react-zoom-pan-pinch)
  const [isPanning, setIsPanning] = useState(false);
  // Fullscreen support
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Mobile share state
  const [isSharingMobile, setIsSharingMobile] = useState(false);

  // Create shareable link (mobile icon button)
  const createPermalinkMobile = useCallback(async () => {
    if (!user || isSharingMobile) return;
    setIsSharingMobile(true);
    try {
      const username = await loadUsername(user.uid);
      if (!username) {
        router.push("/onboarding");
        return;
      }
      await saveSnapshot(mapState, stats, user);
      const url = buildShareUrl(username);
      router.push(url);
    } catch (e) {
      console.error("Error creating permalink (mobile):", e);
    } finally {
      setIsSharingMobile(false);
    }
  }, [user, isSharingMobile, mapState, stats, router]);

  // Load saved state and compute stats using preloaded SVG data
  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await handleAuthStateChange(user);
        setMapState(savedState);
        const regionCount = validProvinceIds.length;
        const filteredForStats = Object.fromEntries(
          Object.entries(savedState).filter(([k]) =>
            validProvinceIds.includes(k)
          )
        ) as MapState;
        setStats(calculateMapStats(filteredForStats, regionCount));
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading saved map state:", error);
        setIsLoaded(true);
      }
    };

    loadState();
  }, [user, validProvinceIds]);

  useEffect(() => {
    const handleFsChange = () => {
      const d: any = document as any;
      const fsEl =
        document.fullscreenElement ||
        d.webkitFullscreenElement ||
        d.mozFullScreenElement ||
        d.msFullscreenElement;
      setIsFullscreen(!!fsEl);
      // If we entered or exited real fullscreen, ensure pseudo mode is off
      if (!!fsEl) setIsPseudoFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange as any);
    document.addEventListener("mozfullscreenchange", handleFsChange as any);
    document.addEventListener("MSFullscreenChange", handleFsChange as any);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFsChange as any
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFsChange as any
      );
      document.removeEventListener("MSFullscreenChange", handleFsChange as any);
    };
  }, []);

  // Lock body scroll when using pseudo fullscreen (mobile fallback)
  useEffect(() => {
    if (!isPseudoFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isPseudoFullscreen]);

  const toggleFullscreen = useCallback(async () => {
    const el: any = containerRef.current as any;
    const d: any = document as any;

    // Determine availability of Fullscreen API on this element
    const request =
      el?.requestFullscreen ||
      el?.webkitRequestFullscreen ||
      el?.msRequestFullscreen ||
      el?.mozRequestFullScreen;

    if (!isFullscreen && !isPseudoFullscreen) {
      if (request) {
        try {
          const result = request.call(el);
          // Some browsers return a promise
          if (result && typeof result.then === "function") {
            await result;
          }
        } catch (e) {
          // Fallback to CSS-based fullscreen on failure (common on iOS Safari)
          setIsPseudoFullscreen(true);
        }
      } else {
        // No Fullscreen API support on this element (mobile Safari)
        setIsPseudoFullscreen(true);
      }
    } else {
      // Exit fullscreen
      if (
        document.exitFullscreen ||
        (d as any).webkitExitFullscreen ||
        (d as any).msExitFullscreen ||
        (d as any).mozCancelFullScreen
      ) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if ((d as any).webkitExitFullscreen)
          (d as any).webkitExitFullscreen();
        else if ((d as any).msExitFullscreen) (d as any).msExitFullscreen();
        else if ((d as any).mozCancelFullScreen)
          (d as any).mozCancelFullScreen();
      } else {
        setIsPseudoFullscreen(false);
      }
    }
  }, [isFullscreen, isPseudoFullscreen]);

  // Save state whenever mapState changes
  useEffect(() => {
    const saveData = async () => {
      if (isLoaded && svgContent && validProvinceIds.length > 0) {
        await saveMapState(mapState, user);
        // Use SVG-derived ids and total for stats
        const regionCount = validProvinceIds.length;
        const filteredForStats = Object.fromEntries(
          Object.entries(mapState).filter(([k]) => validProvinceIds.includes(k))
        ) as MapState;
        setStats(calculateMapStats(filteredForStats, regionCount));
      }
    };

    saveData();
  }, [mapState, isLoaded, svgContent, user, validProvinceIds]);

  // Handle region click - cycle through visit statuses
  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (isPanning) return; // Don't click regions while panning

      // Add click feedback
      setClickedRegion(regionId);
      setTimeout(() => setClickedRegion(null), 120);

      setMapState((prev) => {
        const currentStatus = (prev[regionId] as VisitStatus) || "not-visited";
        const nextStatus = getNextVisitStatus(currentStatus);

        const newState = {
          ...prev,
          [regionId]: nextStatus,
        };

        return newState;
      });
    },
    [isPanning, user]
  );

  const controlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
  } | null>(null);

  // Get region status for styling
  const getRegionStatus = (provinceId: string): VisitStatus => {
    return (mapState[provinceId] as VisitStatus) || "not-visited";
  };

  // Get region name from title attribute
  const getRegionName = (provinceId: string): string => {
    const titleMatch = svgContent.match(
      new RegExp(`id="${provinceId}"[^>]*title="([^"]+)"`)
    );
    return titleMatch ? titleMatch[1] : provinceId.replace("PH-", "");
  };

  // Render interactive SVG
  const renderInteractiveSVG = () => {
    if (!svgContent) return null;

    // Parse the SVG content
    const parser = new DOMParser();
    const docXml = parser.parseFromString(svgContent, "image/svg+xml");
    const svgElement = docXml.querySelector("svg");

    if (!svgElement) return null;

    // Get all path elements (regions)
    const paths = Array.from(
      svgElement.querySelectorAll('path[id^="PH-"], path[id^="PH_"]')
    );
    if (validProvinceIds.length && paths.length !== validProvinceIds.length) {
      console.warn(
        `Map SVG provinces (${paths.length}) do not match counted total (${validProvinceIds.length}).`
      );
    }

    return (
      <div
        className={`map-zoom-container ${
          isPseudoFullscreen ? "fixed inset-0 z-50" : "absolute inset-0"
        } overflow-hidden w-full h-full`}
        style={{
          // Gentle sea-like blend (light to slightly deeper blue)
          background:
            "radial-gradient(1200px 800px at 20% 15%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #cfeeff 0%, #aadaff 45%, #8ccfff 100%)",
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
          // Use dynamic viewport units to better handle mobile browser chrome
          height: isPseudoFullscreen ? "100dvh" : undefined,
        }}
        ref={containerRef}
      >
        <div className="w-full h-full">
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            wheel={{ step: 0.2 }}
            pinch={{ step: 0.2 }}
            doubleClick={{ disabled: true }}
            panning={{ velocityDisabled: true }}
            limitToBounds={false}
            alignmentAnimation={{
              disabled: true,
              sizeX: 0,
              sizeY: 0,
              animationTime: 0,
            }}
            onPanningStart={() => setIsPanning(true)}
            onPanningStop={() => setIsPanning(false)}
          >
            {({ zoomIn, zoomOut, resetTransform }) => {
              // Expose controls to keyboard handler and external reset
              controlsRef.current = { zoomIn, zoomOut, resetTransform };
              return (
                <>
                  <TransformComponent
                    wrapperClass="w-full h-full"
                    contentClass="w-full h-full"
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                  >
                    <svg
                      viewBox="-20 -20 770 1250"
                      className="w-full h-full select-none"
                      preserveAspectRatio="xMidYMid meet"
                      role="img"
                      aria-label="Interactive map of the Philippines - Click provinces to track your visits"
                    >
                      {/* Render all Philippine provinces */}
                      {paths.map((path) => {
                        const provinceId = path.getAttribute("id") || "";
                        const pathData = path.getAttribute("d") || "";
                        const status = getRegionStatus(provinceId);
                        // Subtle click-only feedback
                        const isClicked = clickedRegion === provinceId;

                        return (
                          <path
                            key={provinceId}
                            id={`interactive-${provinceId}`}
                            d={pathData}
                            fill={getFillColor(status)}
                            stroke={getStrokeColor(status)}
                            strokeWidth={"1"}
                            className={`cursor-pointer transition-all duration-100 ease-out ${
                              isClicked ? "brightness-110 scale-[1.01]" : ""
                            }`}
                            style={{
                              filter: isClicked
                                ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                : "drop-shadow(0 1px 2px rgba(0,0,0,0.12))",
                              transformOrigin: "center",
                            }}
                            onClick={() => handleRegionClick(provinceId)}
                            onMouseEnter={() => setHoveredRegion(provinceId)}
                            onMouseLeave={() => setHoveredRegion(null)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleRegionClick(provinceId);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`${getRegionName(
                              provinceId
                            )} - ${getStatusLabel(
                              status
                            )}. Click to change status.`}
                          />
                        );
                      })}
                    </svg>
                  </TransformComponent>

                  {/* Zoom Controls (moved inside wrapper for access to controls) */}
                  <div className="absolute top-2 right-2 lg:top-4 lg:right-4 flex flex-col gap-1 lg:gap-2 z-30">
                    <button
                      onClick={() => zoomIn()}
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
                      onClick={() => zoomOut()}
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
                      onClick={() => resetTransform()}
                      className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-black"
                      title="Reset position"
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
                          d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 00-15.5 3M4 16a8 8 0 0015.5-3"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={toggleFullscreen}
                      className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-black"
                      title={
                        isFullscreen || isPseudoFullscreen
                          ? "Exit Fullscreen"
                          : "Enter Fullscreen"
                      }
                    >
                      {isFullscreen || isPseudoFullscreen ? (
                        // Exit fullscreen icon
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
                            d="M9 3H5v4M5 15v4h4M21 9V5h-4M17 21h4v-4"
                          />
                        </svg>
                      ) : (
                        // Enter fullscreen icon
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
                            d="M8 4H4v4M20 16v4h-4M20 8V4h-4M4 16v4h4"
                          />
                        </svg>
                      )}
                    </button>
                    {/* New Share button below fullscreen */}
                    <button
                      onClick={createPermalinkMobile}
                      disabled={!user || isSharingMobile}
                      className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-black disabled:opacity-60"
                      title={
                        !user
                          ? "Sign in to visit your shareable link"
                          : "Visit Your Shareable Link"
                      }
                      aria-busy={isSharingMobile}
                    >
                      {/* Share icon */}
                      <svg
                        className="w-4 h-4 lg:w-5 lg:h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="6" cy="12" r="2" fill="currentColor" />
                        <circle cx="18" cy="6" r="2" fill="currentColor" />
                        <circle cx="18" cy="18" r="2" fill="currentColor" />
                        <path
                          d="M8 12l8-5M8 12l8 6"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Mobile-only: bottom pinned share link CTA */}
                  <div
                    className="fixed z-30 lg:hidden"
                    style={{
                      bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
                      left: "calc(env(safe-area-inset-left, 0px) + 1rem)",
                      right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
                    }}
                  >
                    <button
                      onClick={createPermalinkMobile}
                      disabled={!user || isSharingMobile}
                      aria-busy={isSharingMobile}
                      aria-live="polite"
                      className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-60 disabled:transform-none disabled:shadow-lg disabled:cursor-not-allowed relative overflow-hidden"
                      title={
                        !user
                          ? "Sign in to visit your shareable link"
                          : "Visit Your Shareable Link"
                      }
                    >
                      {isSharingMobile ? (
                        <span className="inline-flex items-center gap-2">
                          <span className="relative inline-flex">
                            <span className="absolute inline-flex h-5 w-5 rounded-full bg-white/30 opacity-60 animate-ping"></span>
                            <svg
                              className="relative w-5 h-5 text-white animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              />
                            </svg>
                          </span>
                          <span className="text-sm font-medium">
                            Preparing your link…
                          </span>
                        </span>
                      ) : (
                        <>
                          <span className="text-sm font-medium">
                            Visit Your Shareable Link
                          </span>
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <circle cx="6" cy="12" r="2" fill="currentColor" />
                            <circle cx="18" cy="6" r="2" fill="currentColor" />
                            <circle cx="18" cy="18" r="2" fill="currentColor" />
                            <path
                              d="M8 12l8-5M8 12l8 6"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </>
              );
            }}
          </TransformWrapper>
        </div>

        {/* Enhanced floating tooltip */}
        {hoveredRegion && !isPanning && (
          <div
            className="absolute bg-white rounded-lg shadow-xl p-3 lg:p-4 pointer-events-none z-20 max-w-xs border border-gray-200 transform transition-all duration-200 lg:top-4 lg:left-4"
            style={{
              top: "calc(env(safe-area-inset-top, 0px) + 0.5rem)",
              left: "calc(env(safe-area-inset-left, 0px) + 0.5rem)",
            }}
          >
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
    );
  };

  // Loading state UI
  if (!isLoaded) {
    return (
      <div className={`flex flex-col lg:flex-row h-full w-full`}>
        {/* Map Loading Skeleton */}
        <div className="flex-1 relative min-h-[50vh] lg:h-full">
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background:
                "radial-gradient(1200px 800px at 20% 15%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #cfeeff 0%, #aadaff 45%, #8ccfff 100%)",
            }}
          >
            <div className="w-full h-full p-4 lg:p-6">
              {/* Map viewport skeleton */}
              <div className="w-full h-full rounded-xl border border-blue-100/60 bg-white/40 shadow-inner animate-pulse" />
              {/* Zoom controls skeleton */}
              <div className="absolute top-10 right-10 flex flex-col gap-2">
                <div className="w-9 h-9 bg-white/70 border border-gray-200 rounded-lg animate-pulse" />
                <div className="w-9 h-9 bg-white/70 border border-gray-200 rounded-lg animate-pulse" />
                <div className="w-9 h-9 bg-white/70 border border-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Loading Skeleton */}
        <div className="w-full lg:w-1/5 lg:min-w-72 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">
          <div className="p-3 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="h-6 bg-blue-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-blue-100 rounded animate-pulse w-3/4"></div>
          </div>
          <div className="flex-1 p-3 lg:p-6 space-y-4">
            <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="p-3 lg:p-6 border-t border-gray-200 bg-gray-50 space-y-3">
            <div className="h-10 bg-blue-200 rounded animate-pulse"></div>
            <div className="h-10 bg-red-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Main layout
  return (
    <div
      className={`flex flex-col lg:flex-row h-[100dvh] lg:h-full overflow-hidden w-full `}
    >
      {/* Main Map Area - Full width on mobile, 80% on desktop */}
      <div className="relative h-full min-w-0 lg:flex-1 lg:h-full">
        {renderInteractiveSVG()}
      </div>

      {/* Right Sidebar - hidden on mobile, 20% on desktop */}
      <div className="hidden lg:flex lg:w-1/5 lg:min-w-72 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 hidden lg:block">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-1 lg:mb-2">
            Your Progress
          </h2>
          <p className="text-xs lg:text-sm text-gray-600">
            Track your Philippine adventures across all {stats.total} provinces
          </p>
        </div>

        <div className="flex-1 overflow-y-auto hidden lg:block">
          <div className="p-3 lg:p-6 space-y-3 lg:space-y-6">
            <MapStatsDisplay stats={stats} />
          </div>
        </div>

        <div className="p-3 lg:p-6 border-t border-gray-200 bg-gray-50 space-y-3 hidden lg:block">
          <MapSnapshot
            mapState={mapState}
            stats={stats}
            svgContent={svgContent}
          />
        </div>
      </div>
    </div>
  );
}
