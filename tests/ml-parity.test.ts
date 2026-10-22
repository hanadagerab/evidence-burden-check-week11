import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  predictBurden,
  type BurdenFeatures,
} from "../src/lib/ml.ts";

type Fixture = {
  inputs: BurdenFeatures;
  expectedScore: number;
};

const fixtures = JSON.parse(
  readFileSync("ml/parity-fixtures.json", "utf8")
) as Fixture[];

for (const [index, fixture] of fixtures.entries()) {
  test(`Python / TypeScript parity fixture ${index + 1}`, () => {
    const actual = predictBurden(fixture.inputs);
    const difference = Math.abs(
      actual.score - fixture.expectedScore
    );

    assert.ok(
      difference < 1e-10,
      `Prediction difference: ${difference}`
    );

    assert.equal(actual.modelVersion, "synthetic-burden-v1");
    assert.equal(actual.trainingSource, "SYNTHETIC");
  });
}

test("Same inputs produce the same prediction", () => {
  const first = predictBurden(fixtures[0].inputs);
  const second = predictBurden(fixtures[0].inputs);

  assert.equal(first.score, second.score);
});

test("Changing workload changes the model output", () => {
  const baseline = {
    weeklyHours: 1,
    extraCostMxn: 60,
    missingFields: 0,
    paperOnly: 0,
    noDigitalAccess: 0,
    weightConflict: 0,
  };

  const increased = {
    ...baseline,
    weeklyHours: 35,
    extraCostMxn: 9000,
    missingFields: 8,
  };

  assert.ok(
    predictBurden(increased).score >
      predictBurden(baseline).score
  );
});

test("Invalid numerical feature is rejected", () => {
  assert.throws(() =>
    predictBurden({
      ...fixtures[0].inputs,
      weeklyHours: Number.NaN,
    })
  );
});

test("Invalid binary feature is rejected", () => {
  assert.throws(() =>
    predictBurden({
      ...fixtures[0].inputs,
      paperOnly: 2,
    })
  );
});
