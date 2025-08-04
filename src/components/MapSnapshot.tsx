"use client";

import { useState } from "react";
import { MapState, MapStats, VisitStatus } from "@/types/map";

interface MapSnapshotProps {
  mapState: MapState;
  stats: MapStats;
  svgContent: string;
  className?: string;
}

/**
 * Component for generating and downloading map snapshots
 */
export default function MapSnapshot({
  mapState,
  stats,
  svgContent,
  className = "",
}: MapSnapshotProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  // Get fill color based on status (same as InteractiveMap)
  const getFillColor = (status: VisitStatus): string => {
    switch (status) {
      case "been-there":
        return "#10b981"; // green-500
      case "stayed-there":
        return "#3b82f6"; // blue-500
      case "passed-by":
        return "#eab308"; // yellow-500
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
        return "#a16207"; // yellow-700
      case "not-visited":
      default:
        return "#6b7280"; // gray-500
    }
  };

  // Get region status for styling
  const getRegionStatus = (regionId: string): VisitStatus => {
    return (mapState[regionId] as VisitStatus) || "not-visited";
  };

  // Generate snapshot and download directly
  const generateSnapshot = async () => {
    setIsGenerating(true);

    try {
      // Parse the SVG content
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (!svgElement) {
        throw new Error("SVG content not found");
      }

      // Get all path elements (regions)
      const paths = Array.from(svgElement.querySelectorAll('path[id^="PH-"]'));

      // Create a new SVG for the snapshot
      const snapshotSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      snapshotSvg.setAttribute("width", "1200");
      snapshotSvg.setAttribute("height", "1600");
      snapshotSvg.setAttribute("viewBox", "-120 -120 950 1500");
      snapshotSvg.style.background =
        "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)";

      // Add styles for better rendering
      const defs = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs"
      );
      const style = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "style"
      );
      style.textContent = `
        .region-path {
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15));
          transition: none;
          fill-opacity: 1 !important;
          stroke-opacity: 1 !important;
        }
        .snapshot-text {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 600;
        }
        .snapshot-title {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 700;
        }
        .snapshot-subtitle {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 500;
        }
      `;
      defs.appendChild(style);
      snapshotSvg.appendChild(defs);

      // Add all paths with current colors
      paths.forEach((path) => {
        const regionId = path.getAttribute("id") || "";
        const pathData = path.getAttribute("d") || "";
        const status = getRegionStatus(regionId);

        const newPath = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        newPath.setAttribute("d", pathData);
        newPath.setAttribute("fill", getFillColor(status));
        newPath.setAttribute("stroke", getStrokeColor(status));
        newPath.setAttribute("stroke-width", "1.5");
        newPath.setAttribute("fill-opacity", "1");
        newPath.setAttribute("stroke-opacity", "1");
        newPath.setAttribute("class", "region-path");

        snapshotSvg.appendChild(newPath);
      });

      // Progress percentage
      const visitedTotal = stats.beenThere + stats.stayedThere + stats.passedBy;
      const visitedPercentage =
        stats.total > 0 ? Math.round((visitedTotal / stats.total) * 100) : 0;

      // Add decorative corner elements
      const decorativeGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );

      // Add decorative accent near progress stats
      const progressAccent = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      progressAccent.setAttribute("cx", "270");
      progressAccent.setAttribute("cy", "40");
      progressAccent.setAttribute("r", "3");
      progressAccent.setAttribute("fill", "rgba(5, 150, 105, 0.4)");
      decorativeGroup.appendChild(progressAccent);

      const progressAccent2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      progressAccent2.setAttribute("cx", "280");
      progressAccent2.setAttribute("cy", "50");
      progressAccent2.setAttribute("r", "2");
      progressAccent2.setAttribute("fill", "rgba(5, 150, 105, 0.2)");
      decorativeGroup.appendChild(progressAccent2);

      snapshotSvg.appendChild(decorativeGroup);

      // Progress Stats Box at 10 o'clock position
      const progressStatsGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      progressStatsGroup.setAttribute("transform", "translate(-30, 50)");

      // Progress stats background
      const progressBg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      progressBg.setAttribute("x", "0");
      progressBg.setAttribute("y", "0");
      progressBg.setAttribute("width", "280");
      progressBg.setAttribute("height", "160");
      progressBg.setAttribute("fill", "rgba(255, 255, 255, 0.95)");
      progressBg.setAttribute("stroke", "rgba(5, 150, 105, 0.3)");
      progressBg.setAttribute("stroke-width", "2");
      progressBg.setAttribute("rx", "12");
      progressBg.setAttribute(
        "filter",
        "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))"
      );
      progressStatsGroup.appendChild(progressBg);

      // Progress title
      const progressTitle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      progressTitle.setAttribute("x", "20");
      progressTitle.setAttribute("y", "25");
      progressTitle.setAttribute("class", "snapshot-title");
      progressTitle.setAttribute("font-size", "18");
      progressTitle.setAttribute("fill", "#1f2937");
      progressTitle.textContent = "Travel Progress";
      progressStatsGroup.appendChild(progressTitle);

      // Large percentage display
      const bigPercentage = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      bigPercentage.setAttribute("x", "20");
      bigPercentage.setAttribute("y", "60");
      bigPercentage.setAttribute("class", "snapshot-title");
      bigPercentage.setAttribute("font-size", "36");
      bigPercentage.setAttribute("fill", "#059669");
      bigPercentage.textContent = `${visitedPercentage}%`;
      progressStatsGroup.appendChild(bigPercentage);

      // "Complete" label
      const completeLabel = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      completeLabel.setAttribute("x", "140");
      completeLabel.setAttribute("y", "60");
      completeLabel.setAttribute("class", "snapshot-text");
      completeLabel.setAttribute("font-size", "20");
      completeLabel.setAttribute("fill", "#374151");
      completeLabel.textContent = "Complete";
      progressStatsGroup.appendChild(completeLabel);

      // Progress details
      const progressDetails = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      progressDetails.setAttribute("x", "20");
      progressDetails.setAttribute("y", "85");
      progressDetails.setAttribute("class", "snapshot-text");
      progressDetails.setAttribute("font-size", "14");
      progressDetails.setAttribute("fill", "#6b7280");
      progressDetails.textContent = `${visitedTotal} of ${stats.total} regions visited`;
      progressStatsGroup.appendChild(progressDetails);

      // Individual stats grid
      const statsData = [
        { label: "Stayed There", value: stats.stayedThere, color: "#3b82f6" },
        { label: "Been There", value: stats.beenThere, color: "#10b981" },
        { label: "Passed By", value: stats.passedBy, color: "#eab308" },
        { label: "Not Visited", value: stats.notVisited, color: "#d1d5db" },
      ];

      statsData.forEach((stat, index) => {
        const x = 20 + (index % 2) * 120;
        const y = 110 + Math.floor(index / 2) * 25;

        // Colored circle indicator
        const indicator = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        indicator.setAttribute("cx", String(x));
        indicator.setAttribute("cy", String(y - 3));
        indicator.setAttribute("r", "4");
        indicator.setAttribute("fill", stat.color);
        progressStatsGroup.appendChild(indicator);

        // Stat text
        const statText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        statText.setAttribute("x", String(x + 12));
        statText.setAttribute("y", String(y));
        statText.setAttribute("class", "snapshot-text");
        statText.setAttribute("font-size", "12");
        statText.setAttribute("fill", "#374151");
        statText.textContent = `${stat.label}: ${stat.value}`;
        progressStatsGroup.appendChild(statText);
      });

      snapshotSvg.appendChild(progressStatsGroup);

      // Add legend at bottom
      const legendGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      legendGroup.setAttribute("transform", "translate(50, 1250)");

      // Legend title
      const legendTitle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      legendTitle.setAttribute("x", "0");
      legendTitle.setAttribute("y", "-10");
      legendTitle.setAttribute("class", "snapshot-title");
      legendTitle.setAttribute("font-size", "16");
      legendTitle.setAttribute("fill", "#1f2937");
      legendTitle.textContent = "Legend";
      legendGroup.appendChild(legendTitle);

      // Legend background
      const legendBg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      legendBg.setAttribute("x", "-10");
      legendBg.setAttribute("y", "-5");
      legendBg.setAttribute("width", "775");
      legendBg.setAttribute("height", "80");
      legendBg.setAttribute("fill", "rgba(255, 255, 255, 0.95)");
      legendBg.setAttribute("stroke", "rgba(59, 130, 246, 0.3)");
      legendBg.setAttribute("stroke-width", "1");
      legendBg.setAttribute("rx", "8");
      legendBg.setAttribute(
        "filter",
        "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
      );
      legendGroup.appendChild(legendBg);

      // Legend items
      const legendItems = [
        { status: "stayed-there", label: "Stayed There", color: "#3b82f6" },
        { status: "been-there", label: "Been There", color: "#10b981" },
        { status: "passed-by", label: "Passed By", color: "#eab308" },
        { status: "not-visited", label: "Not Visited", color: "#d1d5db" },
      ];

      legendItems.forEach((item, index) => {
        const x = 20 + index * 170;
        const y = 25;

        // Legend circle (larger)
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", String(x));
        circle.setAttribute("cy", String(y));
        circle.setAttribute("r", "8");
        circle.setAttribute("fill", item.color);
        circle.setAttribute(
          "stroke",
          getStrokeColor(item.status as VisitStatus)
        );
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute(
          "filter",
          "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))"
        );
        legendGroup.appendChild(circle);

        // Legend text (larger)
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", String(x + 20));
        text.setAttribute("y", String(y + 5));
        text.setAttribute("class", "snapshot-text");
        text.setAttribute("font-size", "14");
        text.setAttribute("fill", "#374151");
        text.textContent = item.label;
        legendGroup.appendChild(text);
      });

      snapshotSvg.appendChild(legendGroup);

      // Add footer watermark
      const footerGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      footerGroup.setAttribute("transform", "translate(50, 1300)");

      const footerText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      footerText.setAttribute("x", "0");
      footerText.setAttribute("y", "0");
      footerText.setAttribute("class", "snapshot-text");
      footerText.setAttribute("font-size", "12");
      footerText.setAttribute("fill", "#9ca3af");
      footerText.textContent = "🇵🇭 Generated by Philippines Travel Tracker";
      footerGroup.appendChild(footerText);

      const websiteText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      websiteText.setAttribute("x", "500");
      websiteText.setAttribute("y", "0");
      websiteText.setAttribute("class", "snapshot-text");
      websiteText.setAttribute("font-size", "12");
      websiteText.setAttribute("fill", "#9ca3af");
      websiteText.textContent = "Track your adventures at been-there.app";
      footerGroup.appendChild(websiteText);

      snapshotSvg.appendChild(footerGroup);

      // Convert SVG to image and download
      const svgString = new XMLSerializer().serializeToString(snapshotSvg);
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create canvas to convert to PNG
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1200;
      canvas.height = 1600;

      const img = new Image();
      img.onload = () => {
        if (ctx) {
          // Set white background with full opacity
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Ensure sharp rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          ctx.drawImage(img, 0, 0);

          // Convert to blob and download directly
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const imageUrl = URL.createObjectURL(blob);

                // Create download link
                const link = document.createElement("a");
                link.href = imageUrl;
                link.download = `philippines-travel-map-${
                  new Date().toISOString().split("T")[0]
                }.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up blob URL
                URL.revokeObjectURL(imageUrl);
                setLastGenerated(new Date());
              }
            },
            "image/png",
            0.95
          );
        }
        URL.revokeObjectURL(svgUrl);
        setIsGenerating(false);
      };

      img.onerror = () => {
        console.error("Failed to load SVG image");
        alert("Failed to generate snapshot. Please try again.");
        URL.revokeObjectURL(svgUrl);
        setIsGenerating(false);
      };

      img.src = svgUrl;
    } catch (error) {
      console.error("Error generating snapshot:", error);
      alert(
        "An error occurred while generating the snapshot. Please try again."
      );
      setIsGenerating(false);
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
          onClick={generateSnapshot}
          disabled={isGenerating}
          className={`w-full px-3 py-2 lg:px-4 lg:py-3 text-xs lg:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-lg ${className}`}
        >
          {isGenerating ? (
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
              Generating Snapshot...
            </>
          ) : (
            <>📸 Capture Map Snapshot</>
          )}
        </button>

        {showSuccessMessage && (
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
              Snapshot downloaded successfully! 🎉
            </p>
          </div>
        )}
      </div>
    </>
  );
}
