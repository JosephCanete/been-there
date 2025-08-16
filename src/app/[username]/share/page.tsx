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
import { getLevelInfo } from "@/utils/gamification";
import * as htmlToImage from "html-to-image";
import { canManageShare } from "@/utils/auth";

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
  const [snapshot, setSnapshot] = useState<SnapshotDoc | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgHostRef = useRef<HTMLDivElement | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const fileName = `been-there-${username}.png`;
  // Track the owner uid tied to this perma share
  const [ownerUid, setOwnerUid] = useState<string | null>(null);

  // Ensure scrolling is enabled when arriving from pages that may lock body scroll
  useEffect(() => {
    const html = document.documentElement as HTMLElement;
    const body = document.body as HTMLBodyElement;
    // Reset any leftover locks
    html.style.overflow = "";
    body.style.overflow = "";
    body.style.touchAction = "auto";
    return () => {
      // no-op
    };
  }, []);

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
        setOwnerUid(uidVal);
        // load snapshot at snapshots/<uid>
        const snapRef = doc(db, "snapshots", uidVal);
        const snap = await getDoc(snapRef);
        if (!snap.exists()) {
          setError("Snapshot not found");
          setLoading(false);
          return;
        }
        const snapData = snap.data() as SnapshotDoc;
        setSnapshot(snapData);
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

  const generatePngBlob = async (): Promise<Blob | null> => {
    try {
      const host = svgHostRef.current;
      if (!host) return null;
      const svg = host.querySelector("svg");
      if (!svg) return null;

      const viewBox = svg.getAttribute("viewBox") || "0 0 770 1250";
      const [, , vw, vh] = viewBox.split(" ").map(Number);

      // Increase output resolution and scale up overlay card sizes for larger text
      const targetWidth = 1440; // was 1080
      const scale = targetWidth / (vw || 770);
      const width = Math.round((vw || 770) * scale);
      const height = Math.round((vh || 1250) * scale);

      // Serialize SVG to data URL
      const serialized = new XMLSerializer().serializeToString(svg);
      const svg64 =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);

      // Load as image
      const img = new Image();
      img.crossOrigin = "anonymous";

      // Render DOM cards to images using html-to-image (higher pixelRatio for sharper upscaling)
      const achievementNode = document.getElementById("achievement-card");
      const progressNode = document.getElementById("progress-card");
      const [achDataUrl, progDataUrl] = await Promise.all([
        achievementNode
          ? htmlToImage.toPng(achievementNode, {
              backgroundColor: "#ffffff",
              pixelRatio: 4, // was 3
              skipFonts: false,
              style: { paddingTop: "10px" },
            })
          : Promise.resolve<string | null>(null),
        progressNode
          ? htmlToImage.toPng(progressNode, {
              backgroundColor: "#ffffff",
              pixelRatio: 4, // was 3
              skipFonts: false,
              style: { paddingTop: "8px" },
            })
          : Promise.resolve<string | null>(null),
      ]);

      const blob: Blob = await new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject(new Error("No 2D context"));

            // Scale for placements; no rounded clipping or border
            const baseScale = width / 1080;

            // Background (matches page gradient vibe)
            const grad = ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, "#cfeeff");
            grad.addColorStop(0.45, "#aadaff");
            grad.addColorStop(1, "#8ccfff");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            // Draw the map SVG image full size
            ctx.drawImage(img, 0, 0, width, height);

            // Removed flag drawing to avoid overlaying the map

            // Helpers to place cards left and right (and top footer)
            // baseScale already defined above
            const pad = Math.round(20 * baseScale);
            const topPad = pad;
            const leftPad = pad;
            const rightPad = pad;
            const leftMaxW = Math.min(Math.round(width * 0.36), 520);
            const rightMaxW = Math.min(Math.round(width * 0.36), 520);

            // Cards should be at the very top
            const cardsTop = topPad;

            const loadCardImage = (dataUrl: string | null) =>
              new Promise<HTMLImageElement | null>((res) => {
                if (!dataUrl) return res(null);
                const im = new Image();
                im.onload = () => res(im);
                im.src = dataUrl;
              });

            (async () => {
              const [achImg, progImg] = await Promise.all([
                loadCardImage(achDataUrl),
                loadCardImage(progDataUrl),
              ]);

              // Draw achievement (left) and progress (right) at the top
              let leftDrawnH = 0;
              if (achImg) {
                const scale = Math.min(1.25, leftMaxW / achImg.width);
                const w = Math.round(achImg.width * scale);
                const h = Math.round(achImg.height * scale);
                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.12)";
                ctx.shadowBlur = 12;
                ctx.shadowOffsetY = 5;
                ctx.drawImage(achImg, leftPad, cardsTop, w, h);
                ctx.restore();
                leftDrawnH = h;
              }

              let rightDrawnH = 0;
              if (progImg) {
                const scale = Math.min(1.25, rightMaxW / progImg.width);
                const w = Math.round(progImg.width * scale);
                const h = Math.round(progImg.height * scale);
                const x = width - rightPad - w;
                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.12)";
                ctx.shadowBlur = 12;
                ctx.shadowOffsetY = 5;
                ctx.drawImage(progImg, x, cardsTop, w, h);
                ctx.restore();
                rightDrawnH = h;
              }

              // === Draw footer badges at the bottom-left (stacked upward) ===
              const createdOn = (() => {
                const ca: any = (snapshot as any)?.createdAt;
                let d: Date | null = null;
                if (ca && typeof ca.toDate === "function") d = ca.toDate();
                else if (typeof ca === "number") d = new Date(ca);
                else if (typeof ca === "string") {
                  const dd = new Date(ca);
                  if (!isNaN(dd.getTime())) d = dd;
                }
                return (d || new Date()).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
              })();

              const footerLines = [
                `Created ${createdOn} 🕒`,
                `Try yours  been-there-lovat.vercel.app 🗺️`,
              ];

              const footerFontPx = Math.max(18, Math.round(16 * baseScale));
              ctx.font = `600 ${footerFontPx}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial`;

              const footerPad = 16; // 16px padding from edges
              let y = height - footerPad; // bottom padding
              const spacing = Math.round(8 * baseScale);

              for (const text of [...footerLines].reverse()) {
                const metrics = ctx.measureText(text);
                const ascent = (metrics as any).actualBoundingBoxAscent || 10;
                const descent = (metrics as any).actualBoundingBoxDescent || 4;
                const textH = ascent + descent;
                const padX = Math.round(14 * baseScale);
                const padY = Math.round(10 * baseScale);
                const boxW = Math.ceil(metrics.width) + padX * 2;
                const boxH = Math.ceil(textH) + padY * 2;
                const boxX = footerPad; // left padding
                const boxY = y - boxH; // bottom aligned with padding

                // Rounded pill background
                const r = Math.round(12 * baseScale);
                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.12)";
                ctx.shadowBlur = 9;
                ctx.shadowOffsetY = 4;
                ctx.fillStyle = "rgba(255,255,255,0.95)";
                ctx.beginPath();
                ctx.moveTo(boxX + r, boxY);
                ctx.lineTo(boxX + boxW - r, boxY);
                ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
                ctx.lineTo(boxX + boxW, boxY + boxH - r);
                ctx.quadraticCurveTo(
                  boxX + boxW,
                  boxY + boxH,
                  boxX + boxW - r,
                  boxY + boxH
                );
                ctx.lineTo(boxX + r, boxY + boxH);
                ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
                ctx.lineTo(boxX, boxY + r);
                ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                // Text
                ctx.fillStyle = "#1f2937";
                ctx.fillText(text, boxX + padX, boxY + padY + ascent);

                y = boxY - spacing;
              }

              // No outer rounded border or clipping — keep square edges

              canvas.toBlob(
                (b) => (b ? resolve(b) : reject(new Error("toBlob"))),
                "image/png",
                0.95
              );
            })();
          } catch (err) {
            reject(err);
          }
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
      const file = new File([blob], fileName, {
        type: "image/png",
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Been There Philippines",
          text: getShareText(),
        });
      } else {
        const a = document.createElement("a");
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Revoke after a short delay to ensure download starts
        setTimeout(() => URL.revokeObjectURL(url), 1000);
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
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    setIsGeneratingImage(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

  // Level badge info shared via utils
  const {
    currentLevelNumber,
    currentLevelMeta,
    nextLevelMeta,
    toNext,
    levelProgress,
  } = getLevelInfo(visitedTotal, totalProvinces);

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const ownsShare = canManageShare(user?.uid ?? null, ownerUid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
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
            <Link
              href={`/`}
              className="w-full px-4 py-2.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-sm hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {ownsShare ? "Back to Home" : "Try It Yourself"}
            </Link>

            <div
              id="achievement-card"
              className="bg-white mt-4 rounded-xl shadow p-5"
            >
              <h2 className="text-lg capitalize font-semibold text-gray-800">
                {username}'s Philippine Map
              </h2>

              <div className="flex mt-2 items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-gray-500">
                    Current Badge
                  </div>
                  <div className="text-lg font-extrabold text-gray-900">
                    Level {currentLevelNumber}: {currentLevelMeta.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {visitedTotal}/{totalProvinces} provinces explored
                  </div>
                </div>
                <div className="text-4xl">{currentLevelMeta.emoji}</div>
              </div>
              {nextLevelMeta ? (
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                    <span>
                      Next: Lv {currentLevelNumber + 1} • {nextLevelMeta.title}
                    </span>
                    <span>{levelProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {toNext} more province{toNext === 1 ? "" : "s"} to level up
                  </div>
                </div>
              ) : null}
            </div>

            {/* Share this snapshot */}
            {ownsShare && (
              <>
                <div className="bg-white rounded-xl shadow border border-gray-200 p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Your shareable link
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
                      {isGeneratingImage
                        ? "Preparing image…"
                        : "Download image"}
                    </button>
                    {shareMessage && (
                      <div className="text-xs text-gray-600">
                        {shareMessage}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

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
            <div
              id="progress-card"
              className="bg-white rounded-xl shadow p-4 lg:p-6 space-y-5"
            >
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
                  <p className="text-sm text-gray-600">
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
                      <span className="text-gray-700">Stayed There</span>
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
                      <span className="text-gray-700">Lived There</span>
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
