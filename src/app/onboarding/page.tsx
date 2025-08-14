"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";

function normalizeUsername(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      // Disallow spaces entirely
      .replace(/\s+/g, "")
      // Allow only a-z, 0-9 and hyphen; replace others with hyphen
      .replace(/[^a-z0-9-]/g, "-")
      // Collapse multiple hyphens
      .replace(/-+/g, "-")
      // Trim hyphens on ends
      .replace(/^-+|-+$/g, "")
      // Limit length 32
      .slice(0, 32)
  );
}

const RESERVED = new Set([
  "admin",
  "about",
  "auth",
  "login",
  "signin",
  "signup",
  "map",
  "stats",
  "share",
  "settings",
  "onboarding",
  "u",
  "user",
  "users",
  "api",
  "_next",
  "static",
]);

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/signin");
    }
  }, [loading, user, router]);

  // Check current profile and redirect if already has username
  useEffect(() => {
    const run = async () => {
      if (!user) return;
      const profileRef = doc(db, "profiles", user.uid);
      const snap = await getDoc(profileRef);
      const existing = (snap.exists() && (snap.data() as any).username) || "";
      if (existing) {
        router.replace("/");
      }
    };
    run();
  }, [user, router]);

  const normalized = useMemo(() => normalizeUsername(username), [username]);

  const canSubmit =
    normalized.length >= 3 &&
    normalized.length <= 31 &&
    !RESERVED.has(normalized) &&
    available === true &&
    !!user &&
    !checking &&
    !submitting;

  // Auto-check availability when normalized changes (debounced)
  useEffect(() => {
    let active = true;
    setAvailable(null);
    setError(null);

    if (
      normalized.length < 3 ||
      normalized.length > 31 ||
      RESERVED.has(normalized)
    ) {
      return () => {
        active = false;
      };
    }

    const t = setTimeout(async () => {
      setChecking(true);
      try {
        const unameRef = doc(db, "usernames", normalized);
        const snap = await getDoc(unameRef);
        if (!active) return;
        setAvailable(!snap.exists());
      } catch (e) {
        if (!active) return;
        setError("Failed to check availability");
        setAvailable(null);
      } finally {
        if (active) setChecking(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [normalized]);

  const submit = async () => {
    if (!user) return;
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      await runTransaction(db, async (tx) => {
        const unameRef = doc(db, "usernames", normalized);
        const profileRef = doc(db, "profiles", user.uid);
        const unameSnap = await tx.get(unameRef);
        if (unameSnap.exists()) {
          throw new Error("That username is taken");
        }
        tx.set(unameRef, { uid: user.uid, createdAt: new Date() });
        tx.set(
          profileRef,
          { username: normalized, displayName: user.displayName ?? null },
          { merge: true }
        );
      });
      router.push("/map");
    } catch (e: any) {
      setError(e.message || "Failed to set username");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-xl font-bold text-gray-800">
          Greetings, traveler 👋
        </h1>
        <p className="text-sm text-gray-600 mt-1">What shall I call you?</p>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2 text-black"
              placeholder="e.g. mon"
              value={username}
              onChange={(e) => {
                const v = e.target.value.replace(/\s+/g, "");
                setUsername(v);
              }}
            />
          </div>
          <div className="mt-2 text-sm min-h-[1.25rem]">
            {checking && <span className="text-gray-500">Checking…</span>}
            {!checking && available === true && (
              <span className="text-emerald-600">Available</span>
            )}
            {!checking && available === false && (
              <span className="text-red-600">Not available</span>
            )}
            {error && <span className="text-red-600"> {error}</span>}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Allowed: a-z, 0-9, hyphen. No spaces. 3–31 chars.
          </p>
          {normalized && (
            <p className="text-xs text-gray-600 mt-1">
              Your link: <span className="font-mono">/{normalized}/share</span>
            </p>
          )}
        </div>
        <button
          onClick={submit}
          className="mt-4 w-full px-4 py-2 rounded bg-blue-600 text-white disabled:bg-gray-400 flex items-center justify-center"
          disabled={!canSubmit || submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save username"
          )}
        </button>
      </div>
    </div>
  );
}
