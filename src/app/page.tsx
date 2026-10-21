"use client";

import { useState } from "react";
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
  const [assessment, setAssessment] = useState<{
    monthlyHours: number;
    paperReview: boolean;
    needsClarification: boolean;
  } | null>(null);

  function selectCase(item: DemoCase) {
    setSelected({ ...item });
    setAssessment(null);
    setErrors([]);
  }

  function update<K extends keyof DemoCase>(key: K, value: DemoCase[K]) {
    setSelected((previous) => ({ ...previous, [key]: value }));
    setAssessment(null);
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

    setErrors(nextErrors);

    if (nextErrors.length > 0) {
      setAssessment(null);
      return;
    }

    setAssessment({
      monthlyHours: calculateMonthlyHours(selected.weeklyHours),
      paperReview: selected.evidenceFormat === "paper",
      needsClarification: selected.missingFields > 0 ||
        selected.evidenceFormat === "none",
    });
  }

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

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold">02 / Documentation workload</h3>
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
                  value={selected.weeklyHours}
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
                  value={selected.extraCostMxn}
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
                  value={selected.missingFields}
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
              <h3 className="text-xl font-bold">03 / Assessment</h3>

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
                <p>ML assessment: NOT YET IMPLEMENTED.</p>
                <p>Scale feed: NOT YET IMPLEMENTED.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-6 text-xs text-slate-500">
          Evidence Burden Check · Team 8 · Condition 5: Human Consequences
          · Chapter 10: Dreaming of Plenitude
        </footer>
      </div>
    </main>
  );
}
