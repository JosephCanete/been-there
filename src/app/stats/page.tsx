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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
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
              <div className="flex items-center space-x-6">
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Your Travel Statistics
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Detailed insights into your Philippine adventure progress and
              exploration journey.
            </p>
          </div>

          {/* Main Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {completionPercentage}%
              </div>
              <div className="text-gray-600 font-medium">Overall Progress</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.beenThere}
              </div>
              <div className="text-gray-600 font-medium">Been There</div>
              <div className="text-sm text-gray-500 mt-1">
                Provinces Visited
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.stayedThere}
              </div>
              <div className="text-gray-600 font-medium">Visited</div>
              <div className="text-sm text-gray-500 mt-1">Extended Visits</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {stats.passedBy}
              </div>
              <div className="text-gray-600 font-medium">Lived</div>
              <div className="text-sm text-gray-500 mt-1">Transit Points</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Progress Breakdown */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Progress Breakdown
              </h3>
              <div className="space-y-4">
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

              {/* Visual Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{exploredRegions} provinces</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="flex h-4 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.beenThere / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-blue-500"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.stayedThere / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                    <div
                      className="bg-yellow-500"
                      style={{
                        width: `${
                          stats.total > 0
                            ? (stats.passedBy / stats.total) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Been There</span>
                  <span>Visited</span>
                  <span>Lived</span>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Achievements
              </h3>
              <div className="space-y-4">
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    exploredRegions >= 1
                      ? "bg-green-50 border border-green-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    className={`text-2xl ${
                      exploredRegions >= 1 ? "" : "grayscale"
                    }`}
                  >
                    🌟
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      First Explorer
                    </div>
                    <div className="text-sm text-gray-600">
                      Visit your first province
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    exploredRegions >= 5
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    className={`text-2xl ${
                      exploredRegions >= 5 ? "" : "grayscale"
                    }`}
                  >
                    🗺️
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Provincial Explorer
                    </div>
                    <div className="text-sm text-gray-600">
                      Explore 5 provinces ({Math.min(exploredRegions, 5)}/5)
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    exploredRegions >= 10
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    className={`text-2xl ${
                      exploredRegions >= 10 ? "" : "grayscale"
                    }`}
                  >
                    🏝️
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Island Hopper
                    </div>
                    <div className="text-sm text-gray-600">
                      Explore 10 provinces ({Math.min(exploredRegions, 10)}/10)
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    completionPercentage >= 50
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    className={`text-2xl ${
                      completionPercentage >= 50 ? "" : "grayscale"
                    }`}
                  >
                    🏆
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Halfway Hero
                    </div>
                    <div className="text-sm text-gray-600">
                      Reach 50% completion ({completionPercentage}%)
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    completionPercentage >= 100
                      ? "bg-red-50 border border-red-200"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div
                    className={`text-2xl ${
                      completionPercentage >= 100 ? "" : "grayscale"
                    }`}
                  >
                    🇵🇭
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Philippines Master
                    </div>
                    <div className="text-sm text-gray-600">
                      Complete all provinces (100%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          {exploredRegions === 0 ? (
            <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white">
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
            </div>
          ) : completionPercentage < 100 ? (
            <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">Keep Exploring!</h3>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                You&apos;ve explored {exploredRegions} provinces so far. There
                are still {stats.notVisited} more places to discover!
              </p>
              <Link
                href="/map"
                className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-block"
              >
                🚀 Continue Exploring
              </Link>
            </div>
          ) : (
            <div className="text-center bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">Congratulations! 🎉</h3>
              <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
                Amazing! You&apos;ve explored all provinces of the Philippines.
                You&apos;re a true Philippines Master!
              </p>
              <Link
                href="/map"
                className="bg-white text-yellow-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-block"
              >
                🏆 View Your Complete Map
              </Link>
            </div>
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
