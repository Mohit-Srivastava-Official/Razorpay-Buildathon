import type {
  AtRiskEvent,
  Diagnosis,
  InterventionPlan,
  InterventionType,
  RootCause,
} from "./types";

const CAUSE_TO_INTERVENTION: Record<RootCause, InterventionType> = {
  insufficient_funds: "smart_retry",
  bank_declined: "alternate_method",
  network_timeout: "smart_retry",
  auth_failed: "payment_link",
  mandate_expired: "mandate_renew",
  card_expired: "alternate_method",
  customer_abandoned: "payment_link",
  invoice_overdue: "dunning_reminder",
  unknown: "dunning_reminder",
};

function channelFor(type: InterventionType): InterventionPlan["channel"] {
  switch (type) {
    case "smart_retry":
    case "alternate_method":
    case "mandate_renew":
      return "api";
    case "payment_link":
    case "dunning_reminder":
      return "email";
    case "promise_to_pay":
      return "sms";
    case "escalate_human":
    case "stop_recover":
      return "human";
  }
}

export function planIntervention(
  event: AtRiskEvent,
  diagnosis: Diagnosis,
): InterventionPlan {
  let type = CAUSE_TO_INTERVENTION[diagnosis.rootCause];

  // High attempt count → escalate or stop rather than hammering the customer
  if (event.attemptCount >= 3 && type === "smart_retry") {
    type = "payment_link";
  }
  if (event.attemptCount >= 5) {
    type = "escalate_human";
  }

  // Very low confidence → human gate
  if (diagnosis.confidence < 0.6) {
    type = "escalate_human";
  }

  // Large B2B invoices get promise-to-pay instead of aggressive auto-retry
  if (
    event.riskClass === "overdue_receivable" &&
    event.amountPaise >= 1000000
  ) {
    type = "promise_to_pay";
  }

  const maxAttempts =
    type === "smart_retry" ? 2 : type === "dunning_reminder" ? 3 : 1;

  return {
    type,
    rationale: `Selected ${type} for root cause ${diagnosis.rootCause} (confidence ${(diagnosis.confidence * 100).toFixed(0)}%).`,
    maxAttempts,
    cooldownHours: type === "smart_retry" ? 6 : 24,
    boundedAmountPaise: event.amountPaise,
    requiresHumanApproval:
      type === "escalate_human" || event.amountPaise >= 2500000,
    channel: channelFor(type),
  };
}
