"use client";

import { useState } from "react";
import { MapState, MapStats, VisitStatus } from "@/types/map";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthProvider";

interface MapSnapshotProps {
  mapState: MapState;
  stats: MapStats;
  svgContent: string;
  user?: User | null;
  className?: string;
}

/**
 * Component for generating and downloading map snapshots
 */
export default function MapSnapshot({
  mapState,
  stats,
  svgContent,
  user: userProp,
  className = "",
}: MapSnapshotProps) {
  const { user: userCtx } = useAuth();
  const user = userProp ?? userCtx;
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  // Create a deterministic hash for the snapshot content
  const computeStateHash = (): string => {
    // Stable stringify
    const stableStringify = (obj: any): string => {
      if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
      const keys = Object.keys(obj).sort();
      const entries = keys.map(
        (k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`
      );
      return `{${entries.join(",")}}`;
    };
    const payload = `${stableStringify(mapState)}|${stableStringify(stats)}`;
    // djb2 hash
    let hash = 5381;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash * 33) ^ payload.charCodeAt(i);
    }
    // Convert to unsigned and hex
    return (hash >>> 0).toString(16);
  };

  // Get user's first name or fallback
  const getUserName = (): string => {
    if (user?.displayName) {
      return user.displayName.split(" ")[0];
    }
    return "Explorer";
  };

  // Generate a shareable permalink by storing snapshot data in Firestore
  const createPermalink = async () => {
    setIsSharing(true);
    setShareError(null);
    try {
      if (!user) {
        setShareError("Please sign in to create a shareable link.");
        return;
      }
      // Reuse existing by deterministic doc id per user+state
      const stateHash = computeStateHash();
      const docId = `${user.uid}-${stateHash}`;
      const ref = doc(db, "snapshots", docId);
      const existing = await getDoc(ref);
      if (!existing.exists()) {
        await setDoc(ref, {
          mapState,
          stats,
          stateHash,
          userDisplayName: user?.displayName ?? null,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      const url = `${window.location.origin}/share/${docId}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
      } catch {}
      setLastGenerated(new Date());
    } catch (e) {
      console.error("Error creating permalink:", e);
      setShareError("Failed to create shareable link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  // Get fill color based on status (same as InteractiveMap)
  const getFillColor = (status: VisitStatus): string => {
    switch (status) {
      case "been-there":
        return "#10b981"; // green-500
      case "stayed-there":
        return "#3b82f6"; // blue-500
      case "passed-by":
        return "#dc2626"; // yellow-500
      case "not-visited":
      default:
        return "#d1d5db"; // gray-300
    }
  };

  // Get stroke color based on status (same as InteractiveMap)
  const getStrokeColor = (status: VisitStatus): string => {
    switch (status) {
      case "been-there":
        return "#047857"; // green-700
      case "stayed-there":
        return "#1d4ed8"; // blue-700
      case "passed-by":
        return "#b91c1c"; // red-700
      case "not-visited":
      default:
        return "#6b7280"; // gray-500
    }
  };

  // Get region status for styling
  const getRegionStatus = (regionId: string): VisitStatus => {
    return (mapState[regionId] as VisitStatus) || "not-visited";
  };

  // Show success message briefly after generation
  const showSuccessMessage =
    lastGenerated && Date.now() - lastGenerated.getTime() < 3000;

  if (!svgContent) {
    return null;
  }

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={createPermalink}
          disabled={isSharing || !user}
          title={!user ? "Sign in to create a shareable link" : undefined}
          className={`w-full px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-lg ${className}`}
        >
          {isSharing ? (
            <>
              <svg
                className="w-3 h-3 lg:w-4 lg:h-4 mr-2 animate-spin"
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
              Creating shareable link...
            </>
          ) : (
            <>{user ? "🔗 Create Shareable Link" : "🔒 Sign in to Share"}</>
          )}
        </button>

        {shareError && (
          <div className="text-center p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {shareError}
          </div>
        )}

        {shareUrl && (
          <div className="space-y-2">
            <div className="text-center p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-medium flex items-center justify-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Link ready! {showSuccessMessage ? "(Copied)" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 px-2 py-2 text-xs border rounded text-black bg-white"
                value={shareUrl}
                readOnly
              />
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="px-2 py-2 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
