export type RiskClass =
  | "payment_failure"
  | "checkout_abandonment"
  | "failed_subscription"
  | "overdue_receivable"
  | "mandate_failure";

export type RootCause =
  | "insufficient_funds"
  | "bank_declined"
  | "network_timeout"
  | "auth_failed"
  | "mandate_expired"
  | "card_expired"
  | "customer_abandoned"
  | "invoice_overdue"
  | "unknown";

export type InterventionType =
  | "smart_retry"
  | "alternate_method"
  | "payment_link"
  | "mandate_renew"
  | "dunning_reminder"
  | "promise_to_pay"
  | "escalate_human"
  | "stop_recover";

export type CaseStatus =
  | "detected"
  | "diagnosed"
  | "intervening"
  | "recovered"
  | "partial"
  | "escalated"
  | "stopped"
  | "failed";

export interface AtRiskEvent {
  id: string;
  merchantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  riskClass: RiskClass;
  amountPaise: number;
  currency: "INR";
  paymentId?: string;
  orderId?: string;
  invoiceId?: string;
  subscriptionId?: string;
  failureCode?: string;
  failureReason?: string;
  attemptCount: number;
  createdAt: string;
  lastAttemptAt: string;
  metadata: Record<string, string>;
}

export interface Diagnosis {
  rootCause: RootCause;
  confidence: number;
  rationale: string;
  signals: string[];
}

export interface InterventionPlan {
  type: InterventionType;
  rationale: string;
  maxAttempts: number;
  cooldownHours: number;
  boundedAmountPaise: number;
  requiresHumanApproval: boolean;
  channel: "api" | "sms" | "email" | "voice" | "human";
}

export interface PolicyDecision {
  allowed: boolean;
  reason: string;
  stopRule?: string;
}

export interface AuditEntry {
  id: string;
  caseId: string;
  ts: string;
  actor: "detector" | "diagnoser" | "policy" | "executor" | "system";
  action: string;
  detail: string;
  moneyDeltaPaise?: number;
  metadata?: Record<string, unknown>;
}

export interface RecoveryCase {
  id: string;
  event: AtRiskEvent;
  status: CaseStatus;
  diagnosis?: Diagnosis;
  plan?: InterventionPlan;
  recoveredPaise: number;
  attempts: number;
  audit: AuditEntry[];
  error?: string;
  completedAt?: string;
}

export interface BatchMetrics {
  batchId: string;
  startedAt: string;
  finishedAt: string;
  totalCases: number;
  recoveredCases: number;
  escalatedCases: number;
  stoppedCases: number;
  failedCases: number;
  atRiskPaise: number;
  recoveredPaise: number;
  recoveryRate: number;
  avgConfidence: number;
  interventionMix: Record<string, number>;
  rootCauseMix: Record<string, number>;
  gracefulFailures: number;
}

export interface RecoveryBatchResult {
  batchId: string;
  cases: RecoveryCase[];
  metrics: BatchMetrics;
  mode: "mock" | "razorpay_test";
}
