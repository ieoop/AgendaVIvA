import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/server/payments/providers";

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") ?? request.headers.get("x-signature") ?? request.headers.get("x-hub-signature-256");
  const handled = await getPaymentProvider(provider).handleWebhook(payload, signature);
  try {
    await prisma.webhookEvent.create({
      data: {
        provider: provider === "mercadopago" ? "mercado_pago" : provider === "stripe" || provider === "redsys" ? provider : "demo",
        eventType: handled.eventType,
        payload: JSON.parse(payload || "{}"),
        status: handled.ok ? "processed" : "invalid_signature",
        processedAt: handled.ok ? new Date() : null
      }
    });
  } catch {
    // Webhook receivers must acknowledge demo mode even before migrations run.
  }
  return NextResponse.json(handled, { status: handled.ok ? 200 : 400 });
}
