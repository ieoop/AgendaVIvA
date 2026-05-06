import { NextResponse } from "next/server";
import { z } from "zod";
import { getPaymentProvider } from "@/server/payments/providers";

const schema = z.object({
  provider: z.string().default("demo"),
  organizationId: z.string(),
  appointmentId: z.string().optional(),
  amountCents: z.number().int().positive(),
  currency: z.string(),
  description: z.string()
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const result = await getPaymentProvider(body.provider).createDepositPayment(body);
  return NextResponse.json(result);
}
