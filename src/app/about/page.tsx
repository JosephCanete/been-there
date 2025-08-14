"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export default function AboutPage() {
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  const scaleIn = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1 },
  };

  const faqs = [
    {
      q: "Do I need an account to use Been There Philippines?",
      a: "No account is required. Your progress is stored locally in your browser so you can start right away.",
    },
    {
      q: "How do status levels work on the map?",
      a: "Tap or click a province to cycle through statuses like Not Visited, Visited, Been There, and Lived. Your selections auto‑save.",
    },
    {
      q: "Can I use it on mobile?",
      a: "Yes. The app is fully responsive and optimized for touch interactions on phones and tablets.",
    },
    {
      q: "How can I share my map?",
      a: "Use the Share feature to generate a shareable view of your current progress.",
    },
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const toggleFaq = (i: number) => setOpenFaq((p) => (p === i ? null : i));

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Decorative background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-sm">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
              <span className="hidden sm:block text-base sm:text-xl font-bold text-gray-900">
                Been There Philippines
              </span>
            </Link>

            {/* Mobile CTA */}
            <div className="md:hidden">
              <Link
                href="/map"
                className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 text-white px-3 py-1.5 text-sm font-medium shadow hover:bg-black transition-colors"
              >
                <span>Open Map</span>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/about"
                aria-current="page"
                className="text-gray-900 font-semibold"
              >
                About
              </Link>
              <Link
                href="/stats"
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Stats
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 text-sm font-medium shadow hover:shadow-md transition-all"
              >
                Start Tracking
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="space-y-12 sm:space-y-16"
        >
          {/* Hero */}
          <motion.section
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white shadow-xl"
          >
            <div className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern
                    id="grid"
                    width="32"
                    height="32"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 32 0 L 0 0 0 32"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="relative">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/30 backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Built for travelers
              </span>
              <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Map your Philippine adventures with ease
              </h1>
              <p className="mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base text-blue-100">
                A fast, delightful way to track where you’ve been, where you’ve
                stayed, and the places you’ve called home—powered by a simple,
                interactive map.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/map"
                  className="inline-flex items-center justify-center rounded-full bg-white text-blue-700 px-5 py-2.5 text-sm font-semibold shadow hover:shadow-md transition-all"
                >
                  🗺️ Open Interactive Map
                </Link>
                <Link
                  href="/stats"
                  className="inline-flex items-center justify-center rounded-full border border-white/70 px-5 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                >
                  View Stats
                </Link>
              </div>
            </div>
          </motion.section>

          {/* About */}
          <motion.section
            variants={scaleIn}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              About the Project
            </h2>
            <p className="text-gray-700 leading-relaxed">
              I’m a software engineer based in Singapore who loves building
              useful things. AI helped accelerate development and refine the
              experience of this personal project.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href="https://www.linkedin.com/in/raymond-joseph-ca%C3%B1ete-30b84b192/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0a66c2] text-white px-4 py-2 text-sm font-medium shadow hover:bg-[#084c97] transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.447-2.136 2.943v5.663H9.352V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.37-1.852 3.603 0 4.268 2.372 4.268 5.455v6.288zM5.337 7.433a2.063 2.063 0 110-4.126 2.063 2.063 0 010 4.126zM7.116 20.452H3.555V9h3.561v11.452z" />
                </svg>
                Connect on LinkedIn
              </a>
              <a
                href="mailto:hello@example.com"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                ✉️ Contact
              </a>
            </div>
          </motion.section>

          {/* How It Works */}
          <motion.section
            variants={fadeUp}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              <div className="group rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <span>🗺️</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Interactive Map
                </h4>
                <p className="text-gray-600">
                  Click any province to cycle through different status levels.
                  Pan and zoom to explore every corner of the Philippines.
                </p>
              </div>
              <div className="group rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <span>📱</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Mobile Friendly
                </h4>
                <p className="text-gray-600">
                  Fully responsive design works on your phone, tablet, or
                  desktop. Track your travels wherever you are.
                </p>
              </div>
              <div className="group rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <span>💾</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Auto Save
                </h4>
                <p className="text-gray-600">
                  Your progress is automatically saved locally in your browser.
                  No account required—your data stays private.
                </p>
              </div>
              <div className="group rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-pink-600 ring-1 ring-pink-100">
                  <span>📊</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  Progress Tracking
                </h4>
                <p className="text-gray-600">
                  See detailed statistics about your travel progress and
                  completion percentage across all regions.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Status Levels */}
          <motion.section
            variants={fadeUp}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Travel Status Levels
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-lg ring-1 ring-green-200/60 bg-green-50/60">
                <div className="w-6 h-6 rounded border-2 border-green-700 bg-green-500" />
                <div>
                  <h4 className="font-semibold text-green-800">Been There</h4>
                  <p className="text-green-700 text-sm">
                    Places you’ve visited and explored deeply
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg ring-1 ring-blue-200/60 bg-blue-50/60">
                <div className="w-6 h-6 rounded border-2 border-blue-700 bg-blue-500" />
                <div>
                  <h4 className="font-semibold text-blue-800">Visited</h4>
                  <p className="text-blue-700 text-sm">
                    Destinations you’ve stayed in or spent meaningful time
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg ring-1 ring-rose-200/60 bg-rose-50/60">
                <div className="w-6 h-6 rounded border-2 border-rose-700 bg-rose-500" />
                <div>
                  <h4 className="font-semibold text-rose-800">Lived</h4>
                  <p className="text-rose-700 text-sm">
                    Places you’ve called home for months or years
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg ring-1 ring-gray-200 bg-gray-50">
                <div className="w-6 h-6 rounded border-2 border-gray-500 bg-gray-300" />
                <div>
                  <h4 className="font-semibold text-gray-800">Not Visited</h4>
                  <p className="text-gray-700 text-sm">
                    Areas you haven’t explored yet
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* FAQ */}

          {/* Call to Action */}
          <motion.section
            variants={fadeUp}
            className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 sm:p-12 text-white"
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to Start Mapping?
            </h3>
            <p className="text-base sm:text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Begin documenting your Philippine adventures today. Every journey
              has a story worth remembering.
            </p>
            <Link
              href="/map"
              className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-sm sm:text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 inline-block"
            >
              🗺️ Open Interactive Map
            </Link>
          </motion.section>
        </motion.div>
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
              <span className="text-xl font-bold">Been There Philippines</span>
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
                href="/map"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Map
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
