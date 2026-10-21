export type EvidenceFormat = "paper" | "mixed" | "digital" | "none";
export type DigitalAccess = "yes" | "limited" | "no";
export type ActorType = "collector" | "supplier" | "producer";

export type DemoCase = {
  id: string;
  name: string;
  actor: ActorType;
  description: string;
  evidenceFormat: EvidenceFormat;
  digitalAccess: DigitalAccess;
  weeklyHours: number;
  extraCostMxn: number;
  missingFields: number;
};

export const demoCases: DemoCase[] = [
  {
    id: "PAPER-01",
    name: "Paper-based collection",
    actor: "collector",
    description: "An informal collection case using paper receipts.",
    evidenceFormat: "paper",
    digitalAccess: "no",
    weeklyHours: 7,
    extraCostMxn: 450,
    missingFields: 2,
  },
  {
    id: "MIXED-02",
    name: "Small packaging supplier",
    actor: "supplier",
    description: "A supplier managing mixed records and corrections.",
    evidenceFormat: "mixed",
    digitalAccess: "limited",
    weeklyHours: 4,
    extraCostMxn: 280,
    missingFields: 1,
  },
  {
    id: "DIGITAL-03",
    name: "Digitally documented producer",
    actor: "producer",
    description: "A producer with relatively complete digital records.",
    evidenceFormat: "digital",
    digitalAccess: "yes",
    weeklyHours: 1,
    extraCostMxn: 60,
    missingFields: 0,
  },
];

export function calculateMonthlyHours(weeklyHours: number): number {
  return Math.round((weeklyHours * 52 / 12) * 10) / 10;
}
