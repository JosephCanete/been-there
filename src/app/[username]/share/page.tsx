"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { MapState, MapStats, VisitStatus } from "@/types/map";
import {
  getFillColor,
  getStrokeColor,
  getVisitedPercentage,
  getVisitedTotal,
  percentOf,
} from "@/utils/mapUtils";
import CopyButton from "@/components/CopyButton";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

interface SnapshotDoc {
  mapState: MapState;
  stats: MapStats;
  userDisplayName?: string | null;
  createdAt?: unknown;
}

export default function ShareByUsernamePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const username = (params?.username as string) || "";
  const [uid, setUid] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotDoc | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgHostRef = useRef<HTMLDivElement | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!username) return;
      try {
        // usernames/<username> -> { uid }
        const unameRef = doc(db, "usernames", username);
        const unameSnap = await getDoc(unameRef);
        if (!unameSnap.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }
        const uidVal = (unameSnap.data() as any)?.uid as string;
        setUid(uidVal);
        // load snapshot at snapshots/<uid>
        const snapRef = doc(db, "snapshots", uidVal);
        const snap = await getDoc(snapRef);
        if (!snap.exists()) {
          setError("Snapshot not found");
          setLoading(false);
          return;
        }
        setSnapshot(snap.data() as SnapshotDoc);
        const resp = await fetch("/philippines.svg");
        setSvgContent(await resp.text());
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Failed to load");
        setLoading(false);
      }
    };
    run();
  }, [username]);

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

  // Helpers (share links and image generation)
  const getCurrentUrl = () =>
    (typeof window !== "undefined" && window.location.href) || "";
  const getShareText = () =>
    `${username}'s Philippines travel progress — check it out!`;

  const openCentered = (url: string) => {
    const w = 900;
    const h = 700;
    const y = window.top ? (window.top.outerHeight - h) / 2 : 50;
    const x = window.top ? (window.top.outerWidth - w) / 2 : 50;
    window.open(
      url,
      "_blank",
      `toolbar=0,location=0,menubar=0,width=${w},height=${h},top=${y},left=${x}`
    );
  };

  const generatePngBlob = async (): Promise<Blob | null> => {
    try {
      const host = svgHostRef.current;
      if (!host) return null;
      const svg = host.querySelector("svg");
      if (!svg) return null;
      const viewBox = svg.getAttribute("viewBox") || "0 0 770 1250";
      const [, , vw, vh] = viewBox.split(" ").map(Number);
      const targetWidth = 1080;
      const scale = targetWidth / (vw || 770);
      const width = Math.round((vw || 770) * scale);
      const height = Math.round((vh || 1250) * scale);

      const serialized = new XMLSerializer().serializeToString(svg);
      const svg64 =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);

      const img = new Image();
      img.crossOrigin = "anonymous";
      const blob: Blob = await new Promise((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("No 2D context"));
          ctx.fillStyle = "#e6f2ff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("toBlob"))),
            "image/png",
            0.95
          );
        };
        img.onerror = reject;
        img.src = svg64;
      });
      return blob;
    } catch (e) {
      console.error("Failed to generate PNG:", e);
      return null;
    }
  };

  const shareAsStory = async (platform: "facebook" | "instagram") => {
    try {
      setIsGeneratingImage(true);
      const blob = await generatePngBlob();
      if (!blob) {
        setShareMessage("Could not generate image. Try downloading instead.");
        setTimeout(() => setShareMessage(null), 3000);
        return;
      }
      const file = new File([blob], "btp-snapshot.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Been There Philippines",
          text: getShareText(),
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "btp-snapshot.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
        setShareMessage(
          `Image downloaded. Open ${
            platform === "instagram" ? "Instagram" : "Facebook"
          } and upload to your Story.`
        );
        setTimeout(() => setShareMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const downloadImage = async () => {
    setIsGeneratingImage(true);
    const blob = await generatePngBlob();
    if (blob) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "btp-snapshot.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
    }
    setIsGeneratingImage(false);
  };

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
            {error || "Not available"}
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

  const visitedTotal = getVisitedTotal(snapshot.stats);
  const visitedPercentage = getVisitedPercentage(snapshot.stats);
  const totalProvinces = snapshot.stats.total;
  const pct = (v: number) => percentOf(v, totalProvinces);
  const pctBeen = pct(snapshot.stats.beenThere);
  const pctStayed = pct(snapshot.stats.stayedThere);
  const pctPassed = pct(snapshot.stats.passedBy);
  const pctNot = pct(snapshot.stats.notVisited);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <div className="mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-lg text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 rounded"
          >
            <span>Home</span>
          </Link>
        </div>
        <div className="mb-6">
          <h1 className="text-2xl capitalize lg:text-3xl font-bold text-gray-800">
            {username}'s Philippine Map Snapshot
          </h1>
          <p className="text-gray-600">Shared progress permalink</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            <div className="relative aspect-[3/4] w-full h-full">
              <div className="absolute inset-0 ">
                <div
                  ref={svgHostRef}
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
          <div className="lg:col-span-1 lg:sticky lg:top-6 self-start space-y-4">
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
                <CopyButton
                  text={currentUrl}
                  className="px-3 py-2 text-xs rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
                  initialLabel="Copy"
                  copiedLabel="Copied"
                />
              </div>
            </div>

            {/* Social share card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-800">
                Share social
              </h3>
              <p className="text-xs text-gray-500">
                Create an image of your map and share it as a Story.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => shareAsStory("instagram")}
                  disabled={isGeneratingImage}
                  className="w-full px-4 py-2.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-sm hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-70"
                >
                  Share social
                </button>
                <button
                  onClick={downloadImage}
                  disabled={isGeneratingImage}
                  className="w-full px-4 py-2.5 rounded-md border text-xs text-black font-medium hover:bg-gray-50 disabled:opacity-70"
                >
                  {isGeneratingImage ? "Preparing image…" : "Download image"}
                </button>
                {shareMessage && (
                  <div className="text-xs text-gray-600">{shareMessage}</div>
                )}
                <div className="text-[11px] text-gray-400">
                  Tip: Works best on mobile.
                </div>
              </div>
            </div>

            {/* Try it yourself CTA */}
            {!user && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white shadow">
                <h3 className="text-sm font-semibold">Make your own map</h3>
                <p className="text-xs text-white/90 mt-1">
                  Mark where you’ve been and share your progress with friends.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="mt-3 w-full px-3 py-2 rounded bg-white text-blue-700 text-xs font-semibold hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/70"
                >
                  Try it yourself
                </button>
              </div>
            )}
            {/* Progress card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 p-4 lg:p-6 space-y-5">
              <div className="flex items-center gap-4">
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
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#10b981" }}
                        aria-hidden
                      />{" "}
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
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#3b82f6" }}
                        aria-hidden
                      />{" "}
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
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#dc2626" }}
                        aria-hidden
                      />{" "}
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
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: "#d1d5db" }}
                        aria-hidden
                      />{" "}
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
          </div>
        </div>
      </div>
    </div>
  );
}
