import type { BatchMetrics, RecoveryBatchResult, RecoveryCase } from "./types";

export function computeMetrics(
  batchId: string,
  cases: RecoveryCase[],
  startedAt: string,
  finishedAt: string,
): BatchMetrics {
  const atRiskPaise = cases.reduce((s, c) => s + c.event.amountPaise, 0);
  const recoveredPaise = cases.reduce((s, c) => s + c.recoveredPaise, 0);
  const recoveredCases = cases.filter((c) => c.status === "recovered").length;
  const escalatedCases = cases.filter((c) => c.status === "escalated").length;
  const stoppedCases = cases.filter((c) => c.status === "stopped").length;
  const failedCases = cases.filter((c) => c.status === "failed").length;

  const interventionMix: Record<string, number> = {};
  const rootCauseMix: Record<string, number> = {};
  let confidenceSum = 0;
  let confidenceN = 0;
  let gracefulFailures = 0;

  for (const c of cases) {
    if (c.plan) {
      interventionMix[c.plan.type] = (interventionMix[c.plan.type] ?? 0) + 1;
    }
    if (c.diagnosis) {
      rootCauseMix[c.diagnosis.rootCause] =
        (rootCauseMix[c.diagnosis.rootCause] ?? 0) + 1;
      confidenceSum += c.diagnosis.confidence;
      confidenceN += 1;
    }
    if (c.audit.some((a) => a.action === "graceful_failure")) {
      gracefulFailures += 1;
    }
  }

  return {
    batchId,
    startedAt,
    finishedAt,
    totalCases: cases.length,
    recoveredCases,
    escalatedCases,
    stoppedCases,
    failedCases,
    atRiskPaise,
    recoveredPaise,
    recoveryRate: atRiskPaise > 0 ? recoveredPaise / atRiskPaise : 0,
    avgConfidence: confidenceN > 0 ? confidenceSum / confidenceN : 0,
    interventionMix,
    rootCauseMix,
    gracefulFailures,
  };
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function summarizeBatch(result: RecoveryBatchResult): string {
  const m = result.metrics;
  return `Recovered ${formatINR(m.recoveredPaise)} of ${formatINR(m.atRiskPaise)} at risk (${(m.recoveryRate * 100).toFixed(1)}%) across ${m.totalCases} cases.`;
}
