export const EVIDENCE_DISCLAIMER =
  "Synthetic research demonstration. Not evidence of recycling, " +
  "worker payment, environmental impact, or legal compliance.";

export type ExportValue = string | number | boolean | null;

export type AssessmentExport = {
  assessmentId: string;
  assessmentTimestamp: string;
  scenarioId: string;
  source: "SYNTHETIC_DEMO";
  actorType: string;

  weeklyHours: number;
  monthlyHours: number;
  extraCostMxn: number;
  missingFields: number;
  evidenceFormat: string;
  digitalAccess: string;

  sensorReadingId: string;
  sensorDeviceId: string;
  sensorSource: "SIMULATED";
  sensorTimestamp: string;
  sensorKg: number;
  sensorUncertaintyKg: number;
  receiptKg: number;
  weightDifferenceKg: number;
  weightConflict: boolean;

  modelVersion: string;
  mlScore: number | null;
  mlInterpretation: string;

  paperReviewRequired: boolean;
  documentationStatus: string;
  recoveryStatus: "NOT_VERIFIED";
  workerPaymentStatus: "NOT_VERIFIED";
  legalComplianceStatus: "NOT_ASSESSED";

  recommendedSupportRoute: string;
  supportPriority: number;
  supportCapacityStatus: string;
  supportSource: "SIMULATED_CAPACITY";

  reviewAction: string | null;
  reviewRoute: string | null;
  reviewReason: string | null;
  exportStatus: "DRAFT" | "REVIEW_RECORDED";

  disclaimer: string;
};

export function validateExport(
  data: AssessmentExport
): void {
  if (
    !data.assessmentId ||
    !data.scenarioId ||
    data.source !== "SYNTHETIC_DEMO" ||
    data.sensorSource !== "SIMULATED" ||
    data.supportSource !== "SIMULATED_CAPACITY"
  ) {
    throw new Error("Invalid assessment provenance");
  }

  const values = [
    data.weeklyHours,
    data.monthlyHours,
    data.extraCostMxn,
    data.missingFields,
    data.sensorKg,
    data.sensorUncertaintyKg,
    data.receiptKg,
    data.weightDifferenceKg,
    data.supportPriority,
  ];

  if (
    values.some((value) => !Number.isFinite(value)) ||
    (data.mlScore !== null && (
      !Number.isFinite(data.mlScore) ||
      data.mlScore < 0 ||
      data.mlScore > 1
    ))
  ) {
    throw new Error("Invalid assessment numeric values");
  }

  if (
    data.recoveryStatus !== "NOT_VERIFIED" ||
    data.workerPaymentStatus !== "NOT_VERIFIED" ||
    data.legalComplianceStatus !== "NOT_ASSESSED"
  ) {
    throw new Error("Unsupported evidence certification");
  }

  if (data.disclaimer !== EVIDENCE_DISCLAIMER) {
    throw new Error("Evidence disclaimer missing or altered");
  }

  if (
    data.exportStatus === "REVIEW_RECORDED" &&
    (
      !data.reviewAction ||
      !data.reviewRoute ||
      !data.reviewReason ||
      data.reviewReason.trim().length < 10
    )
  ) {
    throw new Error("Recorded review is incomplete");
  }

  if (
    data.exportStatus === "DRAFT" &&
    (
      data.reviewAction !== null ||
      data.reviewRoute !== null ||
      data.reviewReason !== null
    )
  ) {
    throw new Error("Draft must not claim a recorded decision");
  }
}

export function exportJSON(
  data: AssessmentExport
): string {
  validateExport(data);
  return JSON.stringify(data, null, 2) + "\n";
}

/**
 * CSV cells must not execute formulas in spreadsheet applications.
 * Prefix dangerous values with a single quote, then quote CSV fields.
 */
export function escapeCSVCell(value: ExportValue): string {
  if (value === null) return '""';

  let text = String(value);

  // Include whitespace and control characters preceding formulas.
  if (/^\s*[=+\-@]/u.test(text)) {
    text = "'" + text;
  }

  return '"' + text.replace(/"/g, '""') + '"';
}

export function exportCSV(
  data: AssessmentExport
): string {
  validateExport(data);

  const fields = Object.keys(data) as (
    keyof AssessmentExport
  )[];

  const header = fields
    .map((field) => escapeCSVCell(field))
    .join(",");

  const row = fields
    .map((field) => escapeCSVCell(data[field]))
    .join(",");

  return header + "\r\n" + row + "\r\n";
}
