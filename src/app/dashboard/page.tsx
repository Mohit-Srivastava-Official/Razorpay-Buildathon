import Link from "next/link";
import { RecoveryConsole } from "./console";

export default function DashboardPage() {
  return (
    <main className="relative flex-1">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(46,125,110,0.12),_transparent_55%),linear-gradient(180deg,#f3efe6_0%,#e8f0ec_100%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <header className="mb-10 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]"
          >
            Reclaim
          </Link>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Track 03 · AI Revenue Recovery
          </p>
        </header>
        <RecoveryConsole />
      </div>
    </main>
  );
}
