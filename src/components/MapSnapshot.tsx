"use client";

import { useState } from "react";
import { MapState, MapStats } from "@/types/map";
import { User } from "firebase/auth";
import { useAuth } from "./AuthProvider";
import { useRouter } from "next/navigation";
import { loadUsername, saveSnapshot } from "@/utils/share";

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
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const router = useRouter();

  if (!svgContent) {
    return null;
  }

  // Generate a shareable permalink by storing snapshot data in Firestore
  const handleVisitShareLink = async () => {
    setIsSharing(true);
    setShareError(null);
    try {
      if (!user) {
        setShareError("Please sign in to visit your shareable link.");
        return;
      }
      const username = await loadUsername(user.uid);
      if (!username) {
        router.push("/onboarding");
        return;
      }
      await saveSnapshot(mapState, stats, user);
      router.push(`/${encodeURIComponent(username)}/share`);
    } catch (e) {
      console.error("Error creating permalink:", e);
      setShareError("Failed to create shareable link. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handleVisitShareLink}
          disabled={isSharing || !user}
          title={!user ? "Sign in to visit your shareable link" : undefined}
          className={`w-full px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-lg ${className}`}
        >
          {isSharing ? (
            <>
              <span className="inline-flex items-center mr-2">
                <span className="block h-3 w-3 rounded bg-white/30 animate-pulse"></span>
              </span>
              Preparing your link…
            </>
          ) : (
            <>{user ? "Visit Your Shareable Link" : "🔒 Sign in to Share"}</>
          )}
        </button>

        {shareError && (
          <div className="text-center p-2 bg-red-50 rounded-lg text-xs text-red-700">
            {shareError}
          </div>
        )}
      </div>
    </>
  );
}
