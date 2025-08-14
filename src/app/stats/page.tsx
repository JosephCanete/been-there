"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { MapStats } from "@/types/map";
import {
  loadMapState,
  calculateMapStats,
  PH_PROV_COUNT,
  getVisitedPercentage,
} from "@/utils/mapUtils";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { buildLevels, getLevelInfo, PRE_LEVEL } from "@/utils/gamification";
import { motion } from "framer-motion";

export default function StatsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<MapStats>({
    beenThere: 0,
    stayedThere: 0,
    passedBy: 0,
    notVisited: 0,
    total: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const mapState = await loadMapState(user);
        const calculatedStats = calculateMapStats(mapState, PH_PROV_COUNT);

        setStats(calculatedStats);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading stats:", error);
        setIsLoaded(true);
      }
    };

    loadStats();
  }, [user]);

  const completionPercentage = getVisitedPercentage(stats);
  const exploredRegions = stats.beenThere + stats.stayedThere + stats.passedBy;
  const totalProvinces = stats.total || PH_PROV_COUNT;

  // Gamification info
  const {
    levels,
    currentLevelNumber,
    currentLevelMeta,
    nextLevelMeta,
    nextRequired,
    prevRequired,
    toNext,
    levelProgress,
  } = getLevelInfo(exploredRegions, totalProvinces);

  // Disable animations on small screens or when user prefers reduced motion
  const [disableAnims, setDisableAnims] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqNarrow = window.matchMedia("(max-width: 640px)");
    const update = () => setDisableAnims(mqReduce.matches || mqNarrow.matches);
    update();
    mqReduce.addEventListener("change", update);
    mqNarrow.addEventListener("change", update);
    return () => {
      mqReduce.removeEventListener("change", update);
      mqNarrow.removeEventListener("change", update);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header skeleton */}
          <div className="text-center mb-16">
            <div className="h-9 w-80 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
            <div className="h-5 w-2/3 bg-gray-100 rounded animate-pulse mx-auto" />
          </div>

          {/* Main Stats Cards skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-3" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-3" />
                <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Detailed Breakdown skeleton */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
                    <div>
                      <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-1" />
                      <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Animation helpers
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 sm:py-4">
              {/* Brand link */}
              <Link href="/" className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Been There Philippines
                  </h1>
                </div>
              </Link>

              {/* Navigation links */}
              <div className="flex items-center flex-wrap gap-3 sm:gap-4">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  About
                </Link>
                <Link
                  href="/map"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium"
                >
                  View Map
                </Link>

                {/* User menu */}
                <div className="flex items-center space-x-3">
                  {user?.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                    />
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Stats Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Header */}
          <motion.div
            variants={container}
            initial={disableAnims ? undefined : "hidden"}
            animate={disableAnims ? undefined : "show"}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6"
            >
              Your Travel Statistics
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Detailed insights into your Philippine adventure progress and
              exploration journey.
            </motion.p>
          </motion.div>

          {/* Main Stats Cards */}
          <motion.div
            variants={container}
            initial={disableAnims ? undefined : "hidden"}
            animate={disableAnims ? undefined : "show"}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12"
          >
            {[
              {
                key: "overall",
                content: (
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {completionPercentage}%
                    </div>
                    <div className="text-gray-600 font-medium">
                      Overall Progress
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3 overflow-hidden">
                      <motion.div
                        initial={disableAnims ? undefined : { width: 0 }}
                        animate={
                          disableAnims
                            ? undefined
                            : { width: `${completionPercentage}%` }
                        }
                        transition={
                          disableAnims
                            ? undefined
                            : { duration: 0.9, ease: "easeOut" }
                        }
                        style={
                          disableAnims
                            ? { width: `${completionPercentage}%` }
                            : undefined
                        }
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: "beenThere",
                content: (
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {stats.beenThere}
                    </div>
                    <div className="text-gray-600 font-medium">Been There</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Provinces Visited
                    </div>
                  </div>
                ),
              },
              {
                key: "visited",
                content: (
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stats.stayedThere}
                    </div>
                    <div className="text-gray-600 font-medium">Visited</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Extended Visits
                    </div>
                  </div>
                ),
              },
              {
                key: "lived",
                content: (
                  <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {stats.passedBy}
                    </div>
                    <div className="text-gray-600 font-medium">Lived</div>
                    <div className="text-sm text-gray-500 mt-1">
                      Transit Points
                    </div>
                  </div>
                ),
              },
            ].map((card) => (
              <motion.div
                variants={fadeUp}
                whileHover={{ y: -4 }}
                key={card.key}
              >
                {card.content}
              </motion.div>
            ))}
          </motion.div>

          {/* Level + Breakdown + Achievements */}
          <motion.div
            initial={disableAnims ? undefined : { opacity: 0, y: 12 }}
            animate={disableAnims ? undefined : { opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 sm:p-8 shadow-lg mb-12"
          >
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-6">
              {/* Your Level */}
              <motion.div
                className="flex-1"
                initial={disableAnims ? undefined : { opacity: 0, y: 12 }}
                animate={disableAnims ? undefined : { opacity: 1, y: 0 }}
              >
                <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider opacity-90">
                      Your Level
                    </div>
                    <div className="text-2xl font-extrabold">
                      Level {currentLevelNumber}: {currentLevelMeta.title}
                    </div>
                    <div className="text-xs mt-1 opacity-90">
                      {exploredRegions}/{totalProvinces} provinces explored
                    </div>
                  </div>
                  <motion.div
                    initial={{ rotate: -10, scale: 0.9 }}
                    whileInView={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="text-5xl"
                  >
                    {currentLevelMeta.emoji}
                  </motion.div>
                </div>
                {nextLevelMeta ? (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>
                        Next: Level {currentLevelNumber + 1} •{" "}
                        {nextLevelMeta.title} ({nextRequired} provinces)
                      </span>
                      <span>{levelProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={disableAnims ? undefined : { width: 0 }}
                        animate={
                          disableAnims
                            ? undefined
                            : { width: `${levelProgress}%` }
                        }
                        transition={
                          disableAnims
                            ? undefined
                            : { duration: 0.9, ease: "easeOut" }
                        }
                        style={
                          disableAnims
                            ? { width: `${levelProgress}%` }
                            : undefined
                        }
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {toNext} more province{toNext === 1 ? "" : "s"} to reach
                      the next level
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                    Max level reached — legend status unlocked!
                  </div>
                )}
              </motion.div>

              {/* Progress Breakdown */}
              <motion.div
                className="flex-1"
                initial={disableAnims ? undefined : { opacity: 0, y: 12 }}
                animate={disableAnims ? undefined : { opacity: 1, y: 0 }}
              >
                <div className="rounded-2xl border border-gray-200 p-5 bg-gray-50 h-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Progress Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Provinces Explored</span>
                      <span className="font-bold text-gray-900">
                        {exploredRegions} / {stats.total}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Provinces Remaining</span>
                      <span className="font-bold text-gray-900">
                        {stats.notVisited}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Exploration Rate</span>
                      <span className="font-bold text-gray-900">
                        {completionPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{exploredRegions} provinces</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div className="flex h-3 rounded-full overflow-hidden">
                        <motion.div
                          initial={disableAnims ? undefined : { width: 0 }}
                          animate={
                            disableAnims
                              ? undefined
                              : {
                                  width: `${
                                    stats.total > 0
                                      ? (stats.beenThere / stats.total) * 100
                                      : 0
                                  }%`,
                                }
                          }
                          transition={
                            disableAnims ? undefined : { duration: 0.8 }
                          }
                          style={
                            disableAnims
                              ? {
                                  width: `${
                                    stats.total > 0
                                      ? (stats.beenThere / stats.total) * 100
                                      : 0
                                  }%`,
                                }
                              : undefined
                          }
                          className="bg-green-500"
                        />
                        <motion.div
                          initial={disableAnims ? undefined : { width: 0 }}
                          animate={
                            disableAnims
                              ? undefined
                              : {
                                  width: `${
                                    stats.total > 0
                                      ? (stats.stayedThere / stats.total) * 100
                                      : 0
                                  }%`,
                                }
                          }
                          transition={
                            disableAnims
                              ? undefined
                              : { duration: 0.9, delay: 0.05 }
                          }
                          style={
                            disableAnims
                              ? {
                                  width: `${
                                    stats.total > 0
                                      ? (stats.stayedThere / stats.total) * 100
                                      : 0
                                  }%`,
                                }
                              : undefined
                          }
                          className="bg-blue-500"
                        />
                        <motion.div
                          initial={disableAnims ? undefined : { width: 0 }}
                          animate={
                            disableAnims
                              ? undefined
                              : {
                                  width: `${
                                    stats.total > 0
                                      ? (stats.passedBy / stats.total) * 100
                                      : 0
                                  }%`,
                                }
                          }
                          transition={
                            disableAnims
                              ? undefined
                              : { duration: 1, delay: 0.1 }
                          }
                          style={
                            disableAnims
                              ? {
                                  width: `${
                                    stats.total > 0
                                      ? (stats.passedBy / stats.total) * 100
                                      : 0
                                  }%`,
                                }
                              : undefined
                          }
                          className="bg-yellow-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Been There</span>
                      <span>Visited</span>
                      <span>Lived</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Achievements grid */}
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              Achievements
            </h3>
            <motion.div
              variants={container}
              initial={disableAnims ? undefined : "hidden"}
              animate={disableAnims ? undefined : "show"}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
            >
              {levels.map((lvl, idx) => {
                const prevStrict = (() => {
                  for (let j = idx - 1; j >= 0; j--) {
                    if (levels[j].required < lvl.required)
                      return levels[j].required;
                  }
                  return 0;
                })();

                const completed = exploredRegions >= lvl.required;
                const inProgress = !completed && exploredRegions > prevStrict;

                const denom = Math.max(1, lvl.required - prevStrict);
                const numer = Math.max(
                  0,
                  Math.min(exploredRegions, lvl.required) - prevStrict
                );
                const progress = Math.min(
                  100,
                  Math.round((numer / denom) * 100)
                );

                const cardClasses = completed
                  ? "bg-green-50 border-green-200"
                  : inProgress
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200";

                const barColor = completed
                  ? "bg-green-500"
                  : inProgress
                  ? "bg-blue-500"
                  : "bg-gray-400";

                const emojiClasses = `text-3xl ${
                  completed || inProgress ? "" : "grayscale"
                }`;

                return (
                  <motion.div
                    variants={fadeUp}
                    whileHover={{ y: -3 }}
                    key={idx}
                    className={`p-4 rounded-xl border ${cardClasses}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-gray-500">
                          Level {idx + 1}
                        </div>
                        <div className="font-semibold text-gray-900">
                          {lvl.title}
                        </div>
                        <div className="text-xs text-gray-600">
                          Reach {lvl.required} provinces
                        </div>
                      </div>
                      <div className={emojiClasses}>{lvl.emoji}</div>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                      <motion.div
                        initial={disableAnims ? undefined : { width: 0 }}
                        animate={
                          disableAnims ? undefined : { width: `${progress}%` }
                        }
                        transition={
                          disableAnims ? undefined : { duration: 0.7 }
                        }
                        style={
                          disableAnims ? { width: `${progress}%` } : undefined
                        }
                        className={`h-1.5 rounded-full ${barColor}`}
                      />
                    </div>
                    <div className="text-xs text-gray-700 mt-1">
                      {Math.min(exploredRegions, lvl.required)}/{lvl.required}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Call to Action */}
          {exploredRegions === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white"
            >
              <h3 className="text-3xl font-bold mb-4">
                Ready to Start Your Journey?
              </h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                You haven&apos;t started tracking your travels yet. Begin your
                Philippine adventure today!
              </p>
              <Link
                href="/map"
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-block"
              >
                🗺️ Start Tracking Now
              </Link>
            </motion.div>
          ) : completionPercentage < 100 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white"
            >
              <h3 className="text-3xl font-bold mb-4">Keep Exploring!</h3>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                You&apos;ve explored {exploredRegions} provinces so far. There
                are still {stats.notVisited} more places to discover!
              </p>
              <Link
                href="/map"
                className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow- xl transition-all duration-200 transform hover:scale-105 inline-block"
              >
                🚀 Continue Exploring
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl p-12 text-white"
            >
              <h3 className="text-3xl font-bold mb-4">Congratulations! 🎉</h3>
              <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
                Amazing! You&apos;ve explored all provinces of the Philippines.
                You&apos;re a true Philippines Master!
              </p>
              <Link
                href="/map"
                className="bg-white text-yellow-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 inline-block"
              >
                🏆 View Your Complete Map
              </Link>
            </motion.div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">
                  Been There Philippines
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                Track your adventures across the beautiful Philippines
              </p>
              <div className="flex justify-center space-x-6">
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/map"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Map
                </Link>
              </div>
              <div className="mt-8 pt-8 border-t border-gray-800">
                <p className="text-gray-500 text-sm">
                  © 2025 Been There Philippines. Made with ❤️ for Filipino
                  travelers.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
