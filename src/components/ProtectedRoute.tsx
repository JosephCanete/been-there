"use client";

import { useAuth } from "@/components/AuthProvider";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [showDelayedSkeleton, setShowDelayedSkeleton] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // After a brief delay, show skeletons (if enabled). Show spinner immediately to avoid blank screen.
  useEffect(() => {
    if (!loading) {
      setShowDelayedSkeleton(false);
      return;
    }
    const t = setTimeout(() => setShowDelayedSkeleton(true), 500);
    return () => clearTimeout(t);
  }, [loading]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (loading) return; // Still loading

    if (!user) {
      router.replace("/auth/signin");
      return;
    }
  }, [user, loading, router]);

  // Enforce username onboarding for authenticated users (skip on onboarding pages)
  useEffect(() => {
    const checkUsername = async () => {
      if (loading) return;
      if (!user) return;
      // Allow onboarding pages to render without redirect loop
      if (pathname?.startsWith("/onboarding")) {
        setCheckingProfile(false);
        return;
      }
      try {
        const profileRef = doc(db, "profiles", user.uid);
        const snap = await getDoc(profileRef);
        const hasUsername =
          snap.exists() &&
          typeof (snap.data() as any)?.username === "string" &&
          (snap.data() as any).username.length > 0;
        if (!hasUsername) {
          router.replace("/onboarding");
          return;
        }
      } catch (e) {
        // If profile read fails, still route to onboarding as a safe default
        router.replace("/onboarding");
        return;
      } finally {
        setCheckingProfile(false);
      }
    };
    checkUsername();
  }, [loading, user, pathname, router]);

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

  // Show loading while checking authentication or profile
  if (loading || checkingProfile) {
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
