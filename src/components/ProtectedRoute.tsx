"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  // New: optionally suppress this component's internal skeleton UIs
  showSkeleton?: boolean;
}

export default function ProtectedRoute({
  children,
  showSkeleton = true,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showDelayedSkeleton, setShowDelayedSkeleton] = useState(false);

  // After a brief delay, show skeletons (if enabled). Show spinner immediately to avoid blank screen.
  useEffect(() => {
    if (!loading) {
      setShowDelayedSkeleton(false);
      return;
    }
    const t = setTimeout(() => setShowDelayedSkeleton(true), 500);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (loading) return; // Still loading

    if (!user) {
      router.push("/auth/signin");
      return;
    }
  }, [user, loading, router]);

  const SpinnerScreen = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
      <div className="w-full max-w-lg flex items-center justify-center">
        <div
          className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"
          aria-label="Loading"
          role="status"
        />
      </div>
    </div>
  );

  const SkeletonScreen = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading while checking authentication
  if (loading) {
    if (!showDelayedSkeleton) return SpinnerScreen; // first show spinner
    if (showSkeleton) return SkeletonScreen; // then skeleton (if enabled)
    return SpinnerScreen; // fallback if skeleton suppressed
  }

  // Show loading if no user (redirecting)
  if (!user) {
    if (!showDelayedSkeleton) return SpinnerScreen;
    if (showSkeleton)
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
          <div className="w-full max-w-lg">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-6">
              <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      );
    return SpinnerScreen;
  }

  return <>{children}</>;
}
