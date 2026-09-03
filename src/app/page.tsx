import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-orb absolute -left-24 top-[-10%] h-[55vh] w-[55vh] rounded-full bg-[radial-gradient(circle,_rgba(63,168,144,0.35),_transparent_68%)]" />
        <div className="hero-orb absolute right-[-10%] top-[20%] h-[48vh] w-[48vh] rounded-full bg-[radial-gradient(circle,_rgba(19,37,31,0.18),_transparent_70%)] [animation-delay:-4s]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f3efe6_0%,#e7efe9_55%,#dce8e2_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2313251f' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 pb-16 pt-6 md:px-8">
        <header className="flex items-center justify-between animate-rise">
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)] md:text-3xl">
            Reclaim
          </p>
          <nav className="flex items-center gap-4 text-sm text-[var(--muted)]">
            <a href="#how" className="hover:text-[var(--ink)]">
              How it works
            </a>
            <Link
              href="/dashboard"
              className="rounded-md bg-[var(--ink)] px-4 py-2 font-medium text-[var(--sand)] transition hover:bg-[var(--ink-soft)]"
            >
              Open console
            </Link>
          </nav>
        </header>

        <section className="mt-16 flex flex-1 flex-col justify-center gap-10 md:mt-20 md:gap-14">
          <div className="max-w-3xl">
            <p className="animate-rise font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
              Razorpay Hackathon · Track 03
            </p>
            <h1 className="animate-rise-delay mt-4 font-[family-name:var(--font-display)] text-5xl leading-[1.05] tracking-tight text-[var(--ink)] md:text-7xl">
              Reclaim
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">
              Find revenue that&apos;s slipping away — failed payments, abandoned
              checkouts, broken subscriptions — and win it back with bounded,
              auditable recovery.
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-bright)]"
              >
                Run recovery batch
              </Link>
              <a
                href="#how"
                className="rounded-md border border-[var(--ink)]/20 px-5 py-3 text-sm font-medium text-[var(--ink)] transition hover:border-[var(--ink)]/40"
              >
                See the loop
              </a>
            </div>
          </div>

          <div className="animate-rise-delay-2 relative overflow-hidden rounded-2xl border border-[var(--ink)]/10 bg-[var(--ink)] px-6 py-8 text-[var(--sand)] md:px-10 md:py-10">
            <svg
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full opacity-40"
              viewBox="0 0 800 100"
              fill="none"
              aria-hidden
            >
              <path
                className="flow-line"
                d="M0 70 C120 20, 200 90, 320 50 S520 10, 640 55 S760 90, 800 40"
                stroke="#3fa890"
                strokeWidth="2"
              />
            </svg>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent-bright)]">
              Money at risk → money recovered
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <HeroStat label="Detect" value="5 risk classes" />
              <HeroStat label="Bound" value="Policy + stop rules" />
              <HeroStat label="Prove" value="Batch ₹ recovered" />
            </div>
          </div>
        </section>
      </div>

      <section id="how" className="relative border-t border-[var(--line)] bg-[#eef3ef]">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)] md:text-4xl">
            One loop. Measured recovery.
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            Reclaim doesn&apos;t stop at identifying the problem. It diagnoses
            root cause, picks a bounded intervention, executes it, and records
            every rupee move.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <Step
              n="01"
              title="Detect"
              body="Payment failures, checkout drop-offs, failed subscriptions, mandate expiry, overdue receivables."
            />
            <Step
              n="02"
              title="Diagnose"
              body="Root-cause classifier with confidence + signals — insufficient funds, issuer decline, auth friction, and more."
            />
            <Step
              n="03"
              title="Intervene"
              body="Smart retry, payment link, alternate method, mandate renew, dunning, or promise-to-pay — gated by policy."
            />
            <Step
              n="04"
              title="Audit"
              body="Full trail per case. Quiet hours, amount ceilings, attempt budgets, human gates, graceful provider failures."
            />
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white/70 px-6 py-6">
            <div>
              <p className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                Ready for the judging bar
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Measured money recovered across a batch · compliant escalation ·
                stopping rules · audit trail · one graceful failure
              </p>
            </div>
            <Link
              href="/dashboard"
              className="rounded-md bg-[var(--ink)] px-5 py-3 text-sm font-medium text-[var(--sand)]"
            >
              Open recovery console
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-[var(--sand)] px-5 py-8 text-sm text-[var(--muted)] md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-[family-name:var(--font-display)] text-[var(--ink)]">
            Reclaim
          </p>
          <p>Built for Razorpay Hackathon · AI Revenue Recovery</p>
        </div>
      </footer>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--sand)]/60">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-2xl">
        {value}
      </p>
    </div>
  );
}

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs text-[var(--accent)]">{n}</p>
      <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
    </div>
  );
}
