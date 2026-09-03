import { randomUUID } from "crypto";
import type { AuditEntry } from "./types";

export function audit(
  caseId: string,
  actor: AuditEntry["actor"],
  action: string,
  detail: string,
  moneyDeltaPaise?: number,
  metadata?: Record<string, unknown>,
): AuditEntry {
  return {
    id: `aud_${randomUUID().slice(0, 10)}`,
    caseId,
    ts: new Date().toISOString(),
    actor,
    action,
    detail,
    moneyDeltaPaise,
    metadata,
  };
}
