import type {
  AtRiskEvent,
  InterventionPlan,
  PolicyDecision,
  RecoveryCase,
} from "./types";

/** Hard bounds for every money action — explainable, gated, reversible. */
export const POLICY = {
  maxAutoAmountPaise: 2500000, // ₹25,000 auto ceiling
  maxAttemptsPerCase: 3,
  maxBatchSpendPaise: 50_000_000, // safety cap across batch
  quietHoursIST: { start: 21, end: 8 }, // no customer outreach late night
  stopOnHardDecline: true,
  requireAudit: true,
} as const;

export function evaluatePolicy(
  event: AtRiskEvent,
  plan: InterventionPlan,
  priorAttempts: number,
  batchRecoveredPaise: number,
): PolicyDecision {
  if (priorAttempts >= POLICY.maxAttemptsPerCase) {
    return {
      allowed: false,
      reason: "Attempt budget exhausted for this case.",
      stopRule: "max_attempts_per_case",
    };
  }

  if (priorAttempts >= plan.maxAttempts) {
    return {
      allowed: false,
      reason: "Intervention-specific attempt limit reached.",
      stopRule: "intervention_max_attempts",
    };
  }

  if (plan.boundedAmountPaise > POLICY.maxAutoAmountPaise) {
    return {
      allowed: false,
      reason: `Amount ₹${(plan.boundedAmountPaise / 100).toFixed(2)} exceeds auto ceiling ₹${(POLICY.maxAutoAmountPaise / 100).toFixed(2)}.`,
      stopRule: "max_auto_amount",
    };
  }

  if (
    batchRecoveredPaise + plan.boundedAmountPaise >
    POLICY.maxBatchSpendPaise
  ) {
    return {
      allowed: false,
      reason: "Batch recovery spend cap would be exceeded.",
      stopRule: "max_batch_spend",
    };
  }

  if (
    plan.channel !== "api" &&
    plan.channel !== "human" &&
    isQuietHoursIST()
  ) {
    return {
      allowed: false,
      reason: "Customer outreach blocked during quiet hours (IST 21:00–08:00).",
      stopRule: "quiet_hours",
    };
  }

  if (
    POLICY.stopOnHardDecline &&
    (event.failureReason ?? "").toLowerCase().includes("stolen")
  ) {
    return {
      allowed: false,
      reason: "Hard decline / fraud-adjacent signal — stop and escalate.",
      stopRule: "hard_decline",
    };
  }

  if (plan.requiresHumanApproval) {
    return {
      allowed: false,
      reason: "Human approval required before money action.",
      stopRule: "human_gate",
    };
  }

  if (plan.type === "stop_recover") {
    return {
      allowed: false,
      reason: "Stop rule selected by planner.",
      stopRule: "planner_stop",
    };
  }

  return {
    allowed: true,
    reason: "Within amount, attempt, quiet-hours, and approval bounds.",
  };
}

export function isQuietHoursIST(now = new Date()): boolean {
  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const hour = ist.getHours();
  return hour >= POLICY.quietHoursIST.start || hour < POLICY.quietHoursIST.end;
}

export function nextStatusAfterPolicy(
  decision: PolicyDecision,
): RecoveryCase["status"] {
  if (decision.stopRule === "human_gate") return "escalated";
  if (!decision.allowed) return "stopped";
  return "intervening";
}
