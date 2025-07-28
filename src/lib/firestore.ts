import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { MapState } from "@/types/map";

/**
 * Get the user's document reference in Firestore
 */
const getUserDocRef = (user: User) => {
  return doc(db, "userProgress", user.uid);
};

/**
 * Load user's map state from Firestore
 */
export const loadMapStateFromFirestore = async (
  user: User
): Promise<MapState> => {
  try {
    const docRef = getUserDocRef(user);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.mapState || {};
    } else {
      // Document doesn't exist, return empty state
      return {};
    }
  } catch (error) {
    console.error("Error loading map state from Firestore:", error);
    return {};
  }
};

/**
 * Save user's map state to Firestore
 */
export const saveMapStateToFirestore = async (
  user: User,
  mapState: MapState
): Promise<void> => {
  try {
    const docRef = getUserDocRef(user);
    await setDoc(
      docRef,
      {
        mapState,
        lastUpdated: new Date(),
        userId: user.uid,
        userEmail: user.email,
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving map state to Firestore:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of user's map state
 * Returns an unsubscribe function
 */
export const subscribeToMapState = (
  user: User,
  callback: (mapState: MapState) => void
): (() => void) => {
  const docRef = getUserDocRef(user);

  return onSnapshot(
    docRef,
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback(data.mapState || {});
      } else {
        callback({});
      }
    },
    (error) => {
      console.error("Error in map state subscription:", error);
    }
  );
};

/**
 * Migrate localStorage data to Firestore (one-time migration)
 */
export const migrateLocalStorageToFirestore = async (
  user: User
): Promise<void> => {
  if (typeof window === "undefined") return;

  try {
    const STORAGE_KEY = "philippine-map-visits";
    const localData = localStorage.getItem(STORAGE_KEY);

    if (localData) {
      const mapState = JSON.parse(localData);
      await saveMapStateToFirestore(user, mapState);

      // Clear localStorage after successful migration
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error migrating localStorage to Firestore:", error);
  }
};
