import { NextResponse } from "next/server";
import { z } from "zod";
import { runRecoveryBatch } from "@/lib/recover";

const BodySchema = z.object({
  size: z.number().int().min(10).max(200).optional().default(60),
  mode: z.enum(["auto", "mock", "razorpay_test"]).optional().default("auto"),
  injectGracefulFailure: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const body = BodySchema.parse(json);
    const result = await runRecoveryBatch({
      size: body.size,
      mode: body.mode,
      injectGracefulFailure: body.injectGracefulFailure,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Recovery run failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
