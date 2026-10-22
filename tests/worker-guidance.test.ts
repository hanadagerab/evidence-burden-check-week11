import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getWorkerGuidance,
} from "../src/lib/worker-guidance.ts";

test("Paper case explains human review without digitization", () => {
  const guidance = getWorkerGuidance("ASSIST_PAPER", "paper");

  assert.match(guidance.heading, /paper receipts/i);
  assert.match(guidance.nextStep, /reviewer/i);
  assert.match(guidance.workerResponsibility, /do not need to digitize/i);
  assert.match(guidance.workerResponsibility, /reviewer decision form/i);
});

test("Conflicting records receive a human clarification path", () => {
  const guidance = getWorkerGuidance("CONTACT_SUPPLIER", "mixed");

  assert.match(guidance.heading, /clarify/i);
  assert.match(guidance.nextStep, /supplier/i);
  assert.match(guidance.workerResponsibility, /not being asked/i);
});

test("Digital case separates reviewer and worker responsibilities", () => {
  const guidance = getWorkerGuidance("HUMAN_EXCEPTION", "digital");

  assert.match(guidance.heading, /human review/i);
  assert.match(guidance.workerResponsibility, /not to the worker/i);
});

test("Spanish paper guidance does not require digital conversion", () => {
  const guidance = getWorkerGuidance("ASSIST_PAPER", "paper", "es");
  assert.match(guidance.heading, /recibos en papel/i);
  assert.match(guidance.workerResponsibility, /No necesitas/);
  assert.match(guidance.workerResponsibility, /formulario del revisor/);
});

test("Spanish supplier guidance assigns clarification responsibly", () => {
  const guidance = getWorkerGuidance("CONTACT_SUPPLIER", "mixed", "es");
  assert.match(guidance.nextStep, /organización responsable/);
  assert.match(guidance.workerResponsibility, /No tienes que/);
});

test("Spanish digital guidance separates reviewer tasks", () => {
  const guidance = getWorkerGuidance("HUMAN_EXCEPTION", "digital", "es");
  assert.match(guidance.workerResponsibility, /corresponde al revisor/);
});
