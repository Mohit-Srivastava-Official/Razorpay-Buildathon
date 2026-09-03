# Reclaim · AI Revenue Recovery

**Razorpay Hackathon — Track 03: AI Revenue Recovery**

Reclaim detects revenue at risk (failed payments, abandoned checkouts, failed subscriptions, mandate expiry, overdue receivables), diagnoses the root cause, picks a **bounded** intervention, executes it, and proves **measured money recovered** across a batch — with policy gates, stopping rules, escalation, and a full audit trail.

## Why this track

Revenue rarely dies in one clean step. A payment degrades → a checkout is abandoned → a subscription fails → an invoice goes overdue. Reclaim closes that loop.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) · console at [/dashboard](http://localhost:3000/dashboard).

### Optional: Razorpay test-mode

```bash
cp .env.example .env.local
# set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
```

Then choose **Razorpay test-mode** in the console. Without keys, **Mock** mode still demonstrates measured recovery, policy, and audit.

## The loop

| Step | What happens |
|------|----------------|
| **Detect** | Synthetic (or live) batch of at-risk events |
| **Diagnose** | Root cause + confidence + signals |
| **Policy** | Amount ceiling, attempt budget, quiet hours, human gate |
| **Intervene** | Smart retry · payment link · alternate method · mandate renew · dunning · promise-to-pay · escalate |
| **Audit** | Every action logged; one graceful provider failure injected per batch |

## Judging bar coverage

- ✅ Detect → diagnose → intervene (not just flagging)
- ✅ Measured ₹ recovered across a batch (mock mode)
- ✅ Compliant escalation + stopping rules (`src/lib/policy.ts`)
- ✅ Full audit trail per case
- ✅ One failure handled gracefully

## API

```bash
# Run a 60-case recovery batch
curl -X POST http://localhost:3000/api/recover \
  -H 'content-type: application/json' \
  -d '{"size":60,"mode":"mock"}'

# Preview synthetic at-risk events
curl 'http://localhost:3000/api/events?size=20'

# Health + policy
curl http://localhost:3000/api/health
```

## Stack

Next.js · TypeScript · Razorpay Node SDK (optional test-mode) · Zod

## Repo layout

```
src/lib/          # detector, diagnoser, policy, interventions, executor, metrics
src/app/dashboard # recovery console UI
src/app/api/      # recover / events / health
```
