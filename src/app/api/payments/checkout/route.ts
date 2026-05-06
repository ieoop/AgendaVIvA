import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentProvider } from "@/server/payments/providers";

const schema = z.object({
  provider: z.string().default("demo"),
  organizationId: z.string().default("demo-org"),
  amountCents: z.number().int().positive().default(1900),
  currency: z.string().default("EUR"),
  description: z.string().default("AgendaViva AI checkout")
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const result = await getPaymentProvider(body.provider).createCheckoutSession(body);
  return NextResponse.json(result);
}
