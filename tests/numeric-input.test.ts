import assert from "node:assert/strict";
import { test } from "node:test";

import {
  safeNumericValue,
} from "../src/lib/numeric-input.ts";

test("NaN renders as an empty string", () => {
  assert.equal(safeNumericValue(Number.NaN), "");
});

test("Positive finite numbers remain unchanged", () => {
  assert.equal(safeNumericValue(7), 7);
  assert.equal(safeNumericValue(450), 450);
});

test("Zero remains a valid displayed value", () => {
  assert.equal(safeNumericValue(0), 0);
});

test("Infinity cannot reach a numeric input", () => {
  assert.equal(safeNumericValue(Infinity), "");
  assert.equal(safeNumericValue(-Infinity), "");
});
