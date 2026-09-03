"use client";

import { useState, useTransition } from "react";
import type { RecoveryBatchResult, RecoveryCase } from "@/lib/types";

function inr(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function statusTone(status: RecoveryCase["status"]) {
  switch (status) {
    case "recovered":
      return "text-emerald-700 bg-emerald-50";
    case "partial":
      return "text-amber-800 bg-amber-50";
    case "escalated":
      return "text-sky-800 bg-sky-50";
    case "stopped":
      return "text-stone-700 bg-stone-100";
    case "failed":
      return "text-rose-800 bg-rose-50";
    default:
      return "text-stone-700 bg-stone-100";
  }
}

export function RecoveryConsole() {
  const [size, setSize] = useState(60);
  const [mode, setMode] = useState<"auto" | "mock" | "razorpay_test">("mock");
  const [result, setResult] = useState<RecoveryBatchResult | null>(null);
  const [selected, setSelected] = useState<RecoveryCase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runBatch() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/recover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ size, mode, injectGracefulFailure: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Run failed");
        setResult(data as RecoveryBatchResult);
        setSelected(data.cases[0] ?? null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Run failed");
      }
    });
  }

  const m = result?.metrics;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Recovery console
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] md:text-4xl">
            Run a bounded recovery batch
          </h2>
          <p className="mt-2 max-w-xl text-[var(--muted)]">
            Detect → diagnose → policy-gate → intervene. Every money action is
            audited. One provider failure is handled gracefully on purpose.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
            Batch size
            <input
              type="number"
              min={10}
              max={200}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-24 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
            Mode
            <select
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as "auto" | "mock" | "razorpay_test")
              }
              className="rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
            >
              <option value="mock">Mock (measured recovery)</option>
              <option value="auto">Auto</option>
              <option value="razorpay_test">Razorpay test-mode</option>
            </select>
          </label>
          <button
            type="button"
            onClick={runBatch}
            disabled={pending}
            className="rounded-md bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--sand)] transition hover:bg-[var(--ink-soft)] disabled:opacity-60"
          >
            {pending ? "Recovering…" : "Run recovery"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      {m && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="At risk"
            value={inr(m.atRiskPaise)}
            hint={`${m.totalCases} cases`}
          />
          <Metric
            label="Recovered"
            value={inr(m.recoveredPaise)}
            hint={`${(m.recoveryRate * 100).toFixed(1)}% recovery rate`}
            emphasize
          />
          <Metric
            label="Escalated / stopped"
            value={`${m.escalatedCases} / ${m.stoppedCases}`}
            hint="Policy bounds held"
          />
          <Metric
            label="Graceful failures"
            value={String(m.gracefulFailures)}
            hint={`Mode: ${result?.mode}`}
          />
        </div>
      )}

      {result && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white/80">
            <div className="border-b border-[var(--line)] px-4 py-3 text-sm font-medium text-[var(--ink)]">
              Cases
            </div>
            <div className="max-h-[28rem] overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-[var(--sand)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-2 font-medium">Customer</th>
                    <th className="px-4 py-2 font-medium">Risk</th>
                    <th className="px-4 py-2 font-medium">Cause</th>
                    <th className="px-4 py-2 font-medium">Action</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">₹</th>
                  </tr>
                </thead>
                <tbody>
                  {result.cases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`cursor-pointer border-t border-[var(--line)] transition hover:bg-[var(--mist)] ${
                        selected?.id === c.id ? "bg-[var(--mist)]" : ""
                      }`}
                    >
                      <td className="px-4 py-2.5">{c.event.customerName}</td>
                      <td className="px-4 py-2.5 text-[var(--muted)]">
                        {c.event.riskClass.replaceAll("_", " ")}
                      </td>
                      <td className="px-4 py-2.5">
                        {c.diagnosis?.rootCause.replaceAll("_", " ")}
                      </td>
                      <td className="px-4 py-2.5">
                        {c.plan?.type.replaceAll("_", " ")}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusTone(c.status)}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">
                        {inr(c.recoveredPaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white/80 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
              Audit trail
            </p>
            {selected ? (
              <div className="mt-3 space-y-3">
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                    {selected.event.customerName}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">
                    {inr(selected.event.amountPaise)} ·{" "}
                    {selected.event.failureReason}
                  </p>
                </div>
                <ol className="space-y-3 border-l border-[var(--line)] pl-4">
                  {selected.audit.map((a) => (
                    <li key={a.id} className="relative">
                      <span className="absolute -left-[1.35rem] top-1.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
                      <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
                        {a.actor} · {a.action}
                      </p>
                      <p className="text-sm text-[var(--ink)]">{a.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <p className="mt-4 text-sm text-[var(--muted)]">
                Select a case to inspect the full audit trail.
              </p>
            )}
          </div>
        </div>
      )}

      {m && (
        <div className="grid gap-4 md:grid-cols-2">
          <MixCard title="Root causes" mix={m.rootCauseMix} />
          <MixCard title="Interventions" mix={m.interventionMix} />
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  emphasize,
}: {
  label: string;
  value: string;
  hint: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--line)] px-4 py-4 ${
        emphasize ? "bg-[var(--ink)] text-[var(--sand)]" : "bg-white/80"
      }`}
    >
      <p
        className={`text-xs uppercase tracking-[0.16em] ${
          emphasize ? "text-[var(--sand)]/70" : "text-[var(--muted)]"
        }`}
      >
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl tabular-nums">
        {value}
      </p>
      <p
        className={`mt-1 text-xs ${emphasize ? "text-[var(--sand)]/70" : "text-[var(--muted)]"}`}
      >
        {hint}
      </p>
    </div>
  );
}

function MixCard({
  title,
  mix,
}: {
  title: string;
  mix: Record<string, number>;
}) {
  const entries = Object.entries(mix).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, n]) => s + n, 0) || 1;
  return (
    <div className="rounded-xl border border-[var(--line)] bg-white/80 p-4">
      <p className="text-sm font-medium text-[var(--ink)]">{title}</p>
      <ul className="mt-3 space-y-2">
        {entries.map(([k, n]) => (
          <li key={k}>
            <div className="mb-1 flex justify-between text-xs text-[var(--muted)]">
              <span>{k.replaceAll("_", " ")}</span>
              <span>
                {n} · {((n / total) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--mist)]">
              <div
                className="h-full rounded-full bg-[var(--accent)]"
                style={{ width: `${(n / total) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
