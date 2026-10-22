import model from "./model.json" with { type: "json" };

export type BurdenFeatures = {
  weeklyHours: number;
  extraCostMxn: number;
  missingFields: number;
  paperOnly: number;
  noDigitalAccess: number;
  weightConflict: number;
};

export type MLAssessment = {
  score: number;
  suggestedSupportNeed: boolean;
  modelVersion: string;
  trainingSource: "SYNTHETIC";
  limitation: string;
};

const featureNames = [
  "weeklyHours",
  "extraCostMxn",
  "missingFields",
  "paperOnly",
  "noDigitalAccess",
  "weightConflict",
] as const;

export function predictBurden(
  features: BurdenFeatures
): MLAssessment {
  if (
    model.featureNames.length !== featureNames.length ||
    model.coefficients.length !== featureNames.length
  ) {
    throw new Error("Invalid model artifact");
  }

  let logit = model.intercept;

  featureNames.forEach((feature, index) => {
    if (model.featureNames[index] !== feature) {
      throw new Error("Model feature schema mismatch");
    }

    const value = features[feature];

    if (!Number.isFinite(value)) {
      throw new Error(`Invalid ML feature: ${feature}`);
    }

    if (
      (feature === "paperOnly" ||
        feature === "noDigitalAccess" ||
        feature === "weightConflict") &&
      value !== 0 &&
      value !== 1
    ) {
      throw new Error(`Invalid binary ML feature: ${feature}`);
    }

    const normalized =
      (value - model.mean[index]) / model.scale[index];

    logit += normalized * model.coefficients[index];
  });

  const score = 1 / (1 + Math.exp(-logit));

  return {
    score,
    suggestedSupportNeed: score >= model.threshold,
    modelVersion: model.version,
    trainingSource: "SYNTHETIC",
    limitation:
      "Synthetic-model advisory. Not a real-world probability " +
      "of harm. Human judgment required.",
  };
}
