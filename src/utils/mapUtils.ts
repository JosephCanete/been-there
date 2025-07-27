import { MapState, MapStats, VisitStatus } from "@/types/map";

const STORAGE_KEY = "philippine-map-visits";

/**
 * Load visit status from localStorage
 */
export const loadMapState = (): MapState => {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error loading map state from localStorage:", error);
    return {};
  }
};

/**
 * Save visit status to localStorage
 */
export const saveMapState = (mapState: MapState): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapState));
  } catch (error) {
    console.error("Error saving map state to localStorage:", error);
  }
};

/**
 * Calculate statistics from map state
 */
export const calculateMapStats = (
  mapState: MapState,
  totalRegions: number
): MapStats => {
  const stats = {
    beenThere: 0,
    stayedThere: 0,
    passedBy: 0,
    notVisited: 0,
    total: totalRegions,
  };

  Object.values(mapState).forEach((status: VisitStatus) => {
    switch (status) {
      case "been-there":
        stats.beenThere++;
        break;
      case "stayed-there":
        stats.stayedThere++;
        break;
      case "passed-by":
        stats.passedBy++;
        break;
    }
  });

  stats.notVisited =
    totalRegions - (stats.beenThere + stats.stayedThere + stats.passedBy);

  return stats;
};

/**
 * Get next visit status in cycle
 */
export const getNextVisitStatus = (currentStatus: VisitStatus): VisitStatus => {
  const statusCycle: VisitStatus[] = [
    "not-visited",
    "passed-by",
    "been-there",
    "stayed-there",
  ];
  const currentIndex = statusCycle.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % statusCycle.length;
  return statusCycle[nextIndex];
};

/**
 * Get user-friendly status label
 */
export const getStatusLabel = (status: VisitStatus): string => {
  switch (status) {
    case "been-there":
      return "Been There";
    case "stayed-there":
      return "Stayed There";
    case "passed-by":
      return "Passed By";
    case "not-visited":
    default:
      return "Not Visited";
  }
};

/**
 * Get status color for UI elements
 */
export const getStatusColor = (status: VisitStatus): string => {
  switch (status) {
    case "been-there":
      return "text-green-600 bg-green-100";
    case "stayed-there":
      return "text-blue-600 bg-blue-100";
    case "passed-by":
      return "text-yellow-600 bg-yellow-100";
    case "not-visited":
    default:
      return "text-gray-600 bg-gray-100";
  }
};
