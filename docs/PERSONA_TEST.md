# Evidence Burden Check — Synthetic Persona Test

## Research method

Screenshot-based fictional persona simulation.

This was not a real participant interview, field observation,
or validated usability study.

The persona reviewed screenshots of the application.
No real worker records or personal data were collected.

## Persona

Name: María (fictional)
Age: 46
Location: Iztapalapa, Mexico City
Work: Informal packaging collector

María keeps handwritten records and paper receipts,
has limited mobile data, and cannot afford additional
unpaid administrative work.

## Round 1 — Initial interface

### Initial understanding

María understood that the prototype estimates how much
time and money additional documentation can cost workers.

She did not understand who the application primarily
serves or what practical help she could obtain.

### Three prioritized problems

1. Critical — No actionable path to real assistance.
2. High — Technical language and potentially
   confusing ML/rule disagreement.
3. High — Reviewer responsibilities were not
   clearly separated from worker tasks.

### Initial verdict

María would not independently adopt the prototype
for real work.

The interface made paperwork costs visible but did
not provide an actual low-burden support process.

## Improvement 1 — Worker guidance

Implemented a "What happens next?" panel before
the reviewer decision form.

The panel explains:

- What a human reviewer would do.
- Why paper receipts remain reviewable.
- That digitization is not required for this demo.
- That workers do not complete the reviewer form.
- That the review time is simulated.
- That no real appointment, reviewer, payment,
  or compensation is available.
- That the synthetic ML score does not judge
  reliability or determine eligibility.

## Round 2 — Persona reassessment

María reported that the new panel made the purpose
of human review clearer and separated responsibilities
more effectively.

She understood that the ML percentage was not a
judgment of her honesty.

However, she still lacked a practical route to real
assistance.

### Remaining problems

1. High — No actual service or next action.
2. Medium — English-language interface.
3. Medium — Reviewer form still visually prominent.

## Improvement 2 — Bilingual accessibility

Implemented:

- Spanish worker guidance by default.
- Español / English toggle.
- Clear reviewer-only heading.
- Accessible language selection controls.
- Three additional automated language tests.

## Verification

Initial worker-guidance implementation:
42 automated tests passed.

Bilingual implementation:
45 automated tests passed.

TypeScript: PASS.
ESLint: PASS.
Production build: PASS.

Five manual bilingual browser checks:
PASS, as reported by the builder.

These checks covered:

- Spanish default.
- English toggle.
- Return to Spanish.
- Worker/reviewer separation.
- Narrow-screen readability.

## Before-and-after outcome

| Dimension | Before | After |
|---|---|---|
| Worker tasks | Unclear | Explicitly separated |
| Human review | Technical route | Explained in plain language |
| ML score | Potentially judgmental | Explicitly nonjudgmental |
| Support availability | Ambiguous | Identified as simulated |
| Language | English only | Bilingual worker panel |
| Real service | Unavailable | Still unavailable |

## Unresolved limitations

The prototype does not connect workers to real
reviewers, appointments, payment, or compensation.

The rest of the technical interface remains English.

No real participant has validated the design.

The second persona evaluation preceded the final
Spanish-language implementation, so it cannot establish
real-person usability of that later change.

## USER perspective and Chapter 10

The application illustrates the distinction between
technical visibility and genuine empowerment.

Measuring administrative burden is not the same as
removing it.

Human freedom requires practical access to assistance,
clear responsibility for paperwork, and protection
against shifting additional unpaid work onto
already vulnerable participants.

The prototype demonstrates an improved explanation,
not a verified reduction in real-world burden.
