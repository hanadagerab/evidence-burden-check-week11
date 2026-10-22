# Evidence Burden Check — Test Results

## Milestone 1 — Interactive foundation
Date: 2026-10-21
Environment: Local Next.js development server
Method: Manual browser interaction
Tester: Builder

### Reported passing checks

| ID | Scenario | Expected outcome | Result |
|---|---|---|---|
| M01 | PAPER-01 | 30.3 estimated hours/month and human-review warning | PASS — builder confirmed |
| M02 | MIXED-02 | 17.3 estimated hours/month | PASS — builder confirmed |
| M03 | DIGITAL-03 | 4.3 estimated hours/month | PASS — builder confirmed |
| M04 | Weekly hours = 41 | Validation error; no calculated assessment | PASS — builder confirmed |

### Scope and limitations

These results are based on the builder's confirmation
that all four instructed browser interactions worked.

No automated browser tests have been run yet.

Mobile responsiveness, sensor behavior, trained ML,
support allocation, exports, and security edge cases
have not yet been tested.

These checks demonstrate prototype functionality,
not real-world improvements in human outcomes.

## Milestone 2 — Simulated sensing
Date: 2026-10-21
Environment: Local browser / Next.js development server
Method: Manual browser interaction
Tester: Builder

| ID | Test | Result |
|---|---|---|
| S01 | PAPER-01 displays simulated 135 kg and permits human review | PASS — builder confirmed |
| S02 | MIXED-02 identifies 90 kg vs 105 kg discrepancy | PASS — builder confirmed |
| S03 | DIGITAL-03 shows consistent 250 kg records | PASS — builder confirmed |
| S04 | Replaying simulated feed changes sample and resets assessment | PASS — builder confirmed |
| S05 | Receipt weight above 20,000 kg is rejected | PASS — builder confirmed |

### Sensor integrity

- Device identifier: DEMO_SCALE_01
- Source: SIMULATED
- Units: kilograms
- Example timestamps: deterministic, not live acquisition
- Illustrative uncertainty: +/- 0.5 kg
- Warning threshold: greater than max(5 kg, 5% of receipt weight)
- The threshold is a demo rule, not a legal tolerance.

### Limitations

These five results were confirmed by the builder.
No automated sensor regression tests have been run yet.
The exact-threshold boundary case has not been confirmed.
No real hardware or physical measurement was used.
No material recovery, worker payment, or legal compliance was verified.
