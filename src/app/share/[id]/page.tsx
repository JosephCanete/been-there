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
  createdAt?: unknown;
}

export default function ShareSnapshotPage() {
  const params = useParams();
  const router = useRouter();
  // Safely resolve and decode the dynamic route id (handles encoded and array forms)
  const rawIdParam = params?.id as string | string[] | undefined;
  const idParam = Array.isArray(rawIdParam) ? rawIdParam[0] : rawIdParam;
  const id = idParam
    ? (() => {
        try {
          return decodeURIComponent(idParam);
        } catch {
          return idParam;
        }
      })()
    : undefined;

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
          {/* Header skeleton */}
          <div className="mb-6">
            <div className="h-7 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map card skeleton */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="relative aspect-[3/4] w-full h-full">
                <div className="absolute inset-0">
                  <div
                    className="w-full h-full rounded-lg shadow-inner overflow-hidden animate-pulse"
                    style={{
                      background:
                        "radial-gradient(1200px 800px at 20% 15%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #cfeeff 0%, #aadaff 45%, #8ccfff 100%)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right Pane skeletons */}
            <div className="lg:col-span-1 space-y-4">
              {/* CTA card skeleton */}
              <div className="rounded-xl p-4 lg:p-5 shadow bg-white">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse mb-3" />
                <div className="flex gap-2">
                  <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                  <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Share link card skeleton */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-2">
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                <div className="h-9 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
              </div>

              {/* Progress card skeleton */}
              <div className="bg-white rounded-xl shadow border border-gray-200 p-4 lg:p-6 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gray-100 animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 w-48 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-200 animate-pulse" />
                          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-8 bg-gray-100 rounded animate-pulse" />
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
              </div>

              {/* Achievements card skeleton */}
              <div className="rounded-xl p-4 lg:p-5 shadow bg-white border border-gray-200 space-y-3">
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
                        <div>
                          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-1" />
                          <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-4 w-10 bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
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

  // Category percentages
  const totalProvinces = snapshot.stats.total;
  const pct = (v: number) =>
    totalProvinces > 0 ? Math.round((v / totalProvinces) * 100) : 0;
  const pctBeen = pct(snapshot.stats.beenThere);
  const pctStayed = pct(snapshot.stats.stayedThere);
  const pctPassed = pct(snapshot.stats.passedBy);
  const pctNot = pct(snapshot.stats.notVisited);

  // Achievements thresholds
  const achievedFirst = visitedTotal >= 1;
  const progressFirst = Math.min(visitedTotal, 1);

  const achieved5 = visitedTotal >= 5;
  const progress5 = Math.min(visitedTotal, 5);

  const achieved10 = visitedTotal >= 10;
  const progress10 = Math.min(visitedTotal, 10);

  const achieved50 = visitedPercentage >= 50;
  const progress50 = visitedPercentage; // percent

  const achievedMaster = totalProvinces > 0 && visitedTotal >= totalProvinces;
  const progressMaster = visitedPercentage; // percent

  // Safely derive a display date from Firestore Timestamp or string
  const formatCreatedAt = (value: unknown): string | null => {
    if (!value || typeof value !== "object") {
      const d = new Date(value as string);
      return isNaN(d.getTime()) ? null : d.toLocaleString();
    }
    // Firestore Timestamp-like
    const maybeTs = value as { seconds?: number };
    if (typeof maybeTs.seconds === "number") {
      const d = new Date(maybeTs.seconds * 1000);
      return d.toLocaleString();
    }
    return null;
  };
  const createdAtDisplay = formatCreatedAt(snapshot.createdAt);
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
            <div className="relative aspect-[3/4] w-full h-full">
              <div className="absolute inset-0 ">
                <div
                  className="w-full h-full rounded-lg shadow-inner overflow-hidden"
                  style={{
                    background:
                      "radial-gradient(1200px 800px at 20% 15%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 25%, rgba(255,255,255,0) 60%), linear-gradient(135deg, #cfeeff 0%, #aadaff 45%, #8ccfff 100%)",
                  }}
                >
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
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 lg:p-6 space-y-5">
              <div className="flex items-center gap-4">
                {/* Donut chart */}
                <div className="relative w-20 h-20 lg:w-24 lg:h-24 shrink-0">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(#3b82f6 ${
                        visitedPercentage * 3.6
                      }deg, #e5e7eb 0deg)`,
                    }}
                  />
                  <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                    <span className="text-sm lg:text-base font-bold text-gray-800">
                      {visitedPercentage}%
                    </span>
                  </div>
                </div>

                {/* Title + linear progress */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Progress
                  </h2>
                  <p className="text-sm text-gray-600 truncate">
                    Visited {visitedTotal} of {snapshot.stats.total} provinces
                  </p>
                  <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${visitedPercentage}%`,
                        background: "linear-gradient(90deg, #60a5fa, #6366f1)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Category breakdown */}
              <div className="space-y-3">
                {/* Been There */}
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#10b981" }}
                        aria-hidden
                      />
                      <span className="text-gray-700">Been There</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {snapshot.stats.beenThere}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${pctBeen}%`,
                        backgroundColor: "#10b981",
                      }}
                    />
                  </div>
                </div>

                {/* Visited (Stayed There) */}
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#3b82f6" }}
                        aria-hidden
                      />
                      <span className="text-gray-700">Visited</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {snapshot.stats.stayedThere}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${pctStayed}%`,
                        backgroundColor: "#3b82f6",
                      }}
                    />
                  </div>
                </div>

                {/* Lived (Passed By) */}
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#dc2626" }}
                        aria-hidden
                      />
                      <span className="text-gray-700">Lived</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {snapshot.stats.passedBy}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${pctPassed}%`,
                        backgroundColor: "#dc2626",
                      }}
                    />
                  </div>
                </div>

                {/* Not Visited */}
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#d1d5db" }}
                        aria-hidden
                      />
                      <span className="text-gray-700">Not Visited</span>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {snapshot.stats.notVisited}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${pctNot}%`,
                        backgroundColor: "#9ca3af",
                      }}
                    />
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

            {/* Achievements card */}
            <div className="rounded-xl p-4 lg:p-5 shadow bg-white border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Achievements
              </h3>
              <div className="space-y-3">
                {/* First Explorer */}
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: achievedFirst ? "#10b981" : "#e5e7eb",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        🗺️
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          First Explorer
                        </div>
                        <div className="text-xs text-gray-600">
                          Visit your first province
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        achievedFirst ? "text-emerald-600" : "text-gray-500"
                      }`}
                    >
                      {progressFirst}/1
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(progressFirst / 1) * 100}%`,
                        backgroundColor: achievedFirst ? "#10b981" : "#9ca3af",
                      }}
                    />
                  </div>
                </div>

                {/* Provincial Explorer */}
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: achieved5 ? "#3b82f6" : "#e5e7eb",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        🏝️
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          Provincial Explorer
                        </div>
                        <div className="text-xs text-gray-600">
                          Explore 5 provinces
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        achieved5 ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {progress5}/5
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(progress5 / 5) * 100}%`,
                        backgroundColor: achieved5 ? "#3b82f6" : "#9ca3af",
                      }}
                    />
                  </div>
                </div>

                {/* Island Hopper */}
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: achieved10 ? "#8b5cf6" : "#e5e7eb",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        🏆
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          Island Hopper
                        </div>
                        <div className="text-xs text-gray-600">
                          Explore 10 provinces
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        achieved10 ? "text-violet-600" : "text-gray-500"
                      }`}
                    >
                      {progress10}/10
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${(progress10 / 10) * 100}%`,
                        backgroundColor: achieved10 ? "#8b5cf6" : "#9ca3af",
                      }}
                    />
                  </div>
                </div>

                {/* Halfway Hero */}
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: achieved50 ? "#f59e0b" : "#e5e7eb",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        🛫
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          Halfway Hero
                        </div>
                        <div className="text-xs text-gray-600">
                          Reach 50% completion
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        achieved50 ? "text-amber-600" : "text-gray-500"
                      }`}
                    >
                      {progress50}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.min(progress50, 100)}%`,
                        backgroundColor: achieved50 ? "#f59e0b" : "#9ca3af",
                      }}
                    />
                  </div>
                </div>

                {/* Philippines Master */}
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    borderColor: achievedMaster ? "#10b981" : "#e5e7eb",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" aria-hidden>
                        🇵🇭
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">
                          Philippines Master
                        </div>
                        <div className="text-xs text-gray-600">
                          Complete all provinces
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        achievedMaster ? "text-emerald-600" : "text-gray-500"
                      }`}
                    >
                      {progressMaster}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${Math.min(progressMaster, 100)}%`,
                        backgroundColor: achievedMaster ? "#10b981" : "#9ca3af",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
