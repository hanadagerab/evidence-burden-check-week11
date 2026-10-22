import type { SupportRoute } from "./support";

export type ReviewAction =
  | "request-paper-review"
  | "request-clarification"
  | "document-complete"
  | "unresolved";

export type ReviewInput = {
  action: ReviewAction;
  route: SupportRoute;
  reason: string;
  evidenceFormat: "paper" | "mixed" | "digital" | "none";
  missingFields: number;
  weightConflict: boolean;
};

export function validateReview(input: ReviewInput): string[] {
  const errors: string[] = [];

  const validActions: ReviewAction[] = [
    "request-paper-review",
    "request-clarification",
    "document-complete",
    "unresolved",
  ];

  const validRoutes: SupportRoute[] = [
    "ASSIST_PAPER",
    "CONTACT_SUPPLIER",
    "HUMAN_EXCEPTION",
  ];

  if (!validActions.includes(input.action)) {
    errors.push("Select a valid review action.");
  }

  if (!validRoutes.includes(input.route)) {
    errors.push("Select a valid support route.");
  }

  const reason = input.reason.trim();

  if (reason.length < 10 || reason.length > 280) {
    errors.push("Review reason must contain 10–280 characters.");
  }

  const unresolvedEvidence =
    input.evidenceFormat === "paper" ||
    input.evidenceFormat === "none" ||
    input.missingFields > 0 ||
    input.weightConflict;

  if (input.action === "document-complete" && unresolvedEvidence) {
    errors.push(
      "Documentation cannot be marked complete while paper review, " +
      "missing evidence, or weight conflicts remain unresolved."
    );
  }

  if (
    input.action === "request-paper-review" &&
    input.evidenceFormat !== "paper" &&
    input.evidenceFormat !== "mixed"
  ) {
    errors.push(
      "Assisted paper review requires paper or mixed-format evidence."
    );
  }

  if (
    !Number.isInteger(input.missingFields) ||
    input.missingFields < 0 ||
    input.missingFields > 10 ||
    typeof input.weightConflict !== "boolean"
  ) {
    errors.push("Invalid evidence review inputs.");
  }

  return errors;
}
