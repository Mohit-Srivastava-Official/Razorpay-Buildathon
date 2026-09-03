import { NextResponse } from "next/server";
import { POLICY } from "@/lib/policy";

export async function GET() {
  return NextResponse.json({
    name: "Reclaim",
    track: "AI Revenue Recovery",
    policy: POLICY,
    modes: ["mock", "razorpay_test"],
    env: {
      razorpayConfigured: Boolean(
        process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
      ),
    },
  });
}
