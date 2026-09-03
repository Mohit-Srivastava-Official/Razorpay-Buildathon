import { randomUUID } from "crypto";
import { audit } from "./audit";
import { diagnoseEvent } from "./diagnose";
import { planIntervention } from "./interventions";
import { computeMetrics } from "./metrics";
import { evaluatePolicy, nextStatusAfterPolicy } from "./policy";
import {
  executeIntervention,
  resolveExecutorMode,
  type ExecutorMode,
} from "./razorpay";
import { generateSyntheticBatch } from "./synthetic";
import type { AtRiskEvent, RecoveryBatchResult, RecoveryCase } from "./types";

export interface RunRecoveryOptions {
  size?: number;
  events?: AtRiskEvent[];
  mode?: ExecutorMode | "auto";
  /** Force exactly one graceful failure into the batch for demo bar. */
  injectGracefulFailure?: boolean;
}

export async function runRecoveryBatch(
  options: RunRecoveryOptions = {},
): Promise<RecoveryBatchResult> {
  const batchId = `batch_${randomUUID().slice(0, 8)}`;
  const startedAt = new Date().toISOString();
  const mode = resolveExecutorMode(options.mode ?? "auto");

  const events =
    options.events ?? generateSyntheticBatch(options.size ?? 60);

  if (options.injectGracefulFailure !== false && events.length > 0) {
    const target = events[Math.min(2, events.length - 1)]!;
    target.metadata = { ...target.metadata, forceFail: "1" };
  }

  const cases: RecoveryCase[] = [];
  let batchRecoveredPaise = 0;

  for (const event of events) {
    const caseId = `case_${randomUUID().slice(0, 8)}`;
    const recovery: RecoveryCase = {
      id: caseId,
      event,
      status: "detected",
      recoveredPaise: 0,
      attempts: 0,
      audit: [
        audit(
          caseId,
          "detector",
          "detected",
          `Detected ${event.riskClass} for ${event.customerName} · ₹${(event.amountPaise / 100).toFixed(2)}`,
          0,
          { riskClass: event.riskClass, failureCode: event.failureCode },
        ),
      ],
    };

    // Diagnose
    const diagnosis = diagnoseEvent(event);
    recovery.diagnosis = diagnosis;
    recovery.status = "diagnosed";
    recovery.audit.push(
      audit(
        caseId,
        "diagnoser",
        "diagnosed",
        `${diagnosis.rootCause} (${(diagnosis.confidence * 100).toFixed(0)}%): ${diagnosis.rationale}`,
        0,
        { signals: diagnosis.signals },
      ),
    );

    // Plan
    const plan = planIntervention(event, diagnosis);
    recovery.plan = plan;
    recovery.audit.push(
      audit(caseId, "diagnoser", "planned", plan.rationale, 0, {
        type: plan.type,
        channel: plan.channel,
        maxAttempts: plan.maxAttempts,
      }),
    );

    // Policy gate
    const decision = evaluatePolicy(
      event,
      plan,
      recovery.attempts,
      batchRecoveredPaise,
    );
    recovery.audit.push(
      audit(
        caseId,
        "policy",
        decision.allowed ? "allowed" : "blocked",
        decision.reason,
        0,
        { stopRule: decision.stopRule ?? null },
      ),
    );

    if (!decision.allowed) {
      recovery.status = nextStatusAfterPolicy(decision);
      recovery.completedAt = new Date().toISOString();
      cases.push(recovery);
      continue;
    }

    // Execute
    recovery.status = "intervening";
    recovery.attempts += 1;
    const result = await executeIntervention(event, plan, mode);
    recovery.audit.push(
      audit(
        caseId,
        "executor",
        result.gracefulFailure
          ? "graceful_failure"
          : result.ok
            ? "executed"
            : "execution_failed",
        result.message,
        result.recoveredPaise,
        { providerRef: result.providerRef, mode },
      ),
    );

    if (result.gracefulFailure) {
      recovery.status = "failed";
      recovery.error = result.message;
    } else if (result.ok && result.recoveredPaise > 0) {
      recovery.status = "recovered";
      recovery.recoveredPaise = result.recoveredPaise;
      batchRecoveredPaise += result.recoveredPaise;
    } else if (result.ok && result.recoveredPaise === 0) {
      // Action taken (e.g. link created) but cash not yet in
      recovery.status = "partial";
    } else {
      recovery.status = "failed";
      recovery.error = result.message;
    }

    recovery.completedAt = new Date().toISOString();
    recovery.audit.push(
      audit(
        caseId,
        "system",
        "case_closed",
        `Final status=${recovery.status}; recovered=₹${(recovery.recoveredPaise / 100).toFixed(2)}`,
        recovery.recoveredPaise,
      ),
    );

    cases.push(recovery);
  }

  const finishedAt = new Date().toISOString();
  return {
    batchId,
    cases,
    metrics: computeMetrics(batchId, cases, startedAt, finishedAt),
    mode,
  };
}
