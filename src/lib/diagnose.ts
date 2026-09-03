import type { AtRiskEvent, Diagnosis, RootCause } from "./types";

function inferCause(event: AtRiskEvent): {
  rootCause: RootCause;
  confidence: number;
  signals: string[];
} {
  const reason = (event.failureReason ?? "").toLowerCase();
  const code = (event.failureCode ?? "").toUpperCase();
  const signals: string[] = [];

  if (event.riskClass === "checkout_abandonment") {
    signals.push("no_payment_attempt", "order_created", "session_drop");
    return { rootCause: "customer_abandoned", confidence: 0.91, signals };
  }

  if (event.riskClass === "overdue_receivable") {
    signals.push(
      "invoice_past_due",
      `days_overdue=${event.metadata.daysOverdue ?? "n/a"}`,
    );
    return { rootCause: "invoice_overdue", confidence: 0.93, signals };
  }

  if (
    event.riskClass === "mandate_failure" ||
    reason.includes("mandate") ||
    code.includes("MANDATE")
  ) {
    signals.push("mandate_status=expired", "recurring_charge_blocked");
    return { rootCause: "mandate_expired", confidence: 0.9, signals };
  }

  if (reason.includes("insufficient")) {
    signals.push("issuer_code=NSF", "retry_window=payday_aligned");
    return { rootCause: "insufficient_funds", confidence: 0.88, signals };
  }

  if (reason.includes("declined") || reason.includes("bank declined")) {
    signals.push("issuer_decline", "method_risk=elevated");
    return { rootCause: "bank_declined", confidence: 0.84, signals };
  }

  if (reason.includes("timeout") || code.includes("SERVER_ERROR")) {
    signals.push("transient_gateway", "idempotent_retry_safe");
    return { rootCause: "network_timeout", confidence: 0.86, signals };
  }

  if (reason.includes("auth") || reason.includes("otp")) {
    signals.push("3ds_incomplete", "customer_friction");
    return { rootCause: "auth_failed", confidence: 0.82, signals };
  }

  if (reason.includes("card expired") || reason.includes("expired card")) {
    signals.push("card_expiry", "need_updated_method");
    return { rootCause: "card_expired", confidence: 0.89, signals };
  }

  if (event.riskClass === "failed_subscription") {
    signals.push("subscription_charge_failed", "dunning_candidate");
    return { rootCause: "insufficient_funds", confidence: 0.72, signals };
  }

  signals.push("fallback_classifier");
  return { rootCause: "unknown", confidence: 0.55, signals };
}

const RATIONALE: Record<RootCause, string> = {
  insufficient_funds:
    "Issuer/NSF pattern suggests timing-sensitive recovery; schedule smart retries around typical salary cycles and offer UPI fallback.",
  bank_declined:
    "Hard-ish issuer decline. Prefer alternate method or payment link rather than blind retries.",
  network_timeout:
    "Transient gateway/network failure. Safe for immediate bounded retry with idempotency key.",
  auth_failed:
    "Customer friction during auth/OTP. Send a low-friction payment link instead of repeating the same flow.",
  mandate_expired:
    "Autopay mandate is no longer valid. Renew mandate before charging again.",
  card_expired:
    "Stored credential is stale. Request updated payment method via secure link.",
  customer_abandoned:
    "Checkout started but unpaid. Recover with a timed reminder + one-click payment link.",
  invoice_overdue:
    "Receivable is past due. Start compliant chase sequence with promise-to-pay option.",
  unknown:
    "Signals are incomplete. Escalate carefully with a single low-risk nudge before human review.",
};

export function diagnoseEvent(event: AtRiskEvent): Diagnosis {
  const { rootCause, confidence, signals } = inferCause(event);
  return {
    rootCause,
    confidence,
    rationale: RATIONALE[rootCause],
    signals,
  };
}
