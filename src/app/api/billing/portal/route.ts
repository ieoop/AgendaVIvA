import { NextResponse } from "next/server";
import { getPaymentProvider } from "@/server/payments/providers";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({ provider: "demo", customerId: "demo" }));
  const url = await getPaymentProvider(body.provider ?? "demo").getCustomerPortalUrl(body.customerId ?? "demo");
  return NextResponse.json({ url });
}
