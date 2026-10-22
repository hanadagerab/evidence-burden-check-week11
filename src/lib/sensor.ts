export type SensorReading = {
  readingId: string;
  deviceId: "DEMO_SCALE_01";
  source: "SIMULATED";
  kg: number;
  timestamp: string;
  uncertaintyKg: number;
};

type SensorCaseId = "PAPER-01" | "MIXED-02" | "DIGITAL-03";

const profiles: Record<SensorCaseId, {
  readings: number[];
  receiptKg: number;
}> = {
  "PAPER-01": {
    readings: [135, 135.2, 134.8],
    receiptKg: 135,
  },
  "MIXED-02": {
    readings: [90, 90.3, 89.9],
    receiptKg: 105,
  },
  "DIGITAL-03": {
    readings: [250, 250.2, 249.8],
    receiptKg: 250,
  },
};

export function initialReceiptKg(caseId: string): number {
  if (!(caseId in profiles)) {
    throw new Error("Unknown synthetic case");
  }
  return profiles[caseId as SensorCaseId].receiptKg;
}

export function simulatedReading(
  caseId: string,
  sequence: number
): SensorReading {
  if (!(caseId in profiles)) {
    throw new Error("Unknown synthetic case");
  }

  if (!Number.isInteger(sequence) || sequence < 0) {
    throw new Error("Invalid simulation sequence");
  }

  const profile = profiles[caseId as SensorCaseId];
  const kg = profile.readings[sequence % profile.readings.length];

  return {
    readingId: `${caseId}-SIM-${String(sequence + 1).padStart(3, "0")}`,
    deviceId: "DEMO_SCALE_01",
    source: "SIMULATED",
    kg,
    timestamp: new Date(
      Date.UTC(2026, 9, 21, 12, 0, sequence)
    ).toISOString(),
    uncertaintyKg: 0.5,
  };
}

export type WeightComparison = {
  differenceKg: number;
  thresholdKg: number;
  conflict: boolean;
};

export function compareWeights(
  readingKg: number,
  receiptKg: number
): WeightComparison {
  for (const value of [readingKg, receiptKg]) {
    if (!Number.isFinite(value) || value < 0 || value > 20000) {
      throw new Error("Weights must be between 0 and 20,000 kg");
    }
  }

  const differenceKg =
    Math.round(Math.abs(readingKg - receiptKg) * 100) / 100;

  const thresholdKg = Math.max(5, receiptKg * 0.05);

  return {
    differenceKg,
    thresholdKg,
    conflict: differenceKg > thresholdKg,
  };
}
