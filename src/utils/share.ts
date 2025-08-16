"use client";

import { MapState, MapStats } from "@/types/map";
import { db } from "@/lib/firebase";
import { serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "firebase/auth";

// Stable stringify to ensure deterministic hashes
function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  const record = obj as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const entries = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify((record as any)[k])}`
  );
  return `{${entries.join(",")}}`;
}

export function computeStateHash(mapState: MapState, stats: MapStats): string {
  const payload = `${stableStringify(mapState)}|${stableStringify(stats)}`;
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash * 33) ^ payload.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export async function loadUsername(uid: string): Promise<string | null> {
  try {
    const profileRef = doc(db, "profiles", uid);
    const snap = await getDoc(profileRef);
    const u = (snap.exists() && (snap.data() as any)?.username) || null;
    return typeof u === "string" && u.length > 0 ? u : null;
  } catch {
    return null;
  }
}

export async function saveSnapshot(
  mapState: MapState,
  stats: MapStats,
  user: User
): Promise<void> {
  const stateHash = computeStateHash(mapState, stats);
  const ref = doc(db, "snapshots", user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await setDoc(
      ref,
      {
        mapState,
        stats,
        stateHash,
        userDisplayName: user?.displayName ?? null,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } else {
    await setDoc(ref, {
      mapState,
      stats,
      stateHash,
      userDisplayName: user?.displayName ?? null,
      userId: user.uid,
      createdAt: serverTimestamp(),
    });
  }
}

export function buildShareUrl(username: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const path = `/${encodeURIComponent(username)}/share`;
  return base ? `${base}${path}` : path;
}
