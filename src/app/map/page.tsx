"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import Image from "next/image";
import InteractiveMap from "@/components/InteractiveMap";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";

export default function MapPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Disable page scrolling entirely while on the map page (mobile + desktop)
  useEffect(() => {
    const html = document.documentElement as HTMLElement;
    const body = document.body as HTMLBodyElement & {
      style: CSSStyleDeclaration & { overscrollBehavior?: string };
    };

    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevHtmlOverscroll = (html.style as any).overscrollBehavior;

    const prevBodyOverflow = body.style.overflow;
    const prevBodyHeight = body.style.height;
    const prevBodyOverscroll = (body.style as any).overscrollBehavior;
    const prevBodyTouchAction = (body.style as any).touchAction;

    html.style.overflow = "hidden";
    html.style.height = "100%";
    (html.style as any).overscrollBehavior = "none";

    body.style.overflow = "hidden";
    body.style.height = "100%";
    (body.style as any).overscrollBehavior = "none";
    (body.style as any).touchAction = "none";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      (html.style as any).overscrollBehavior = prevHtmlOverscroll;

      body.style.overflow = prevBodyOverflow;
      body.style.height = prevBodyHeight;
      (body.style as any).overscrollBehavior = prevBodyOverscroll;
      (body.style as any).touchAction = prevBodyTouchAction;
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <ProtectedRoute showSkeleton={false}>
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        {/* Compact Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg z-10">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              {/* Left: Brand + Title */}
              <Link
                href="/"
                className="flex items-center space-x-3 flex-1 min-w-0"
              >
                <motion.div
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 14,
                  }}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-white truncate">
                    Been There Philippines
                  </h1>
                  <p className="hidden sm:block text-blue-100 text-xs sm:text-sm truncate">
                    Welcome back,{" "}
                    {user?.displayName?.split(" ")[0] || "Explorer"}!
                  </p>
                </div>
              </Link>

              {/* Right: Nav + (desktop) user actions */}
              <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center space-x-4">
                  <Link
                    href="/"
                    className="text-blue-100 hover:text-white transition-colors text-sm font-medium"
                  >
                    Home
                  </Link>
                  <a
                    href="/about"
                    className="text-blue-100 hover:text-white transition-colors text-sm font-medium"
                  >
                    About
                  </a>
                  <a
                    href="/stats"
                    className="text-blue-100 hover:text-white transition-colors text-sm font-medium"
                  >
                    Stats
                  </a>
                </div>

                {/* Mobile Navigation */}
                <div className="flex sm:hidden items-center space-x-3 text-xs">
                  <Link
                    href="/"
                    className="text-blue-100 hover:text-white transition-colors font-medium"
                  >
                    Home
                  </Link>
                  <a
                    href="/stats"
                    className="text-blue-100 hover:text-white transition-colors font-medium"
                  >
                    Stats
                  </a>
                </div>

                {/* User Actions (desktop only) */}
                <div className="hidden sm:flex items-center space-x-2 sm:space-x-3">
                  {user?.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={28}
                      height={28}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white/30"
                    />
                  )}
                  <motion.button
                    whileHover={{ y: -1 }}
                    onClick={handleSignOut}
                    className="text-blue-100 hover:text-white transition-colors text-xs sm:text-sm font-medium bg-white/20 px-2 py-1 sm:px-3 sm:py-1 rounded-full"
                  >
                    Sign Out
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Full Screen Map Container */}
        <main className="flex-1 flex overflow-hidden">
          <InteractiveMap className="w-full h-full" />
        </main>
      </div>
    </ProtectedRoute>
  );
}
