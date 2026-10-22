import assert from "node:assert/strict";
import { test } from "node:test";

import {
  allocateSupport,
  supportOptions,
} from "../src/lib/support.ts";

const base = {
  evidenceFormat: "digital" as const,
  digitalAccess: "yes" as const,
  missingFields: 0,
  weightConflict: false,
  weeklyHours: 1,
};

test("Paper-only evidence receives priority 1", () => {
  const result = allocateSupport({
    ...base,
    evidenceFormat: "paper",
    digitalAccess: "no",
  });

  assert.equal(result.priority, 1);
  assert.equal(result.recommendedRoute, "ASSIST_PAPER");
  assert.equal(result.requiresHumanReview, true);
  assert.equal(result.automaticallyRejected, false);
});

test("Conflicting weights require supplier clarification", () => {
  const result = allocateSupport({
    ...base,
    weightConflict: true,
  });

  assert.equal(result.recommendedRoute, "CONTACT_SUPPLIER");
  assert.equal(result.priority, 2);
});

test("Missing fields require clarification", () => {
  const result = allocateSupport({
    ...base,
    missingFields: 3,
  });

  assert.equal(result.recommendedRoute, "CONTACT_SUPPLIER");
});

test("Paper priority outranks a conflicting weight", () => {
  const result = allocateSupport({
    ...base,
    evidenceFormat: "paper",
    missingFields: 3,
    weightConflict: true,
  });

  assert.equal(result.recommendedRoute, "ASSIST_PAPER");
});

test("Complete digital records remain reviewable", () => {
  const result = allocateSupport(base);

  assert.equal(result.recommendedRoute, "HUMAN_EXCEPTION");
  assert.equal(result.requiresHumanReview, true);
  assert.equal(result.automaticallyRejected, false);
});

test("Zero capacity creates waiting status, not rejection", () => {
  const result = allocateSupport(base);

  assert.equal(result.status, "WAITING_FOR_CAPACITY");
  assert.equal(result.automaticallyRejected, false);
});

test("Paper records with zero capacity remain eligible", () => {
  const capacity = supportOptions.map((option) => ({
    ...option,
    availableSlots: 0,
  }));

  const result = allocateSupport({
    ...base,
    evidenceFormat: "paper",
    digitalAccess: "no",
  }, capacity);

  assert.equal(result.status, "WAITING_FOR_CAPACITY");
  assert.equal(result.requiresHumanReview, true);
  assert.equal(result.automaticallyRejected, false);
});

test("Invalid workload is rejected by input validation", () => {
  assert.throws(() =>
    allocateSupport({
      ...base,
      weeklyHours: -1,
    })
  );
});

test("Invalid simulated capacity is rejected", () => {
  const invalid = supportOptions.map((option) => ({
    ...option,
    availableSlots: -1,
  }));

  assert.throws(() => allocateSupport(base, invalid));
});
