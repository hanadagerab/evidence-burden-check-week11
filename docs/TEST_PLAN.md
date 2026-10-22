# Evidence Burden Check — Mechanical Test Plan

## Scope

Test the synthetic Evidence Burden Check workflow against
the Week 11 Build Packet and Team 8 Blueprint.

All people, records, scale readings and model labels are synthetic.

## Test matrix

| ID | Test | Acceptance criterion |
|---|---|---|
| T01 | Home and case selection | Three synthetic cases load |
| T02 | Valid workload inputs | Estimates update correctly |
| T03 | Invalid numeric inputs | Rejected without NaN rendering |
| T04 | Invalid enums | Rejected by relevant logic |
| T05 | Simulated sensing | Source, kg, device and timestamp retained |
| T06 | Paper-only evidence | Human review, never automatic rejection |
| T07 | Weight discrepancy | Both values retained; warning displayed |
| T08 | Real ML inference | Python/TypeScript parity and model version |
| T09 | ML/rule disagreement | Both findings visible; human review |
| T10 | Support allocation | Priority, capacity and override work |
| T11 | JSON and CSV exports | Provenance, decisions and disclaimers retained |
| T12 | Mobile layout | Readable at narrow viewport |
| T13 | Accessibility | Labels, focus, keyboard and errors checked |
| T14 | Security | Input bounds, no secrets, safe CSV |
| T15 | Real bug cycle | Detect, fix, test, commit, redeploy |
| T16 | Persona test | Synthetic persona feedback and usability fix |

## Release-blocking conditions

- Paper-only evidence automatically rejected.
- Unsupported recovery or worker-payment claims.
- Invalid input produces an assessment.
- Model output misrepresented as field-validated.
- Exports omit provenance or evidence limitations.
- Reviewer decisions bypass required validation.

## Evidence standard

Automated tests, manual browser observations,
production HTTP checks and persona simulations
must be documented separately.

A compiled application is not equivalent to a
completed end-to-end browser test.
