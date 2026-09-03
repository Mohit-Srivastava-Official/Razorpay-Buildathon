import { NextResponse } from "next/server";
import { generateSyntheticBatch } from "@/lib/synthetic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const size = Math.min(
    200,
    Math.max(10, Number(searchParams.get("size") ?? 60) || 60),
  );
  const events = generateSyntheticBatch(size);
  const atRiskPaise = events.reduce((s, e) => s + e.amountPaise, 0);
  return NextResponse.json({
    count: events.length,
    atRiskPaise,
    events,
  });
}
