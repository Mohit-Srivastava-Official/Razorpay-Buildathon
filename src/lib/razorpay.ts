import { randomUUID } from "crypto";
import type { AtRiskEvent, InterventionPlan } from "./types";

export type ExecutorMode = "mock" | "razorpay_test";

export interface ExecutionResult {
  ok: boolean;
  recoveredPaise: number;
  providerRef?: string;
  message: string;
  gracefulFailure?: boolean;
}

function hasRazorpayCredentials(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
}

export function resolveExecutorMode(
  prefer?: ExecutorMode | "auto",
): ExecutorMode {
  if (prefer === "mock") return "mock";
  if (prefer === "razorpay_test") {
    if (!hasRazorpayCredentials()) {
      throw new Error(
        "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET required for razorpay_test mode",
      );
    }
    return "razorpay_test";
  }
  return hasRazorpayCredentials() ? "razorpay_test" : "mock";
}

/** Deterministic-ish success probabilities by intervention (for demo metrics). */
function mockSuccessProbability(plan: InterventionPlan): number {
  switch (plan.type) {
    case "smart_retry":
      return 0.62;
    case "payment_link":
      return 0.48;
    case "alternate_method":
      return 0.55;
    case "mandate_renew":
      return 0.4;
    case "dunning_reminder":
      return 0.35;
    case "promise_to_pay":
      return 0.28;
    default:
      return 0.1;
  }
}

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h / 0xffffffff;
}

async function executeMock(
  event: AtRiskEvent,
  plan: InterventionPlan,
): Promise<ExecutionResult> {
  // Inject one graceful failure path for demo: known bad order id pattern
  if (event.orderId?.endsWith("deadbeef") || event.metadata.forceFail === "1") {
    return {
      ok: false,
      recoveredPaise: 0,
      message:
        "Provider returned 502 Bad Gateway. Marked as graceful failure; no double-charge attempted.",
      gracefulFailure: true,
      providerRef: `mock_err_${randomUUID().slice(0, 8)}`,
    };
  }

  const p = mockSuccessProbability(plan);
  const roll = hashSeed(`${event.id}:${plan.type}`);
  const ok = roll < p;

  if (!ok) {
    return {
      ok: false,
      recoveredPaise: 0,
      message: `Mock ${plan.type} did not convert. Customer retained in recovery queue with cooldown ${plan.cooldownHours}h.`,
      providerRef: `mock_${plan.type}_${randomUUID().slice(0, 6)}`,
    };
  }

  return {
    ok: true,
    recoveredPaise: event.amountPaise,
    message: `Mock ${plan.type} succeeded via ${plan.channel}.`,
    providerRef: `mock_ok_${randomUUID().slice(0, 8)}`,
  };
}

async function executeRazorpayTest(
  event: AtRiskEvent,
  plan: InterventionPlan,
): Promise<ExecutionResult> {
  // Dynamic import so mock mode works without configuring keys at build time
  const Razorpay = (await import("razorpay")).default;
  const client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  try {
    if (plan.type === "payment_link" || plan.type === "dunning_reminder") {
      const link = await client.paymentLink.create({
        amount: event.amountPaise,
        currency: "INR",
        accept_partial: false,
        description: `Reclaim recovery · ${event.riskClass} · ${event.id}`,
        customer: {
          name: event.customerName,
          email: event.customerEmail,
          contact: event.customerPhone,
        },
        notify: { sms: false, email: false },
        reminder_enable: false,
        notes: {
          reclaim_case: event.id,
          intervention: plan.type,
          root_recovery: "true",
        },
      });

      return {
        ok: true,
        // Link created ≠ collected; count as pending recovery credit of 0 cash,
        // but mark action success with 0 recovered until paid.
        recoveredPaise: 0,
        providerRef: link.id,
        message: `Payment link created in Razorpay test mode (${link.short_url ?? link.id}). Awaiting customer payment.`,
      };
    }

    if (plan.type === "smart_retry" && event.orderId) {
      // In test mode we cannot silently re-charge without a new order/payment.
      // Create a fresh order as the bounded retry vehicle.
      const order = await client.orders.create({
        amount: event.amountPaise,
        currency: "INR",
        receipt: `reclaim_${event.id}`.slice(0, 40),
        notes: {
          reclaim_case: event.id,
          intervention: "smart_retry",
          prior_order: event.orderId,
        },
      });

      return {
        ok: true,
        recoveredPaise: 0,
        providerRef: order.id,
        message: `Retry order created in Razorpay test mode (${order.id}). Payment capture still customer/issuer gated.`,
      };
    }

    // Other interventions: log as structured no-op against live API with clear message
    return {
      ok: true,
      recoveredPaise: 0,
      providerRef: `rzp_action_${randomUUID().slice(0, 8)}`,
      message: `Razorpay test mode acknowledged intervention ${plan.type}. Full auto-capture requires customer auth — action recorded, money not assumed recovered.`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Razorpay error";
    return {
      ok: false,
      recoveredPaise: 0,
      gracefulFailure: true,
      message: `Razorpay API error handled gracefully: ${message}`,
      providerRef: `rzp_err_${randomUUID().slice(0, 8)}`,
    };
  }
}

export async function executeIntervention(
  event: AtRiskEvent,
  plan: InterventionPlan,
  mode: ExecutorMode,
): Promise<ExecutionResult> {
  if (mode === "razorpay_test") {
    return executeRazorpayTest(event, plan);
  }
  return executeMock(event, plan);
}
