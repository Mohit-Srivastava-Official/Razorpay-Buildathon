# Reclaim — 5-Minute Demo Script

**Track:** Razorpay Hackathon · Track 03 · AI Revenue Recovery  
**Product:** Reclaim  
**Audience:** judges / mentors  
**Duration:** ~5:00  
**URL flow:** `/` → `/dashboard`

Use this as a spoken script. Lines in **bold** are what you say.  
Lines starting with `→` are what you do on the website at that moment.

---

## Setup (30 seconds before you start)

1. Run `npm run dev` (or `npm run start` after build).
2. Open **http://localhost:3000** in a clean browser tab.
3. Keep `/dashboard` ready as a second tab if you want zero lag.
4. Mode should stay on **Mock (measured recovery)** for the live money numbers.
5. Batch size **60**.

---

## Minute 0:00–0:40 — Hook + brand

**On screen:** Landing page `/`

→ Stand on the hero. Don’t scroll yet. Point at the word **Reclaim**.

**Say:**

> “Merchants don’t lose revenue in one clean failure.  
> A payment declines. A checkout is abandoned. A subscription charge fails. An invoice goes overdue.  
> That money was almost theirs — and then it slipped.  
> **Reclaim** is our Track 03 answer: an AI revenue recovery agent that doesn’t just flag the problem — it closes the loop.”

→ Click **Run recovery batch** (or **Open console**).

---

## Minute 0:40–1:20 — The problem & the bar

**On screen:** `/dashboard` (before running)

→ Point at the subtitle: Detect → diagnose → policy-gate → intervene.

**Say:**

> “The judging bar for this track is clear:  
> detect revenue at risk, choose the right intervention, execute a **bounded** recovery workflow, and show **measured money recovered** across a batch — with escalation, stopping rules, and an audit trail.  
> That’s exactly what this console does.”

→ Gesture at **Batch size 60** and **Mode: Mock**.

**Say:**

> “We’ll run sixty synthetic at-risk cases — failed payments, abandoned checkouts, broken subscriptions, expired mandates, overdue receivables.  
> Mock mode gives us honest measured recovery for the demo. Razorpay test-mode is wired for when we drop in keys.”

---

## Minute 1:20–2:20 — Run the loop live

→ Click **Run recovery**.

→ Wait ~1–2 seconds for metrics to populate.

→ Point in this order: **At risk** → **Recovered** → **Escalated / stopped** → **Graceful failures**.

**Say:**

> “Here’s a full batch in one click.  
> **At risk** is the rupee pool that was slipping away.  
> **Recovered** is measured money we won back in this run — this is the Track 03 proof, not a cherry-picked single case.  
> **Escalated and stopped** means policy held: amount ceilings, attempt budgets, quiet hours, human gates. The agent is not allowed to hammer customers or auto-charge everything.  
> **Graceful failures** — we intentionally inject one provider failure every batch. No crash, no double-charge, failure recorded in the audit trail.”

*(If numbers differ each run, that’s fine — say “recovery rate floats with the mix; the system is deterministic in process, probabilistic in mock outcomes.”)*

---

## Minute 2:20–3:30 — One case, full explainability

→ Click a row with status **recovered** (green).

→ Point at the **Audit trail** on the right. Scroll the trail if needed.

**Say (walk the trail top to bottom):**

> “Every money action is explainable. Take this customer.  
> **Detector** found the risk class and amount.  
> **Diagnoser** named the root cause — for example bank declined — with confidence and signals.  
> **Planner** chose the intervention — alternate method, smart retry, payment link, dunning, mandate renew, or promise-to-pay.  
> **Policy** allowed or blocked it. If amount is above the auto ceiling, or attempts are exhausted, we escalate or stop.  
> **Executor** ran the action.  
> **System** closed the case with rupees recovered.  
> Judges can audit any row. Nothing is a black box.”

→ Optionally click a **stopped** or **escalated** row next.

**Say:**

> “And here’s the other half of trust: when we should *not* act, we don’t. That’s compliant recovery — not aggressive spam.”

---

## Minute 3:30–4:20 — Architecture in one breath

→ Stay on dashboard. You can briefly point at **Root causes** and **Interventions** charts at the bottom.

**Say:**

> “Under the hood this is a Next.js + TypeScript agent loop:  
> synthetic or live events → diagnose → intervene → Razorpay mock or test executor → metrics.  
> Core brain lives in `src/lib` — policy, diagnosis, interventions, recovery orchestrator.  
> The UI is just the cockpit. The product is the bounded recovery loop.”

→ If time: open Network tab mentally / mention API:

> “Same run is available as `POST /api/recover` — so this can become a merchant backend service, not only a dashboard.”

---

## Minute 4:20–5:00 — Close + ask

**Say:**

> “Reclaim turns payment leakage into a measurable recovery pipeline: detect, diagnose, gate, act, prove.  
> Today: working batch recovery, audit trail, stop rules, graceful failure.  
> Next: live Razorpay webhooks, real payment-link collection, smarter retries, and merchant-facing controls.  
> We’re building the agent merchants can trust with money actions — because every action is bounded, gated, and logged.  
> Happy to go deeper on policy, Razorpay wiring, or the recovery metrics.”

→ Stop on the metrics row (Recovered card highlighted) as your final frame.

---

## Timing cheat-sheet

| Time   | Beat                         | Website action              |
|--------|------------------------------|-----------------------------|
| 0:00   | Hook                         | Stay on `/` hero            |
| 0:40   | Problem + bar                 | Land on `/dashboard`        |
| 1:20   | Live run                     | Click **Run recovery**      |
| 2:20   | Explainability               | Click recovered case        |
| 3:10   | Trust / stop rules           | Click escalated/stopped     |
| 3:30   | Architecture                 | Point at charts / mention API |
| 4:20   | Close + future               | Freeze on Recovered metric  |

---

# Future scope — how we improve with Razorpay

## Phase 1 — Test-mode truth (near-term)

| Improvement | Why | Razorpay piece |
|-------------|-----|----------------|
| Store `RAZORPAY_KEY_ID` / `SECRET` in `.env.local` | Move from mock money to real test objects | Razorpay Dashboard → Test API keys |
| Create **Payment Links** for abandonments / auth friction | Customer completes payment on Razorpay-hosted page | `paymentLink.create` (already stubbed in `src/lib/razorpay.ts`) |
| Create **Orders** for smart retry | Bounded retry vehicle without silent re-charge | `orders.create` |
| Webhook: `payment_link.paid` / `payment.captured` | Only count ₹ recovered when money actually clears | Razorpay Webhooks → our `/api/webhooks/razorpay` |
| Idempotency keys on every money call | Prevent double-charge on retries | Razorpay idempotency headers + our audit `providerRef` |

**Demo line:**  
> “Mock proves the agent logic. Razorpay test-mode proves the money rails. Webhooks make recovered ₹ real.”

## Phase 2 — Live recovery product

1. **Ingest real failure events**  
   Subscribe to payment failed, subscription charged/halted, mandate expired via Razorpay webhooks + merchant server events.

2. **Customer outreach channels**  
   Payment link via SMS/email; later Hinglish voice reminder for Indian SMB merchants (Track example direction).

3. **Subscription / mandate recovery**  
   UPI Autopay mandate renew flows; dunning sequences with Razorpay subscriptions APIs.

4. **Merchant console**  
   Login, choose risk classes, set auto ceiling (today hardcoded ₹25,000), quiet hours, approval queue.

5. **Outcome dashboard**  
   Recovery rate by root cause, false-intervention cost, ₹ recovered this week — same metrics we show now, but on live data.

6. **Human-in-the-loop queue**  
   Cases marked `escalated` become a real approve/deny inbox before high-value actions.

## Phase 3 — Agentic depth (still Track 03–honest)

- LLM reasoning over failure codes + customer history **with policy still binding** (LLM proposes, policy disposes).
- Multi-step campaigns: retry → link → promise-to-pay → escalate.
- A/B intervention policies with measured lift.
- Settlement-aware recovery (don’t chase what already settled).

## What we will *not* do

- No offense / fraud-tooling.
- No unbounded auto-debit.
- No counting “link created” as cash recovered without capture webhook.

---

# 2 AM War Stories Store

> Hackathon folklore file: what broke, why it hurt, how we fixed it.  
> Keep adding rows as you ship.

## Story 01 — “The empty repo that wouldn’t scaffold”

**When:** Project kickoff  
**Broke:** `create-next-app .` refused to run — conflicting `README.md`, then a weird “path not writable” on `.` even though the folder was writable.  
**Felt like:** 2 AM generator fight before any product code.  
**Fixed:** Scaffold into a subfolder `reclaim/`, move files up to repo root, rewrite README for Reclaim.  
**Lesson:** Don’t fight the scaffolder; sidestep it.

## Story 02 — “Port 3000 is haunted”

**When:** After first production build  
**Broke:** `next start -p 3000` → `EADDRINUSE`. Old `next-server` PID still held the port after a “killed” shell.  
**Felt like:** Demo page won’t boot, judges waiting in your head.  
**Fixed:** Find leftover `next-server` process, kill it cleanly, restart; always verify with a curl to `/api/health` before presenting.  
**Lesson:** For demos, check the port, not just the terminal exit code.

## Story 03 — “Beautiful metrics, zero escalations”

**When:** First successful mock batch  
**Broke:** Judging bar needs stopping rules + escalation — but demos showed `escalated: 0`, `stopped: 0`. Synthetic amounts all sat under the ₹25k auto ceiling; attempt counts never hit the human gate.  
**Felt like:** Policy code existed, but the story didn’t show up on screen.  
**Fixed:** In `synthetic.ts`, added high-value amounts above the ceiling and occasional high prior attempt counts so escalated/stopped rows appear every run.  
**Lesson:** If you want to demo a guardrail, generate data that *hits* the guardrail.

## Story 04 — “`.env.example` vanished into the void”

**When:** First commit  
**Broke:** `.gitignore` had `.env*` which also ignored `.env.example`, so teammates wouldn’t see how to add Razorpay keys.  
**Fixed:** Force-add + `!.env.example` exception in `.gitignore`.  
**Lesson:** Ignore secrets, not the instructions for secrets.

## Story 05 — “Lint cops at the door”

**When:** Right before polish push  
**Broke:** ESLint failed on `<a href="/">` instead of `next/link`, and a `let` that should be `const` in `recover.ts`.  
**Fixed:** Swap to `<Link>`, use `const` for events array. Green lint = ship.  
**Lesson:** Two-minute lint fixes beat a red CI story in front of judges.

## Story 06 — “Razorpay recovered ₹0 and that was correct”

**When:** Designing test-mode executor  
**Broke (conceptually):** Temptation to mark payment-link creation as “money recovered.” That would fake the Track 03 metric.  
**Fixed:** In Razorpay test mode, link/order creation succeeds as an *action*, recovered paise stays `0` until a real capture/webhook exists. Mock mode is used for measured ₹ demos.  
**Lesson:** Honesty is a feature. Judges can smell inflated recovery.

## Story 07 — “Graceful failure by design”

**When:** Meeting the ‘one failure handled gracefully’ bar  
**Broke:** Happy-path-only demos look fake.  
**Fixed:** Every batch injects `forceFail: "1"` on one case; executor returns a handled provider error, audit logs `graceful_failure`, UI shows count.  
**Lesson:** Schedule your chaos. Don’t hope for a live outage during the pitch.

---

## Add your next 2 AM entry

Copy this template into the store when something else breaks:

```md
## Story XX — “Short title”

**When:**  
**Broke:**  
**Felt like:**  
**Fixed:**  
**Lesson:**  
```

---

## One-line closer (optional encore)

> “We didn’t build a dashboard that stares at failed payments.  
> We built an agent that is allowed to touch money only when policy says yes — and can prove what it did at 2 AM, or on stage.”
