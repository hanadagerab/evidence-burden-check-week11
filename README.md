# Evidence Burden Check

Week 11 Business Bending — Team 8
Role: USER
Chapter 10: Dreaming of Plenitude
Assigned condition: Human Consequences

## What this application does

Evidence Burden Check is a synthetic packaging-documentation
research prototype.

It explores who benefits from packaging reporting, who
performs additional administrative work, and who risks
exclusion because of documentation or digital barriers.

It does not certify recycling, worker payment,
environmental outcomes, or legal EPR compliance.

## Features

- Three synthetic packaging participant cases
- Editable documentation workload and cost inputs
- Reproducible simulated scale feed
- Receipt weight discrepancy checks
- Trained logistic-regression support-need advisory
- Transparent support matching and simulated capacity
- Human-review decisions with required explanations
- JSON and CSV assessment downloads
- Paper-friendly review and explicit evidence uncertainty

## DRAGON STACK

### Sensing

Simulated packaging-scale readings with timestamps,
units, reading IDs and provenance.

### Machine learning

Scikit-learn logistic regression trained on 600 synthetic
examples, using a fixed seed.

450 training examples and 150 held-out examples.

Inference runs in TypeScript using exported learned
coefficients and preprocessing values.

The model is not validated on real-world observations.

### Marketplace logic

Deterministic matching to three fictional support routes:

- Assisted paper review
- Supplier clarification
- Human exception review

Capacity is simulated and no service is actually booked.

## Local development

Requires Node.js and npm.

Run:

npm install
npm run dev

## Tests

Run:

node --test tests/*.test.ts

npm run lint
npx tsc --noEmit
npm run build

## Training

The training script is `ml/train.py`.

Training requires a compatible Python environment
with NumPy, SciPy and scikit-learn.

The exported model is stored in `src/lib/model.json`.

The website does not require Python at runtime.

## Deployment

https://evidence-burden-check-week11.vercel.app/

Deployment evidence is documented in
`docs/DEPLOY_LOG.md`.

## Evidence and limitations

All scenarios are fictional.

The model score represents a learned synthetic pattern,
not an established probability of human harm.

Paper records are never automatically excluded.

Human review is required for unresolved evidence.

See `docs/PACKET.md`, `docs/SECURITY.md`,
`docs/TEST_PLAN.md` and `docs/BUG_LOG.md`.
