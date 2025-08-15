// Simple auth utility helpers
// Returns true if a user is logged in and owns the resource (by uid)
export function canManageShare(
  currentUid?: string | null,
  ownerUid?: string | null
): boolean {
  return !!currentUid && !!ownerUid && currentUid === ownerUid;
}
