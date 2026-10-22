/**
 * React number inputs must never receive NaN as their value.
 * Preserve invalid/empty values as an empty string for display.
 * Submission validation remains responsible for rejecting them.
 */
export function safeNumericValue(value: number): number | "" {
  return Number.isFinite(value) ? value : "";
}
