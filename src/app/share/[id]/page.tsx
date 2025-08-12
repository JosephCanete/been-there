"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { MapState, MapStats, VisitStatus } from "@/types/map";

interface SnapshotDoc {
  mapState: MapState;
  stats: MapStats;
  userDisplayName?: string | null;
  createdAt?: string;
}

export default function ShareSnapshotPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotDoc | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");

  // Colors (keep in sync with main map)
  const getFillColor = (status: VisitStatus): string => {
    switch (status) {
      case "been-there":
        return "#10b981";
      case "stayed-there":
        return "#3b82f6";
      case "passed-by":
        return "#dc2626";
      case "not-visited":
      default:
        return "#d1d5db";
    }
  };
  const getStrokeColor = (status: VisitStatus): string => {
    switch (status) {
      case "been-there":
        return "#047857";
      case "stayed-there":
        return "#1d4ed8";
      case "passed-by":
        return "#b91c1c";
      case "not-visited":
      default:
        return "#6b7280";
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        // Load snapshot
        const ref = doc(db, "snapshots", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Snapshot not found");
          setLoading(false);
          return;
        }
        const data = snap.data() as SnapshotDoc;
        setSnapshot(data);

        // Load base Philippines SVG
        const resp = await fetch("/philippines.svg");
        const text = await resp.text();
        setSvgContent(text);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Failed to load snapshot");
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const renderedSVG = useMemo(() => {
    if (!svgContent || !snapshot) return null;

    const parser = new DOMParser();
    const docSvg = parser.parseFromString(svgContent, "image/svg+xml");
    const svgEl = docSvg.querySelector("svg");
    if (!svgEl) return null;

    const paths = Array.from(svgEl.querySelectorAll('path[id^="PH-"]'));

    return (
      <svg
        viewBox="-20 -20 770 1250"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Snapshot of the Philippines map"
      >
        {paths.map((path, i) => {
          const provinceId = path.getAttribute("id") || `p-${i}`;
          const d = path.getAttribute("d") || "";
          const status =
            (snapshot.mapState[provinceId] as VisitStatus) || "not-visited";
          return (
            <path
              key={provinceId}
              d={d}
              fill={getFillColor(status)}
              stroke={getStrokeColor(status)}
              strokeWidth={1}
            />
          );
        })}
      </svg>
    );
  }, [svgContent, snapshot]);

  if (!id) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-700 font-medium">Loading snapshot…</p>
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">
            {error || "Snapshot not available"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const visitedTotal =
    snapshot.stats.beenThere +
    snapshot.stats.stayedThere +
    snapshot.stats.passedBy;
  const visitedPercentage =
    snapshot.stats.total > 0
      ? Math.round((visitedTotal / snapshot.stats.total) * 100)
      : 0;

  // Safely derive a display date from Firestore Timestamp or string
  const formatCreatedAt = (value: any): string | null => {
    if (!value) return null;
    // Firestore Timestamp
    if (typeof value === "object" && value?.seconds) {
      const d = new Date(value.seconds * 1000);
      return d.toLocaleString();
    }
    // ISO string
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toLocaleString();
  };
  const createdAtDisplay = formatCreatedAt((snapshot as any).createdAt);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
            {snapshot.userDisplayName
              ? `${snapshot.userDisplayName}'s`
              : "Your"}{" "}
            Philippine Map Snapshot
          </h1>
          <p className="text-gray-600">Shared progress permalink</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="relative aspect-[3/4] w-full">
              <div className="absolute inset-0 p-4 lg:p-6">
                <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden">
                  {renderedSVG}
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane: sticky with CTA, share link, and progress */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 self-start space-y-4">
            {/* CTA card */}
            <div className="rounded-xl p-4 lg:p-5 shadow bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
              <div className="inline-flex items-center px-2 py-1 rounded-full bg-white/15 text-[11px] font-medium mb-2">
                ✨ Free to try — No signup required
              </div>
              <h2 className="text-lg font-bold">Create your own travel map</h2>
              <p className="text-white/90 mt-1 text-sm">
                Track places you’ve been, lived, and plan to go.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="flex-1 px-3 py-2 rounded-lg bg-white text-gray-900 font-medium hover:bg-gray-100 shadow"
                >
                  Try it now
                </button>
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="px-3 py-2 rounded-lg bg-black/20 text-white font-medium hover:bg-black/30 border border-white/20"
                >
                  Sign in
                </button>
              </div>
            </div>

            {/* Share link card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">
                Share this snapshot
              </h3>
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 px-2 py-2 text-xs border rounded text-black bg-white"
                  value={currentUrl}
                  readOnly
                />
                <button
                  onClick={() => navigator.clipboard.writeText(currentUrl)}
                  className="px-3 py-2 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Copy
                </button>
              </div>
              {createdAtDisplay && (
                <div className="text-xs text-gray-500">
                  Created: {createdAtDisplay}
                </div>
              )}
            </div>

            {/* Progress card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 lg:p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Progress
                </h2>
                <p className="text-sm text-gray-600">
                  {visitedPercentage}% complete
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded border border-gray-200">
                  <div className="text-gray-500">Visited</div>
                  <div className="text-gray-900 font-semibold">
                    {snapshot.stats.stayedThere}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200">
                  <div className="text-gray-500">Been There</div>
                  <div className="text-gray-900 font-semibold">
                    {snapshot.stats.beenThere}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200">
                  <div className="text-gray-500">Lived</div>
                  <div className="text-gray-900 font-semibold">
                    {snapshot.stats.passedBy}
                  </div>
                </div>
                <div className="p-3 rounded border border-gray-200">
                  <div className="text-gray-500">Not Visited</div>
                  <div className="text-gray-900 font-semibold">
                    {snapshot.stats.notVisited}
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Total provinces:{" "}
                <span className="font-semibold text-gray-800">
                  {snapshot.stats.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
