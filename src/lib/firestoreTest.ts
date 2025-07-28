// Test file to verify Firestore connection
// You can run this in your browser console or create a test page

import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const testFirestoreConnection = async () => {
  try {
    console.log("Testing Firestore connection...");

    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user");
      return;
    }

    console.log("User authenticated:", user.uid);

    // Try to write a test document
    const testDocRef = doc(db, "test", user.uid);
    await setDoc(testDocRef, {
      message: "Hello Firestore!",
      timestamp: new Date(),
      userId: user.uid,
    });

    console.log("Test document written successfully");

    // Try to read it back
    const docSnap = await getDoc(testDocRef);
    if (docSnap.exists()) {
      console.log("Test document read successfully:", docSnap.data());
    } else {
      console.error("Test document not found");
    }

    // Clean up test document
    await setDoc(testDocRef, null);
    console.log("Test completed successfully");
  } catch (error) {
    console.error("Firestore test failed:", error);
  }
};
