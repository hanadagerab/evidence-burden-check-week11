export type SupportRoute =
  | "ASSIST_PAPER"
  | "CONTACT_SUPPLIER"
  | "HUMAN_EXCEPTION";

export type SupportStatus =
  | "SLOT_AVAILABLE"
  | "WAITING_FOR_CAPACITY";

export type SupportInputs = {
  evidenceFormat: "paper" | "mixed" | "digital" | "none";
  digitalAccess: "yes" | "limited" | "no";
  missingFields: number;
  weightConflict: boolean;
  weeklyHours: number;
};

export type SupportOption = {
  id: SupportRoute;
  name: string;
  availableSlots: number;
  estimatedMinutes: number;
  description: string;
};

export const supportOptions: SupportOption[] = [
  {
    id: "ASSIST_PAPER",
    name: "Assisted paper review",
    availableSlots: 1,
    estimatedMinutes: 30,
    description:
      "Help a human reviewer examine nondigital evidence.",
  },
  {
    id: "CONTACT_SUPPLIER",
    name: "Supplier clarification",
    availableSlots: 1,
    estimatedMinutes: 20,
    description:
      "Request missing information or reconcile conflicting records.",
  },
  {
    id: "HUMAN_EXCEPTION",
    name: "Human exception review",
    availableSlots: 0,
    estimatedMinutes: 25,
    description:
      "Review uncertainty or a case needing contextual judgment.",
  },
];

export function allocateSupport(
  inputs: SupportInputs,
  capacity: readonly SupportOption[] = supportOptions
) {
  if (
    !["paper", "mixed", "digital", "none"].includes(
      inputs.evidenceFormat
    ) ||
    !["yes", "limited", "no"].includes(inputs.digitalAccess) ||
    !Number.isInteger(inputs.missingFields) ||
    inputs.missingFields < 0 ||
    inputs.missingFields > 10 ||
    typeof inputs.weightConflict !== "boolean" ||
    !Number.isFinite(inputs.weeklyHours) ||
    inputs.weeklyHours < 0 ||
    inputs.weeklyHours > 40
  ) {
    throw new Error("Invalid support allocation inputs");
  }

  let route: SupportRoute;
  let priority: number;
  let explanation: string;

  if (inputs.evidenceFormat === "paper") {
    route = "ASSIST_PAPER";
    priority = 1;
    explanation =
      "Paper-only evidence creates a potential format barrier. " +
      "Prioritize assisted review, not exclusion.";
  } else if (
    inputs.weightConflict ||
    inputs.missingFields > 0 ||
    inputs.evidenceFormat === "none"
  ) {
    route = "CONTACT_SUPPLIER";
    priority = 2;
    explanation =
      "Missing or conflicting records require clarification. " +
      "No misconduct is inferred.";
  } else {
    route = "HUMAN_EXCEPTION";
    priority = 3;
    explanation =
      "No immediate documentation conflict was detected. " +
      "A human may still request further assistance.";
  }

  const option = capacity.find((item) => item.id === route);

  if (!option) {
    throw new Error("Required support route unavailable");
  }

  if (
    !Number.isInteger(option.availableSlots) ||
    option.availableSlots < 0 ||
    !Number.isFinite(option.estimatedMinutes) ||
    option.estimatedMinutes <= 0
  ) {
    throw new Error("Invalid simulated support capacity");
  }

  return {
    recommendedRoute: route,
    name: option.name,
    priority,
    explanation,
    estimatedMinutes: option.estimatedMinutes,
    availableSlots: option.availableSlots,
    status: option.availableSlots > 0
      ? "SLOT_AVAILABLE" as SupportStatus
      : "WAITING_FOR_CAPACITY" as SupportStatus,
    requiresHumanReview: true,
    automaticallyRejected: false,
    source: "SIMULATED_CAPACITY" as const,
    disclaimer:
      "Suggested review route only. No real service booked, " +
      "no payment guaranteed, and no compliance approval.",
  };
}
