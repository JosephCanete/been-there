"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
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
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                About
              </Link>
              <Link
                href="/stats"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Stats
              </Link>

              {/* Authentication Section */}
              {status === "loading" ? (
                <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
              ) : session ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {session.user?.name}
                    </span>
                  </div>
                  <Link
                    href="/map"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Open Map
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => signIn("google")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Sign In with Google
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-20 lg:py-32">
          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Track Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Philippine
              </span>{" "}
              Adventures
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover and document your journey across the beautiful islands of
              the Philippines. Keep track of where you&apos;ve been, where
              you&apos;ve stayed, and where you want to explore next.
            </p>

            {session ? (
              <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  Welcome back, {session.user?.name}! Ready to continue your
                  Philippine adventure?
                </p>
              </div>
            ) : (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">
                  Sign in with Google to start tracking your travels and save
                  your progress!
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {session ? (
                <>
                  <Link
                    href="/map"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    🗺️ Continue Tracking
                  </Link>
                  <Link
                    href="/stats"
                    className="border-2 border-blue-300 text-blue-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    📊 View Your Stats
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => signIn("google")}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    🗺️ Sign In & Start Tracking
                  </button>
                  <Link
                    href="/about"
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    Learn More
                  </Link>
                </>
              )}
            </div>

            {/* Feature Preview */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-white font-medium">
                    Interactive Philippines Map
                  </span>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                  <svg
                    className="w-32 h-32 text-blue-400 mx-auto mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <p className="text-gray-600 font-medium">
                    Click &quot;Start Tracking&quot; to explore the interactive
                    map
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Track Your Journey
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our interactive map makes it easy to visualize and organize your
              Philippine travel experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Been There
              </h4>
              <p className="text-gray-600">
                Mark places you&apos;ve visited and explored during your travels
                across the Philippines.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                  <path d="M8 15v-1a3 3 0 116 0v1" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Stayed There
              </h4>
              <p className="text-gray-600">
                Track destinations where you&apos;ve spent the night or stayed
                for extended periods.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">
                Passed By
              </h4>
              <p className="text-gray-600">
                Note places you&apos;ve passed through during transit or brief
                stops on your journey.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-8 py-16 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Begin documenting your Philippine adventures today. Your travel
              memories deserve to be preserved and visualized.
            </p>
            <Link
              href="/map"
              className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-block"
            >
              🚀 Launch Map Tracker
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
              <span className="text-xl font-bold">Been There Philippines</span>
            </div>
            <p className="text-gray-400 mb-6">
              Track your adventures across the beautiful Philippines
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/map"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Map
              </Link>
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                About
              </Link>
              <Link
                href="/stats"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Stats
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
  );
}
