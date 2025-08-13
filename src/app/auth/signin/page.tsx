"use client";

import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SignIn() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/map");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign in failed:", error);
      setIsSigningIn(false);
    }
  };

  // Show loading if user is already signed in
  if (user && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow p-6">
            <div className="h-6 w-56 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Logo and Title */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center space-x-3 mb-6">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
            >
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </motion.div>
          </Link>
          <motion.h1
            variants={fadeUp}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            Welcome Back!
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-600">
            Sign in to continue tracking your Philippine adventures
          </motion.p>
        </motion.div>

        {/* Sign In Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Sign in to your account
              </h2>
              <p className="text-sm text-gray-600">
                Access your personal travel tracker and statistics
              </p>
            </div>

            {/* Google Sign In Button */}
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isSigningIn || loading}
              className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-700 font-medium hover:shadow-md hover:border-gray-400 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="group-hover:text-gray-900 transition-colors">
                {isSigningIn ? "Signing in..." : "Continue with Google"}
              </span>
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Secure authentication
                </span>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                By signing in, you agree to securely save your travel progress.
                <br />
                We only access your basic Google profile information.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to homepage
          </Link>
        </div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-white/50 backdrop-blur-sm rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            What you&apos;ll get access to:
          </h3>
          <div className="space-y-3">
            {[
              {
                iconColor: "text-blue-600",
                bg: "bg-blue-100",
                text: "Interactive Philippines map",
              },
              {
                iconColor: "text-green-600",
                bg: "bg-green-100",
                text: "Personal travel progress tracking",
              },
              {
                iconColor: "text-purple-600",
                bg: "bg-purple-100",
                text: "Detailed statistics and achievements",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center space-x-3"
              >
                <div
                  className={`w-8 h-8 ${f.bg} rounded-full flex items-center justify-center`}
                >
                  <svg
                    className={`w-4 h-4 ${f.iconColor}`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
