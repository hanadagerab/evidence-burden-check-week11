import assert from "node:assert/strict";
import { test } from "node:test";
import { validateReview } from "../src/lib/review.ts";

const base = {
  action: "document-complete" as const,
  route: "HUMAN_EXCEPTION" as const,
  reason: "Synthetic digital records reviewed for completeness.",
  evidenceFormat: "digital" as const,
  missingFields: 0,
  weightConflict: false,
};

test("Complete digital documentation can be reviewed", () => {
  assert.deepEqual(validateReview(base), []);
});

test("Paper evidence cannot be automatically marked complete", () => {
  const errors = validateReview({
    ...base,
    evidenceFormat: "paper",
  });

  assert.ok(errors.length > 0);
});

test("Conflicting weights block completeness confirmation", () => {
  assert.ok(validateReview({
    ...base,
    weightConflict: true,
  }).length > 0);
});

test("Missing fields block completeness confirmation", () => {
  assert.ok(validateReview({
    ...base,
    missingFields: 2,
  }).length > 0);
});

test("Paper evidence supports assisted human review", () => {
  assert.deepEqual(validateReview({
    ...base,
    evidenceFormat: "paper",
    action: "request-paper-review",
    route: "ASSIST_PAPER",
  }), []);
});

test("A reviewer may override the suggested route", () => {
  assert.deepEqual(validateReview({
    ...base,
    action: "unresolved",
    route: "CONTACT_SUPPLIER",
  }), []);
});

test("Short review reasons are rejected", () => {
  assert.ok(validateReview({
    ...base,
    reason: "No",
  }).length > 0);
});

test("Overlong review reasons are rejected", () => {
  assert.ok(validateReview({
    ...base,
    reason: "x".repeat(281),
  }).length > 0);
});
