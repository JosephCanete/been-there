"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import InteractiveMapReal from "@/components/InteractiveMapReal";

export default function MapPage() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="h-screen flex flex-col bg-white">
        {/* Compact Header */}
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Been There Philippines
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Welcome back,{" "}
                    {session?.user?.name?.split(" ")[0] || "Explorer"}!
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
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
                <div className="flex items-center space-x-3">
                  {session?.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full border-2 border-white/30"
                    />
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-blue-100 hover:text-white transition-colors text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Full Screen Map Container */}
        <main className="flex-1 flex overflow-hidden">
          <InteractiveMapReal className="w-full h-full" />
        </main>
      </div>
  );
}
