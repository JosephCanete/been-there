"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  const [checkingUsername, setCheckingUsername] = useState(true);

  // If logged in and no username yet, force onboarding even on /
  useEffect(() => {
    const run = async () => {
      if (loading) return;
      if (!user) {
        setCheckingUsername(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "profiles", user.uid));
        const username = snap.exists() ? (snap.data() as any)?.username : null;
        if (!username) {
          router.replace("/onboarding");
          return;
        }
      } catch (e) {
        router.replace("/onboarding");
        return;
      } finally {
        setCheckingUsername(false);
      }
    };
    run();
  }, [user, loading, router]);

  if (loading || checkingUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
        <div
          className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"
          aria-label="Loading"
          role="status"
        />
      </div>
    );
  }

  // Animation helpers
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  const containerStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Decorative animated blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"
        animate={{ y: [0, -15, 0], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl"
        animate={{ y: [0, 20, 0], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                initial={{ scale: 0.9, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 12 }}
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-sm"
              >
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </motion.div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                  Been There Philippines
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
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
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-10 w-24 rounded-full"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.photoURL && (
                      <Image
                        src={user.photoURL}
                        alt={user.displayName || "User"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {user.displayName}
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
                    onClick={signInWithGoogle}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200 font-medium"
                  >
                    Sign In with Google
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Authentication/Actions */}
            <div className="flex md:hidden items-center space-x-2">
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded-full"></div>
              ) : user ? (
                <>
                  {user.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                    />
                  )}
                  <Link
                    href="/map"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                  >
                    Map
                  </Link>
                </>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Items (below main header) */}
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="flex justify-center space-x-6">
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                About
              </Link>
              <Link
                href="/stats"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Stats
              </Link>
              {user && (
                <button
                  onClick={signOut}
                  className="text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content (revamped + animated) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO */}
        <section className="py-10 lg:py-20">
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-4 py-1.5 text-sm font-medium mb-5"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              Gamified travel tracker for all 80 provinces
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight"
            >
              Explore & Track
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1">
                Your Philippine Journey
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            >
              Turn your journeys into achievements. Mark every place you&apos;ve
              Been There, Visited, or Lived; level up with milestones, and share
              a beautiful profile showcasing your story across the archipelago.
            </motion.p>

            {/* Auth-aware CTA */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center mt-10"
            >
              {user ? (
                <>
                  <Link
                    href="/map"
                    className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="mr-2 inline-block transition-transform group-hover:-translate-y-0.5">
                      🗺️
                    </span>
                    Continue Tracking
                  </Link>
                  <Link
                    href="/stats"
                    className="group border-2 border-blue-300 text-blue-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                  >
                    <span className="mr-2 inline-block transition-transform group-hover:-translate-y-0.5">
                      📊
                    </span>
                    View Your Stats
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={signInWithGoogle}
                    className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <span className="mr-2 inline-block transition-transform group-hover:-translate-y-0.5">
                      🔐
                    </span>
                    Sign in with Google
                  </button>
                  <Link
                    href="/about"
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                  >
                    Learn More
                  </Link>
                </>
              )}
            </motion.div>

            {/* Benefit chips */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-8"
            >
              {[
                {
                  label: "Levels, badges & streaks",
                  color: "bg-green-50 text-green-700 border-green-200",
                },
                {
                  label: "Mark Explorer: Been There / Visited / Lived",
                  color: "bg-indigo-50 text-indigo-700 border-indigo-200",
                },
                {
                  label: "Secure Google SSO",
                  color: "bg-blue-50 text-blue-700 border-blue-200",
                },
                {
                  label: "Shareable achievements & map snapshots",
                  color: "bg-pink-50 text-pink-700 border-pink-200",
                },
              ].map((chip, i) => (
                <motion.span
                  variants={fadeUp}
                  key={i}
                  className={`px-3 py-1.5 text-sm rounded-full border ${chip.color}`}
                >
                  {chip.label}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Live Preview Card */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto"
          >
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
            <div className="grid md:grid-cols-2 gap-0">
              {/* Map placeholder */}
              <div className="aspect-video md:aspect-auto bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-6">
                <div className="text-center">
                  <svg
                    className="w-24 h-24 text-blue-400 mx-auto mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <p className="text-gray-600 font-medium">
                    Pin provinces and watch your progress grow
                  </p>
                </div>
              </div>
              {/* Gamification preview */}
              <div className="p-6 md:p-8">
                <div className="space-y-5">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl border border-green-200 bg-green-50 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🧭</span>
                        <div>
                          <p className="text-sm text-green-700 font-medium">
                            Current Level
                          </p>
                          <p className="text-lg font-bold text-green-900">
                            Trail Trekker
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-green-800">
                        Level 3
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full bg-green-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "20%" }}
                        whileInView={{ width: "66%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-green-500"
                      />
                    </div>
                    <p className="mt-2 text-xs text-green-800">
                      2 provinces to next level
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Been There",
                        color: "bg-green-50 border-green-200 text-green-800",
                      },
                      {
                        label: "Visited",
                        color: "bg-blue-50 border-blue-200 text-blue-800",
                      },
                      {
                        label: "Lived",
                        color: "bg-pink-50 border-pink-200 text-pink-800",
                      },
                    ].map((t) => (
                      <motion.div
                        whileHover={{ y: -2 }}
                        key={t.label}
                        className={`rounded-lg border px-3 py-2 text-center ${t.color}`}
                      >
                        <p className="text-xs text-gray-500">Mark</p>
                        <p className="text-sm font-semibold">{t.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"
                  >
                    <p className="text-sm text-indigo-800 font-medium mb-2">
                      Recent Badge
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏝️</span>
                      <div>
                        <p className="font-semibold text-indigo-900">
                          Island Hopper
                        </p>
                        <p className="text-xs text-indigo-700">
                          Visited 10 different islands
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl border border-pink-200 bg-pink-50 p-4"
                  >
                    <p className="text-sm text-pink-800 font-medium mb-2">
                      Share-Ready
                    </p>
                    <p className="text-xs text-pink-700">
                      Generate a share link and map snapshot of your progress.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* HIGHLIGHTS */}
        <section className="py-6 md:py-8">
          <motion.div
            variants={containerStagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-4 gap-6"
          >
            {[
              {
                title: "Gamification",
                desc: "Levels, badges, streaks & milestones keep you motivated.",
                icon: (
                  <svg
                    className="w-8 h-8 text-green-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5 3h14v6l-7 4-7-4V3z" />
                    <path d="M5 21v-8l7 4 7-4v8H5z" />
                  </svg>
                ),
                color: "bg-green-50",
              },
              {
                title: "Mark Explorer",
                desc: "Tag provinces as Been There, Visited, or Lived.",
                icon: (
                  <svg
                    className="w-8 h-8 text-blue-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8 2 5 5 5 9c0 6 7 13 7 13s7-7 7-13c0-4-3-7-7-7z" />
                  </svg>
                ),
                color: "bg-blue-50",
              },
              {
                title: "Powered by SSO",
                desc: "One-tap secure sign-in with Google.",
                icon: (
                  <svg
                    className="w-8 h-8 text-indigo-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
                  </svg>
                ),
                color: "bg-indigo-50",
              },
              {
                title: "Share Achievements",
                desc: "Public profile and map snapshots to celebrate wins.",
                icon: (
                  <svg
                    className="w-8 h-8 text-pink-600"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18 8a3 3 0 10-2.83-4H9a3 3 0 100 2h6A3 3 0 0018 8zM6 16a3 3 0 102.83 4H15a3 3 0 100-2H8.83A3 3 0 006 16z" />
                  </svg>
                ),
                color: "bg-pink-50",
              },
            ].map((f) => (
              <motion.div
                variants={fadeUp}
                key={f.title}
                className={`text-center p-6 rounded-xl shadow-sm border border-gray-100 ${f.color}`}
                whileHover={{
                  y: -4,
                  boxShadow: "0 12px 24px -8px rgba(0,0,0,0.15)",
                }}
              >
                <div className="w-16 h-16 rounded-full bg-white border border-gray-100 flex items-center justify-center mx-auto mb-4 shadow">
                  {f.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {f.title}
                </h4>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-10">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              How it works
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From sign-in to sharing your journey—just a few simple steps.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                n: 1,
                t: "Sign in",
                d: "Use secure Google SSO to get started in seconds.",
              },
              {
                n: 2,
                t: "Mark places",
                d: "Tap a province to mark Been There, Visited, or Lived.",
              },
              {
                n: 3,
                t: "Level up",
                d: "Earn badges and climb levels as your map fills in.",
              },
              {
                n: 4,
                t: "Share",
                d: "Create a share link or snapshot to show your progress.",
              },
            ].map((s) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: s.n * 0.08 }}
                className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="absolute -top-3 left-6 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow">
                  {s.n}
                </div>
                <h4 className="mt-3 text-lg font-semibold text-gray-900">
                  {s.t}
                </h4>
                <p className="mt-2 text-gray-600 text-sm">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SOCIAL PROOF STRIP */}
        <section className="mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-white/70 border border-gray-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-blue-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              <p className="text-gray-700">
                <span className="font-semibold">81</span> provinces to explore
              </p>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-green-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700">
                3 mark types for flexible tracking
              </p>
            </div>
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-pink-600"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18 8a3 3 0 10-2.83-4H9a3 3 0 100 2h6A3 3 0 0018 8zM6 16a3 3 0 102.83 4H15a3 3 0 100-2H8.83A3 3 0 006 16z" />
              </svg>
              <p className="text-gray-700">Instant share links and snapshots</p>
            </div>
          </motion.div>
        </section>

        <section className="py-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-8 py-16 text-white relative overflow-hidden"
          >
            <motion.div
              aria-hidden
              className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-white/10"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
              aria-hidden
              className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-white/10"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 7, repeat: Infinity }}
            />
            <h3 className="text-3xl font-bold mb-4">
              Ready to start your journey?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Sign in, tag your provinces, level up, and share your Philippines
              travel story.
            </p>
            <Link
              href="/map"
              className="group bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-200 inline-flex items-center justify-center"
            >
              <span className="mr-2 transition-transform group-hover:translate-x-0.5">
                🚀
              </span>
              Launch Map Tracker
            </Link>
          </motion.div>
        </section>
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
