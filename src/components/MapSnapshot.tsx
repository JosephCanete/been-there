"use client";

import { useEffect, useState } from "react";
import { MapState, MapStats } from "@/types/map";
import { User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthProvider";
import CopyButton from "./CopyButton";

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
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  // Load username for friendly URLs
  useEffect(() => {
    const run = async () => {
      if (!user) {
        setUsername(null);
        return;
      }
      try {
        const profileRef = doc(db, "profiles", user.uid);
        const snap = await getDoc(profileRef);
        const u = (snap.exists() && (snap.data() as any)?.username) || null;
        setUsername(typeof u === "string" && u.length > 0 ? u : null);
      } catch (e) {
        setUsername(null);
      }
    };
    run();
  }, [user]);

  // Create a deterministic hash for the snapshot content
  const computeStateHash = (): string => {
    // Stable stringify
    const stableStringify = (obj: unknown): string => {
      if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
      const record = obj as Record<string, unknown>;
      const keys = Object.keys(record).sort();
      const entries = keys.map(
        (k) => `${JSON.stringify(k)}:${stableStringify(record[k])}`
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

  // Generate a shareable permalink by storing snapshot data in Firestore
  const createPermalink = async () => {
    setIsSharing(true);
    setShareError(null);
    try {
      if (!user) {
        setShareError("Please sign in to create a shareable link.");
        return;
      }
      // 1:1 mapping: one snapshot document per user (doc id = user.uid)
      const stateHash = computeStateHash();
      const docId = user.uid;
      const ref = doc(db, "snapshots", docId);
      const existing = await getDoc(ref);
      if (existing.exists()) {
        await setDoc(
          ref,
          {
            mapState,
            stats,
            stateHash,
            userDisplayName: user?.displayName ?? null,
            userId: user.uid,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else {
        await setDoc(ref, {
          mapState,
          stats,
          stateHash,
          userDisplayName: user?.displayName ?? null,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
      const url = username
        ? `${window.location.origin}/${encodeURIComponent(username)}/share`
        : `${window.location.origin}/share/${encodeURIComponent(docId)}`;
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
          className={`w-full px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-lg ${className}`}
        >
          {isSharing ? (
            <>
              <span className="inline-flex items-center mr-2">
                <span className="block h-3 w-3 rounded bg-white/30 animate-pulse"></span>
              </span>
              Creating shareable link...
            </>
          ) : (
            <>{user ? "🔗 Create Shareable Link" : "🔒 Sign in to Share"}</>
          )}
        </button>

        {shareError && (
          <div className="text-center p-2 bg-red-50 rounded-lg text-xs text-red-700">
            {shareError}
          </div>
        )}

        {shareUrl && (
          <div className="space-y-2">
            <div className="text-center p-2 bg-green-50 rounded-lg">
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
                className="flex-1 px-2 py-2 text-xs rounded text-black bg-white"
                value={shareUrl}
                readOnly
              />
              <CopyButton
                text={shareUrl}
                className="px-2 py-2 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                initialLabel="Copy"
                copiedLabel="Copied"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
