import { randomUUID } from "crypto";
import type { AtRiskEvent, RiskClass } from "./types";

const FIRST = [
  "Aarav",
  "Diya",
  "Kabir",
  "Meera",
  "Rohan",
  "Ananya",
  "Vikram",
  "Ishita",
  "Arjun",
  "Sana",
  "Dev",
  "Naina",
  "Kabir",
  "Zara",
  "Harsh",
];

const LAST = [
  "Sharma",
  "Patel",
  "Iyer",
  "Khan",
  "Reddy",
  "Gupta",
  "Nair",
  "Singh",
  "Mehta",
  "Das",
];

const FAILURES: Array<{
  code: string;
  reason: string;
  riskClass: RiskClass;
  weight: number;
}> = [
  {
    code: "BAD_REQUEST_ERROR",
    reason: "Payment failed due to insufficient funds",
    riskClass: "payment_failure",
    weight: 22,
  },
  {
    code: "GATEWAY_ERROR",
    reason: "Bank declined the transaction",
    riskClass: "payment_failure",
    weight: 14,
  },
  {
    code: "SERVER_ERROR",
    reason: "Network timeout while authorizing payment",
    riskClass: "payment_failure",
    weight: 10,
  },
  {
    code: "BAD_REQUEST_ERROR",
    reason: "Authentication failed / OTP not completed",
    riskClass: "payment_failure",
    weight: 8,
  },
  {
    code: "CHECKOUT_ABANDONED",
    reason: "Customer left checkout before completing payment",
    riskClass: "checkout_abandonment",
    weight: 16,
  },
  {
    code: "SUBSCRIPTION_CHARGE_FAILED",
    reason: "Recurring subscription charge failed",
    riskClass: "failed_subscription",
    weight: 12,
  },
  {
    code: "MANDATE_EXPIRED",
    reason: "UPI Autopay mandate expired",
    riskClass: "mandate_failure",
    weight: 8,
  },
  {
    code: "INVOICE_OVERDUE",
    reason: "B2B invoice past due date",
    riskClass: "overdue_receivable",
    weight: 10,
  },
];

const AMOUNTS = [
  19900, 49900, 99900, 149900, 249900, 499900, 999900, 1499900, 2499900,
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function weightedFailure() {
  const total = FAILURES.reduce((s, f) => s + f.weight, 0);
  let r = Math.random() * total;
  for (const f of FAILURES) {
    r -= f.weight;
    if (r <= 0) return f;
  }
  return FAILURES[0]!;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export function generateSyntheticBatch(
  size = 60,
  merchantId = "acct_reclaim_demo",
): AtRiskEvent[] {
  const events: AtRiskEvent[] = [];

  for (let i = 0; i < size; i++) {
    const failure = weightedFailure();
    const first = pick(FIRST);
    const last = pick(LAST);
    const amountPaise = pick(AMOUNTS);
    const attemptCount =
      failure.riskClass === "checkout_abandonment"
        ? 0
        : 1 + Math.floor(Math.random() * 3);
    const ageHours = 1 + Math.floor(Math.random() * 72);

    const event: AtRiskEvent = {
      id: `evt_${randomUUID().slice(0, 8)}`,
      merchantId,
      customerId: `cust_${1000 + i}`,
      customerName: `${first} ${last}`,
      customerPhone: `+9198${String(10000000 + i).slice(0, 8)}`,
      customerEmail: `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.in`,
      riskClass: failure.riskClass,
      amountPaise,
      currency: "INR",
      attemptCount,
      createdAt: hoursAgo(ageHours),
      lastAttemptAt: hoursAgo(Math.max(1, ageHours - attemptCount)),
      failureCode: failure.code,
      failureReason: failure.reason,
      metadata: {
        channel: pick(["web", "android", "ios", "pos"]),
        city: pick(["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Pune"]),
        product: pick([
          "Pro Plan",
          "Annual Membership",
          "Course Bundle",
          "Invoice #INV",
          "Addon Pack",
        ]),
      },
    };

    if (failure.riskClass === "payment_failure") {
      event.paymentId = `pay_demo_${randomUUID().slice(0, 10)}`;
      event.orderId = `order_demo_${randomUUID().slice(0, 10)}`;
    }
    if (failure.riskClass === "checkout_abandonment") {
      event.orderId = `order_demo_${randomUUID().slice(0, 10)}`;
    }
    if (failure.riskClass === "failed_subscription") {
      event.subscriptionId = `sub_demo_${randomUUID().slice(0, 10)}`;
      event.paymentId = `pay_demo_${randomUUID().slice(0, 10)}`;
    }
    if (failure.riskClass === "mandate_failure") {
      event.subscriptionId = `sub_demo_${randomUUID().slice(0, 10)}`;
    }
    if (failure.riskClass === "overdue_receivable") {
      event.invoiceId = `inv_demo_${randomUUID().slice(0, 10)}`;
      event.metadata.daysOverdue = String(3 + Math.floor(Math.random() * 40));
    }

    events.push(event);
  }

  return events;
}
