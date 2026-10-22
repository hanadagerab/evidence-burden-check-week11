import assert from "node:assert/strict";
import { test } from "node:test";

import {
  EVIDENCE_DISCLAIMER,
  escapeCSVCell,
  exportCSV,
  exportJSON,
  type AssessmentExport,
} from "../src/lib/export.ts";

const sample: AssessmentExport = {
  assessmentId: "DEMO-001",
  assessmentTimestamp: "2026-10-21T18:00:00.000Z",
  scenarioId: "PAPER-01",
  source: "SYNTHETIC_DEMO",
  actorType: "collector",

  weeklyHours: 7,
  monthlyHours: 30.3,
  extraCostMxn: 450,
  missingFields: 2,
  evidenceFormat: "paper",
  digitalAccess: "no",

  sensorReadingId: "PAPER-01-SIM-001",
  sensorDeviceId: "DEMO_SCALE_01",
  sensorSource: "SIMULATED",
  sensorTimestamp: "2026-10-21T12:00:00.000Z",
  sensorKg: 135,
  sensorUncertaintyKg: 0.5,
  receiptKg: 135,
  weightDifferenceKg: 0,
  weightConflict: false,

  modelVersion: "synthetic-burden-v1",
  mlScore: 0.361,
  mlInterpretation: "Synthetic advisory only",

  paperReviewRequired: true,
  documentationStatus: "PAPER_REVIEW",
  recoveryStatus: "NOT_VERIFIED",
  workerPaymentStatus: "NOT_VERIFIED",
  legalComplianceStatus: "NOT_ASSESSED",

  recommendedSupportRoute: "ASSIST_PAPER",
  supportPriority: 1,
  supportCapacityStatus: "SLOT_AVAILABLE",
  supportSource: "SIMULATED_CAPACITY",

  reviewAction: null,
  reviewRoute: null,
  reviewReason: null,
  exportStatus: "DRAFT",

  disclaimer: EVIDENCE_DISCLAIMER,
};

test("JSON exports valid assessment and provenance", () => {
  const parsed = JSON.parse(exportJSON(sample));

  assert.equal(parsed.sensorSource, "SIMULATED");
  assert.equal(parsed.source, "SYNTHETIC_DEMO");
  assert.equal(parsed.exportStatus, "DRAFT");
  assert.equal(parsed.recoveryStatus, "NOT_VERIFIED");
});

test("CSV contains model, sensing and review fields", () => {
  const csv = exportCSV(sample);

  assert.ok(csv.includes("modelVersion"));
  assert.ok(csv.includes("sensorReadingId"));
  assert.ok(csv.includes("reviewReason"));
  assert.ok(csv.includes("NOT_VERIFIED"));
});

test("CSV escapes formulas and dangerous prefixes", () => {
  for (const value of [
    "=1+1",
    "+SUM(1,2)",
    "-10+20",
    "@SUM(A1:A2)",
    "  =HYPERLINK(1)",
    "\t=2+2",
  ]) {
    assert.ok(escapeCSVCell(value).startsWith('"\''));
  }
});

test("CSV escapes embedded quotation marks", () => {
  assert.equal(
    escapeCSVCell('A "quoted" value'),
    '"A ""quoted"" value"'
  );
});

test("JSON preserves a recorded human decision", () => {
  const recorded: AssessmentExport = {
    ...sample,
    reviewAction: "request-paper-review",
    reviewRoute: "ASSIST_PAPER",
    reviewReason: "Human review requested for paper evidence.",
    exportStatus: "REVIEW_RECORDED",
  };

  const parsed = JSON.parse(exportJSON(recorded));

  assert.equal(
    parsed.reviewAction,
    "request-paper-review"
  );
  assert.equal(
    parsed.exportStatus,
    "REVIEW_RECORDED"
  );
});

test("Export rejects unsupported compliance claims", () => {
  assert.throws(() => exportJSON({
    ...sample,
    recoveryStatus: "VERIFIED" as "NOT_VERIFIED",
  }));
});

test("Export rejects nonfinite numeric values", () => {
  assert.throws(() => exportJSON({
    ...sample,
    weeklyHours: Number.NaN,
  }));
});

test("Recorded reviews require a reason", () => {
  assert.throws(() => exportJSON({
    ...sample,
    exportStatus: "REVIEW_RECORDED",
  }));
});

test("Draft cannot impersonate a recorded review", () => {
  assert.throws(() => exportJSON({
    ...sample,
    reviewAction: "unresolved",
  }));
});
