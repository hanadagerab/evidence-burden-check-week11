# Evidence Burden Check — Decision Log

## Project authority

- Builder: Hana Dager Abascal
- Team: 8
- Role: USER
- Chapter: 10 — Dreaming of Plenitude
- Primary vacuum: EPR-COMPLIANCE
- Assigned condition: 5 — Human Consequences
- Source of truth: docs/PACKET.md and Team 8 Blueprint

## D001 — Product scope

Build a working packaging-evidence burden assessment.

The application must identify beneficiaries, additional documentation
work, financial burdens, exclusion barriers, and support needs.

It must honor all six Blueprint conditions and the Shadow Clause.

## D002 — Technology

Use Next.js, TypeScript, Tailwind CSS, a simulated sensor feed,
a genuinely trained synthetic ML model, and transparent support
allocation logic.

Use free tools and minimize dependencies.

## D003 — Data and security

Use synthetic data only.

No authentication, database, personal records, or API keys
are required for this demonstration.

Validate inputs and protect exported CSV files.

## D004 — Evidence integrity

Simulated weight readings do not establish recycling.

Documentation completeness does not establish legal compliance.

ML suggestions do not establish real-world human harm.

Paper records must remain eligible for human review.

No informal collector may be automatically excluded.

## D005 — Development process

Use Mac Terminal exclusively.

Preserve the completed packet before implementation.

Make meaningful Git commits and verify each deployment.

Document real bugs and actual persona feedback.

## D006 — Planning asset preservation

The original Markdown packet and PDF are preserved.

Both Mermaid diagrams exist in the Markdown source.

Referenced image assets require verification or extraction
before the initial planning commit.

## Next action

Locate or extract the original visual assets, verify planning
documentation, and create the first planning-only Git commit.

## D007 — PDF visual recovery

Recovered original PDF pages 3–5 as PNG images.

Verified both standalone Mermaid files against the unchanged
packet source.

The original standalone mockup PNG and diagram SVGs were not
available locally. PDF page renderings are preserved with
explicit provenance rather than represented as original assets.

## Next action

Initialize the Next.js application after verifying this
planning-only commit. Implement the three synthetic case
presets and validated participant inputs first.

## D008 — Interactive foundation

Implemented Next.js 16.4.2 with React, TypeScript,
and Tailwind CSS.

Three synthetic cases and bounded documentation
inputs form the initial user journey.

The workload estimate uses:

monthlyHours = weeklyHours * 52 / 12

The interface separates estimated documentation
burdens from verified recovery, worker payment,
and legal compliance.

Four manual browser checks were confirmed by
the builder on 2026-10-21.

## D009 — Dependency review

The production-only npm audit reported zero
vulnerabilities at this checkpoint.

The full dependency audit reported five high-severity
findings in ESLint-related development dependencies.

No forced downgrade was performed.
The remaining advisories require continued review
before final release.

## Next action

Implement a reproducible simulated packaging-scale
feed with timestamps, weight units, source labels,
and weight-discrepancy warnings.

Verify the behavior through actual tests before
the first Vercel deployment.

## D010 — Simulated sensing

Implemented a deterministic synthetic packaging-scale feed.

Every reading includes a synthetic reading identifier,
device identifier, kg value, timestamp, SIMULATED source,
and illustrative measurement uncertainty.

The three demo cases use repeatable sensor sequences.

The system preserves the sensor observation separately
from the synthetic receipt weight.

A discrepancy warning appears when:

abs(sensorKg - receiptKg) > max(5, receiptKg * 0.05)

This is an invented prototype threshold, not an
environmental, measurement, or legal standard.

All five instructed sensing browser interactions were
confirmed as passing by the builder.

No recycling, payment, or compliance claim follows from
a simulated weight observation.

## Next action

Deploy the first functional application slice to Vercel.

Verify the production URL, record the deployment and
commit reference, and then implement the synthetic-trained
ML component with actual inference and tests.
