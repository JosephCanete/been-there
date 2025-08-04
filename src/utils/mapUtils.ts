import { MapState, MapStats, VisitStatus } from "@/types/map";
import { User } from "firebase/auth";
import {
  loadMapStateFromFirestore,
  saveMapStateToFirestore,
  migrateLocalStorageToFirestore,
} from "@/lib/firestore";

const STORAGE_KEY = "philippine-map-visits";

/**
 * Load visit status from localStorage (fallback for unauthenticated users)
 */
export const loadMapStateFromLocalStorage = (): MapState => {
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
 * Save visit status to localStorage (fallback for unauthenticated users)
 */
export const saveMapStateToLocalStorage = (mapState: MapState): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mapState));
  } catch (error) {
    console.error("Error saving map state to localStorage:", error);
  }
};

/**
 * Load map state - uses Firestore if user is authenticated, localStorage otherwise
 */
export const loadMapState = async (user?: User | null): Promise<MapState> => {
  if (user) {
    try {
      const firestoreState = await loadMapStateFromFirestore(user);
      return firestoreState;
    } catch (error) {
      console.error(
        "Failed to load from Firestore, falling back to localStorage:",
        error
      );
      return loadMapStateFromLocalStorage();
    }
  } else {
    return loadMapStateFromLocalStorage();
  }
};

/**
 * Save map state - uses Firestore if user is authenticated, localStorage otherwise
 */
export const saveMapState = async (
  mapState: MapState,
  user?: User | null
): Promise<void> => {
  console.log("saveMapState called with:", { user: user?.uid, mapState });

  if (user) {
    try {
      console.log("User is authenticated, saving to Firestore");
      await saveMapStateToFirestore(user, mapState);
      console.log("Firestore save completed");
    } catch (error) {
      console.error(
        "Failed to save to Firestore, falling back to localStorage:",
        error
      );
      saveMapStateToLocalStorage(mapState);
    }
  } else {
    console.log("No user, saving to localStorage");
    saveMapStateToLocalStorage(mapState);
  }
};

/**
 * Handle user authentication change - migrate data if needed
 */
export const handleAuthStateChange = async (
  user: User | null
): Promise<MapState> => {
  if (user) {
    // User signed in - migrate localStorage data if it exists
    await migrateLocalStorageToFirestore(user);
    // Load user's data from Firestore
    return await loadMapStateFromFirestore(user);
  } else {
    // User signed out - load from localStorage
    return loadMapStateFromLocalStorage();
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
    "been-there",
    "stayed-there",
    "passed-by",
    "not-visited",
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
      return "Visited";
    case "passed-by":
      return "Lived";
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
      return "text-red-600 bg-red-100";
    case "not-visited":
    default:
      return "text-gray-600 bg-gray-100";
  }
};
