# Evidence Burden Check — Bug Log

## BUG-001 — Invalid numeric input rendering

Status: FIX IMPLEMENTED — LOCAL RETEST PASSED; REDEPLOYMENT PENDING

### Detection

Detected during local browser testing on October 21, 2026.

The Next.js development log contains repeated browser errors:

`Received NaN for the value attribute.`

Original diagnostic evidence:
`docs/bug_evidence/BUG-001-before.log`

### Expected behavior

Users can clear and re-enter numeric documentation fields
without React rendering NaN into an HTML input.

An empty or invalid required value must produce a readable
validation message when the assessment is submitted.

### Actual behavior

The browser reported that React received NaN for an
HTML input value attribute.

### Suspected root cause

HTML number inputs return NaN from valueAsNumber
when cleared.

Some documentation inputs appear to pass the resulting
NaN directly into React-controlled value attributes.

This explanation must be verified against the source.

### Reproduction steps

1. Open the local development website.
2. Select PAPER-01.
3. Clear the documentation-hours field.
4. Observe the development console or log.
5. Repeat for monthly cost and missing-field count.

The original React error was preserved in the development log.
The source inspection confirmed that cleared documentation number
inputs could pass NaN directly into React value attributes.
The exact original browser actions were not individually recorded.

### Root cause and fix

Clearing an HTML number input makes valueAsNumber return NaN.
The original weekly-hours, monthly-cost and missing-fields
inputs passed that number directly to React's value attribute.

Added src/lib/numeric-input.ts with safeNumericValue(),
which renders nonfinite numbers as an empty string.
The submission validator still rejects invalid input.
The receipt-weight field already handled NaN and was preserved.

### Regression tests

tests/numeric-input.test.ts: four passing tests.
tests/ml-parity.test.ts: nine passing tests.

Total: 13 passed, 0 failed, on October 21, 2026.

### Retest evidence

The builder provided Safari screenshots showing all three
documentation numeric fields empty, correctly displayed
validation messages and no generated assessment.

The screenshot did not show a red Next.js issue indicator.
A fresh-session diagnostic-log comparison has not yet been
confirmed, so absence of every new warning remains unverified.

### Fix commit

PENDING.

### Redeployment reference

PENDING.
