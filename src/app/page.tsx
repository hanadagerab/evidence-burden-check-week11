"use client";

import { useCallback, useState } from "react";
import { safeNumericValue } from "@/lib/numeric-input";
import { getWorkerGuidance } from "@/lib/worker-guidance";
import {
  EVIDENCE_DISCLAIMER,
  exportJSON,
  exportCSV,
  type AssessmentExport,
} from "@/lib/export";
import {
  allocateSupport,
  supportOptions,
  type SupportRoute,
} from "@/lib/support";
import {
  validateReview,
  type ReviewAction,
} from "@/lib/review";
import { predictBurden, type MLAssessment } from "@/lib/ml";
import {
  compareWeights,
  initialReceiptKg,
  simulatedReading,
} from "@/lib/sensor";
import {
  calculateMonthlyHours,
  demoCases,
  type DemoCase,
  type DigitalAccess,
  type EvidenceFormat,
} from "@/lib/cases";

export default function Home() {
  const [selected, setSelected] = useState<DemoCase>({ ...demoCases[0] });
  const [errors, setErrors] = useState<string[]>([]);
  const [reviewAction, setReviewAction] =
    useState<ReviewAction>("unresolved");
  const [reviewRoute, setReviewRoute] =
    useState<SupportRoute>("ASSIST_PAPER");
  const [reviewReason, setReviewReason] = useState("");
  const [workerLanguage, setWorkerLanguage] =
    useState<"es" | "en">("es");
  const [reviewErrors, setReviewErrors] = useState<string[]>([]);
  const [reviewDecision, setReviewDecision] = useState<{
    action: ReviewAction;
    route: SupportRoute;
    reason: string;
  } | null>(null);
  const [sequence, setSequence] = useState(0);
  const [receiptKg, setReceiptKg] = useState<number>(
    initialReceiptKg(demoCases[0].id)
  );

  const reading = simulatedReading(selected.id, sequence);
  const validReceipt =
    Number.isFinite(receiptKg) &&
    receiptKg >= 0 &&
    receiptKg <= 20000;

  const comparison = validReceipt
    ? compareWeights(reading.kg, receiptKg)
    : null;
  const [assessment, setAssessment] = useState<{
    monthlyHours: number;
    paperReview: boolean;
    needsClarification: boolean;
    weightConflict: boolean;
    ml: MLAssessment | null;
    support: ReturnType<typeof allocateSupport>;
  } | null>(null);

  function selectCase(item: DemoCase) {
    setSelected({ ...item });
    setSequence(0);
    setReceiptKg(initialReceiptKg(item.id));
    setAssessment(null);
    setReviewDecision(null);
    setReviewErrors([]);
    setErrors([]);
  }

  function update<K extends keyof DemoCase>(key: K, value: DemoCase[K]) {
    setSelected((previous) => ({ ...previous, [key]: value }));
    setAssessment(null);
    setReviewDecision(null);
    setReviewErrors([]);
    setErrors([]);
  }

  function replaySensor() {
    setSequence((previous) => previous + 1);
    setAssessment(null);
    setReviewDecision(null);
    setReviewErrors([]);
    setErrors([]);
  }

  function assess() {
    const nextErrors: string[] = [];

    if (!Number.isFinite(selected.weeklyHours) ||
        selected.weeklyHours < 0 || selected.weeklyHours > 40) {
      nextErrors.push("Weekly documentation hours must be between 0 and 40.");
    }

    if (!Number.isFinite(selected.extraCostMxn) ||
        selected.extraCostMxn < 0 || selected.extraCostMxn > 10000) {
      nextErrors.push("Monthly additional cost must be between MXN 0 and 10,000.");
    }

    if (!Number.isInteger(selected.missingFields) ||
        selected.missingFields < 0 || selected.missingFields > 10) {
      nextErrors.push("Missing fields must be a whole number between 0 and 10.");
    }

    if (!validReceipt) {
      nextErrors.push(
        "Receipt weight must be between 0 and 20,000 kg."
      );
    }

    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      setAssessment(null);
    setReviewDecision(null);
    setReviewErrors([]);
      return;
    }

    let ml: MLAssessment | null = null;

    try {
      ml = predictBurden({
        weeklyHours: selected.weeklyHours,
        extraCostMxn: selected.extraCostMxn,
        missingFields: selected.missingFields,
        paperOnly: selected.evidenceFormat === "paper" ? 1 : 0,
        noDigitalAccess: selected.digitalAccess === "no" ? 1 : 0,
        weightConflict: comparison?.conflict ? 1 : 0,
      });
    } catch (error) {
      console.error("Synthetic ML inference unavailable:", error);
    }

    const support = allocateSupport({
      evidenceFormat: selected.evidenceFormat,
      digitalAccess: selected.digitalAccess,
      missingFields: selected.missingFields,
      weightConflict: comparison?.conflict ?? false,
      weeklyHours: selected.weeklyHours,
    });

    setReviewAction("unresolved");
    setReviewRoute(support.recommendedRoute);
    setReviewReason("");
    setReviewDecision(null);
    setReviewErrors([]);

    setAssessment({
      support,
      ml,
      monthlyHours: calculateMonthlyHours(selected.weeklyHours),
      weightConflict: comparison?.conflict ?? false,
      paperReview: selected.evidenceFormat === "paper",
      needsClarification: selected.missingFields > 0 ||
        selected.evidenceFormat === "none",
    });
  }

  function saveReview() {
    if (!assessment) return;

    const errors = validateReview({
      action: reviewAction,
      route: reviewRoute,
      reason: reviewReason,
      evidenceFormat: selected.evidenceFormat,
      missingFields: selected.missingFields,
      weightConflict: assessment.weightConflict,
    });

    setReviewErrors(errors);
    setReviewDecision(null);

    if (errors.length > 0) return;

    setReviewDecision({
      action: reviewAction,
      route: reviewRoute,
      reason: reviewReason.trim(),
    });
  }

  const downloadAssessment = useCallback((format: "json" | "csv") => {
    if (!assessment || !comparison || !validReceipt) {
      return;
    }

    const recorded = reviewDecision !== null;

    const documentationStatus = assessment.paperReview
      ? "PAPER_REVIEW"
      : assessment.weightConflict
        ? "CONFLICTING"
        : assessment.needsClarification
          ? "MISSING"
          : "COMPLETE_DEMO";

    const data: AssessmentExport = {
      assessmentId: `DEMO-${selected.id}-${Date.now()}`,
      assessmentTimestamp: new Date().toISOString(),
      scenarioId: selected.id,
      source: "SYNTHETIC_DEMO",
      actorType: selected.actor,

      weeklyHours: selected.weeklyHours,
      monthlyHours: assessment.monthlyHours,
      extraCostMxn: selected.extraCostMxn,
      missingFields: selected.missingFields,
      evidenceFormat: selected.evidenceFormat,
      digitalAccess: selected.digitalAccess,

      sensorReadingId: reading.readingId,
      sensorDeviceId: reading.deviceId,
      sensorSource: "SIMULATED",
      sensorTimestamp: reading.timestamp,
      sensorKg: reading.kg,
      sensorUncertaintyKg: reading.uncertaintyKg,
      receiptKg,
      weightDifferenceKg: comparison.differenceKg,
      weightConflict: assessment.weightConflict,

      modelVersion: assessment.ml?.modelVersion ?? "UNAVAILABLE",
      mlScore: assessment.ml?.score ?? null,
      mlInterpretation:
        assessment.ml?.limitation ??
        "Model unavailable; human review remains required.",

      paperReviewRequired: assessment.paperReview,
      documentationStatus,
      recoveryStatus: "NOT_VERIFIED",
      workerPaymentStatus: "NOT_VERIFIED",
      legalComplianceStatus: "NOT_ASSESSED",

      recommendedSupportRoute: assessment.support.recommendedRoute,
      supportPriority: assessment.support.priority,
      supportCapacityStatus: assessment.support.status,
      supportSource: "SIMULATED_CAPACITY",

      reviewAction: recorded ? reviewDecision.action : null,
      reviewRoute: recorded ? reviewDecision.route : null,
      reviewReason: recorded ? reviewDecision.reason : null,
      exportStatus: recorded ? "REVIEW_RECORDED" : "DRAFT",

      disclaimer: EVIDENCE_DISCLAIMER,
    };

    try {
      const contents =
        format === "json" ? exportJSON(data) : exportCSV(data);

      const blob = new Blob([contents], {
        type: format === "json"
          ? "application/json;charset=utf-8"
          : "text/csv;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `evidence-burden-${selected.id.toLowerCase()}.${format}`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Assessment export failed:", error);
      window.alert(
        "Export could not be generated. Check the assessment and try again."
      );
    }
  }, [
    assessment,
    comparison,
    validReceipt,
    reviewDecision,
    selected,
    reading,
    receiptKg,
  ]);

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

  return (
    <main className="min-h-screen bg-[#f4f7f7] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Team 8 · Week 11 · USER
            </p>
            <h1 className="text-2xl font-bold tracking-tight">
              Evidence Burden Check
            </h1>
          </div>
          <span className="rounded-full bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-800">
            SYNTHETIC RESEARCH DEMO
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
          <strong>DEMO — All cases and readings are simulated.</strong>
          {" "}This tool does not certify recycling, worker payment,
          environmental impact, or EPR legal compliance.
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
            Human consequences of documentation
          </p>
          <h2 className="max-w-3xl text-3xl font-bold tracking-tight md:text-4xl">
            Better packaging records should not hide who carries the burden.
          </h2>
          <p className="max-w-3xl leading-relaxed text-slate-600">
            Explore who benefits from a cleaner compliance workflow,
            who performs extra paperwork, and who may need support
            instead of exclusion.
          </p>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-xl font-bold">01 / Select a synthetic case</h3>
            <p className="text-sm text-slate-500">
              Three fictional examples. No personal information required.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {demoCases.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectCase(item)}
                aria-pressed={selected.id === item.id}
                className={`rounded-2xl border p-5 text-left transition hover:border-teal-500 ${
                  selected.id === item.id
                    ? "border-teal-600 bg-teal-50 shadow-sm"
                    : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-xs font-bold text-teal-700">
                  {item.id}
                </span>
                <h4 className="mt-3 text-lg font-bold">{item.name}</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">
                02 / Simulated scale observation
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Repeatable synthetic sensor samples. No physical device connected.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-900">
              SIMULATED · NOT LIVE
            </span>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">Scale observation</p>
              <p className="mt-2 text-3xl font-bold">
                {reading.kg.toFixed(1)} kg
              </p>
              <p className="mt-2 text-xs text-slate-600">
                Illustrative uncertainty: ±{reading.uncertaintyKg} kg
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p><strong>Source:</strong> {reading.source}</p>
              <p><strong>Device:</strong> {reading.deviceId}</p>
              <p><strong>Reading:</strong> {reading.readingId}</p>
              <p><strong>Example time:</strong> {reading.timestamp}</p>
            </div>

            <div>
              <label htmlFor="receipt-weight" className="text-sm font-medium">
                Synthetic receipt weight (kg)
              </label>
              <input
                id="receipt-weight"
                type="number"
                min="0"
                max="20000"
                step="0.1"
                className={fieldClass + " mt-2"}
                value={Number.isNaN(receiptKg) ? "" : receiptKg}
                onChange={(event) => {
                  setReceiptKg(event.target.valueAsNumber);
                  setAssessment(null);
    setReviewDecision(null);
    setReviewErrors([]);
                  setErrors([]);
                }}
              />
              <button
                type="button"
                onClick={replaySensor}
                className="mt-3 w-full rounded-xl border border-teal-700 px-4 py-3 text-sm font-semibold text-teal-800 hover:bg-teal-50"
              >
                Replay next simulated sample
              </button>
            </div>
          </div>

          {comparison && (
            <div
              role="status"
              className={`mt-5 rounded-xl p-4 text-sm ${
                comparison.conflict
                  ? "bg-amber-50 text-amber-950"
                  : "bg-teal-50 text-teal-950"
              }`}
            >
              <strong>
                {comparison.conflict
                  ? "RECONCILIATION NEEDED"
                  : "No discrepancy above demo threshold"}
              </strong>
              <p className="mt-1">
                Difference: {comparison.differenceKg.toFixed(1)} kg.
                Demo-only warning threshold:{" "}
                {comparison.thresholdKg.toFixed(1)} kg.
              </p>
              <p className="mt-2">
                Scale observation only: material recovery has not
                been verified. A discrepancy is not evidence of fraud.
              </p>
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">03 / Documentation workload</h3>
            <p className="mt-2 text-sm text-slate-500">
              Edit the synthetic inputs and run a transparent assessment.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>Additional documentation hours / week</span>
                <input
                  type="number"
                  min="0"
                  max="40"
                  step="0.5"
                  className={fieldClass}
                  value={safeNumericValue(selected.weeklyHours)}
                  onChange={(e) =>
                    update("weeklyHours", e.target.valueAsNumber)
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span>Additional monthly cost (MXN)</span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="1"
                  className={fieldClass}
                  value={safeNumericValue(selected.extraCostMxn)}
                  onChange={(e) =>
                    update("extraCostMxn", e.target.valueAsNumber)
                  }
                />
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span>Evidence format</span>
                <select
                  className={fieldClass}
                  value={selected.evidenceFormat}
                  onChange={(e) =>
                    update("evidenceFormat", e.target.value as EvidenceFormat)
                  }
                >
                  <option value="paper">Paper receipts</option>
                  <option value="mixed">Paper and digital</option>
                  <option value="digital">Digital documents</option>
                  <option value="none">No documentation available</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span>Digital access</span>
                <select
                  className={fieldClass}
                  value={selected.digitalAccess}
                  onChange={(e) =>
                    update("digitalAccess", e.target.value as DigitalAccess)
                  }
                >
                  <option value="yes">Reliable access</option>
                  <option value="limited">Limited access</option>
                  <option value="no">No digital access</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium sm:col-span-2">
                <span>Missing documentation fields</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="1"
                  className={fieldClass}
                  value={safeNumericValue(selected.missingFields)}
                  onChange={(e) =>
                    update("missingFields", e.target.valueAsNumber)
                  }
                />
              </label>
            </div>

            {errors.length > 0 && (
              <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                {errors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={assess}
              className="mt-6 w-full rounded-xl bg-teal-800 px-5 py-4 font-semibold text-white transition hover:bg-teal-900"
            >
              Check documentation burdens →
            </button>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">04 / Assessment</h3>

              {!assessment ? (
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-sm leading-relaxed text-slate-500">
                  Complete the inputs and select
                  {" "}<strong>Check documentation burdens</strong>
                  {" "}to generate your assessment.
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  <div className="rounded-xl bg-teal-50 p-5">
                    <p className="text-sm font-medium text-teal-800">
                      Estimated additional administration
                    </p>
                    <p className="mt-2 text-4xl font-bold text-teal-950">
                      {assessment.monthlyHours}
                      <span className="ml-2 text-base font-medium">hours / month</span>
                    </p>
                    <p className="mt-2 text-xs text-teal-800">
                      Weekly hours × 52 ÷ 12. Synthetic estimate.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Additional monthly cost</p>
                    <p className="mt-1 text-2xl font-bold">
                      MXN {selected.extraCostMxn.toLocaleString("en-US")}
                    </p>
                    <p className="text-xs text-slate-500">
                      User-entered synthetic amount, not a verified loss.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold">
                        ML documentation-support advisory
                      </h4>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                        SYNTHETIC MODEL
                      </span>
                    </div>

                    {assessment.ml ? (
                      <div className="mt-4 space-y-3">
                        <p className="text-3xl font-bold text-teal-900">
                          {(assessment.ml.score * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-slate-500">
                          Synthetic model score — NOT a real-world probability
                          of harm, exclusion, or recycling.
                        </p>
                        <p className="text-sm font-semibold">
                          {assessment.ml.suggestedSupportNeed
                            ? "Additional documentation assistance suggested"
                            : "No additional assistance suggested by ML"}
                        </p>

                        <div className="text-sm leading-relaxed text-slate-700">
                          <p className="font-semibold">Model inputs:</p>
                          <p>Weekly hours: {selected.weeklyHours}</p>
                          <p>Monthly cost: MXN {selected.extraCostMxn}</p>
                          <p>Missing fields: {selected.missingFields}</p>
                          <p>Paper only: {selected.evidenceFormat === "paper" ? "Yes" : "No"}</p>
                          <p>No digital access: {selected.digitalAccess === "no" ? "Yes" : "No"}</p>
                          <p>Weight conflict: {assessment.weightConflict ? "Yes" : "No"}</p>
                        </div>

                        <p className="text-xs text-slate-500">
                          Model: {assessment.ml.modelVersion}.
                          Trained on 600 synthetic examples; evaluated on
                          150 held-out synthetic examples.
                        </p>
                        <p className="text-sm text-slate-700">
                          {assessment.ml.limitation}
                        </p>

                        {assessment.ml.suggestedSupportNeed !==
                          (assessment.paperReview ||
                           assessment.needsClarification ||
                           assessment.weightConflict ||
                           selected.digitalAccess === "no") && (
                          <p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
                            MODEL / RULE DISAGREEMENT — HUMAN REVIEW.
                            Deterministic safeguards take precedence.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p role="status" className="mt-3 text-sm text-amber-900">
                        ML unavailable. Deterministic checks still work.
                        Human review remains available.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-bold text-teal-950">
                        Suggested documentation support
                      </h4>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-900">
                        PRIORITY {assessment.support.priority}
                      </span>
                    </div>

                    <p className="mt-3 text-lg font-bold text-teal-950">
                      {assessment.support.name}
                    </p>

                    <p className="mt-2 text-sm leading-relaxed text-teal-900">
                      {assessment.support.explanation}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs text-slate-500">
                          Simulated review time
                        </p>
                        <p className="text-lg font-bold">
                          {assessment.support.estimatedMinutes} minutes
                        </p>
                      </div>

                      <div className="rounded-lg bg-white p-3">
                        <p className="text-xs text-slate-500">
                          Simulated capacity
                        </p>
                        <p className="text-lg font-bold">
                          {assessment.support.availableSlots} slots
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm font-semibold text-teal-950">
                      {assessment.support.status === "SLOT_AVAILABLE"
                        ? "SIMULATED SLOT AVAILABLE"
                        : "WAITING FOR SIMULATED CAPACITY"}
                    </p>

                    <p className="mt-2 text-xs leading-relaxed text-teal-800">
                      {assessment.support.disclaimer}
                      {" "}A human reviewer must determine the next action.
                      No case is automatically rejected.
                    </p>
                  </div>

                  {assessment.weightConflict && (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
                      <strong>WEIGHT CONFLICT — HUMAN REVIEW.</strong>
                      {" "}Preserve the simulated observation and
                      synthetic receipt value for reconciliation.
                    </div>
                  )}

                  {assessment.paperReview && (
                    <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
                      <strong>NEEDS HUMAN REVIEW.</strong>
                      {" "}Paper evidence is eligible for review.
                      It must never trigger automatic exclusion.
                    </div>
                  )}

                  {assessment.needsClarification && (
                    <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
                      <strong>INFORMATION INCOMPLETE.</strong>
                      {" "}Request clarification without inferring misconduct.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-slate-900 p-6 text-white">
              <h3 className="text-lg font-bold">Evidence boundaries</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>Documentation: synthetic and not independently verified.</p>
                <p>Material recovery: NOT VERIFIED.</p>
                <p>Worker payment: NOT VERIFIED.</p>
                <p>Legal compliance: NOT ASSESSED.</p>
                <p>ML assessment: SYNTHETIC ADVISORY ONLY; NOT REAL-WORLD VALIDATED.</p>
                <p>Scale feed: SIMULATED OBSERVATIONS ONLY.</p>
              </div>
            </div>
          </div>
        </section>

        {assessment && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div
              aria-labelledby="worker-next-step-title"
              className="mb-8 rounded-2xl border-2 border-teal-700 bg-teal-50 p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-900">
                  {workerLanguage === "es"
                    ? "Para trabajadores — solo demostración"
                    : "For workers — demonstration only"}
                </p>

                <div
                  role="group"
                  aria-label="Worker guidance language / Idioma"
                  className="flex gap-2"
                >
                  <button
                    type="button"
                    lang="es"
                    aria-pressed={workerLanguage === "es"}
                    onClick={() => setWorkerLanguage("es")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      workerLanguage === "es"
                        ? "bg-teal-900 text-white"
                        : "border border-teal-800 bg-white text-teal-900"
                    }`}
                  >
                    Español
                  </button>
                  <button
                    type="button"
                    lang="en"
                    aria-pressed={workerLanguage === "en"}
                    onClick={() => setWorkerLanguage("en")}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                      workerLanguage === "en"
                        ? "bg-teal-900 text-white"
                        : "border border-teal-800 bg-white text-teal-900"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div lang={workerLanguage}>
                <h3
                  id="worker-next-step-title"
                  className="mt-4 text-xl font-bold text-teal-950"
                >
                  {workerLanguage === "es"
                    ? "¿Qué sigue?"
                    : "What happens next?"}
                </h3>

                <p className="mt-3 font-semibold text-teal-950">
                  {getWorkerGuidance(
                    assessment.support.recommendedRoute,
                    selected.evidenceFormat,
                    workerLanguage
                  ).heading}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-slate-800">
                  {getWorkerGuidance(
                    assessment.support.recommendedRoute,
                    selected.evidenceFormat,
                    workerLanguage
                  ).nextStep}
                </p>

                <p className="mt-3 text-sm leading-relaxed text-slate-800">
                  <strong>
                    {workerLanguage === "es"
                      ? "Tiempo estimado de revisión:"
                      : "Estimated review time:"}
                  </strong>{" "}
                  {assessment.support.estimatedMinutes}{" "}
                  {workerLanguage === "es"
                    ? "minutos en este ejemplo simulado."
                    : "minutes in this simulated example."}
                </p>

                <div className="mt-4 rounded-xl bg-white p-4">
                  <p className="text-sm font-bold text-slate-900">
                    {workerLanguage === "es"
                      ? "¿Quién hace el papeleo adicional?"
                      : "Who does the extra paperwork?"}
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {getWorkerGuidance(
                      assessment.support.recommendedRoute,
                      selected.evidenceFormat,
                      workerLanguage
                    ).workerResponsibility}
                  </p>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-800">
                  <strong>
                    {workerLanguage === "es"
                      ? "Lo que todavía no está disponible:"
                      : "What is not available:"}
                  </strong>{" "}
                  {workerLanguage === "es"
                    ? "Esta demostración no ofrece revisores reales, citas, pagos ni compensación. Los espacios de atención que aparecen son simulados."
                    : "No real reviewer, appointment, payment, or compensation is provided by this prototype. Any support capacity shown is simulated."}
                </p>

                <p className="mt-3 text-xs leading-relaxed text-teal-900">
                  {workerLanguage === "es"
                    ? "El porcentaje del modelo es una estimación experimental con datos inventados. No evalúa tu honestidad, no determina si tienes derecho a recibir ayuda y no reemplaza la revisión humana."
                    : "The ML score is an experimental estimate from synthetic data. It does not judge your reliability, determine your eligibility, or override human review."}
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold">
              05 / For reviewers only — human review and support decision
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Review the evidence and record a human decision.
              Suggested capacity is simulated; no real support is booked.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">
                <span>Review action</span>
                <select
                  className={fieldClass}
                  value={reviewAction}
                  onChange={(event) => {
                    setReviewAction(event.target.value as ReviewAction);
                    setReviewDecision(null);
                  }}
                >
                  <option value="unresolved">Leave unresolved</option>
                  <option value="request-paper-review">
                    Request assisted paper review
                  </option>
                  <option value="request-clarification">
                    Request clarification
                  </option>
                  <option value="document-complete">
                    Confirm demo documentation completeness
                  </option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium">
                <span>Support route</span>
                <select
                  className={fieldClass}
                  value={reviewRoute}
                  onChange={(event) => {
                    setReviewRoute(event.target.value as SupportRoute);
                    setReviewDecision(null);
                  }}
                >
                  {supportOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-5 block space-y-2 text-sm font-medium">
              <span>Reason for review decision (10–280 characters)</span>
              <textarea
                className={fieldClass}
                rows={3}
                maxLength={280}
                value={reviewReason}
                onChange={(event) => {
                  setReviewReason(event.target.value);
                  setReviewDecision(null);
                }}
                placeholder="Explain the evidence and why this action is appropriate."
              />
            </label>

            {reviewErrors.length > 0 && (
              <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                {reviewErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={saveReview}
              className="mt-5 rounded-xl bg-teal-800 px-6 py-3 font-semibold text-white hover:bg-teal-900"
            >
              Record human review decision
            </button>

            {reviewDecision && (
              <div role="status" className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-5">
                <p className="font-bold text-teal-950">
                  REVIEW DECISION RECORDED — SYNTHETIC DEMO
                </p>
                <p className="mt-2 text-sm">
                  Action: {reviewDecision.action}
                </p>
                <p className="text-sm">
                  Route: {reviewDecision.route}
                </p>
                <p className="mt-2 text-sm">
                  Reason: {reviewDecision.reason}
                </p>
                <p className="mt-3 text-xs text-teal-800">
                  This decision is held only in the current browser session.
                  It does not certify recycling, worker payment,
                  or legal compliance.
                </p>
              </div>
            )}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h4 className="text-lg font-bold">
                06 / Download assessment evidence
              </h4>

              <p className="mt-2 text-sm text-slate-600">
                Download the current synthetic assessment with its
                sensor provenance, ML version, support recommendation,
                evidence limitations and reviewer decision.
              </p>

              <p className="mt-3 text-sm font-semibold text-slate-800">
                Export status:{" "}
                {reviewDecision ? "REVIEW RECORDED" : "DRAFT — no reviewer decision"}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => downloadAssessment("json")}
                  className="rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900"
                >
                  Download JSON
                </button>

                <button
                  type="button"
                  onClick={() => downloadAssessment("csv")}
                  className="rounded-xl border border-teal-800 bg-white px-5 py-3 font-semibold text-teal-900 hover:bg-teal-50"
                >
                  Download CSV
                </button>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                These files contain synthetic demonstration data only.
                They do not certify recycling, environmental impact,
                worker payment or legal compliance.
              </p>
            </div>
          </section>
        )}

        <footer className="border-t border-slate-200 py-6 text-xs text-slate-500">
          Evidence Burden Check · Team 8 · Condition 5: Human Consequences
          · Chapter 10: Dreaming of Plenitude
        </footer>
      </div>
    </main>
  );
}
