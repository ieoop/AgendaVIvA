import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocalDb } from "@/server/local-store";

export async function GET() {
  const checks: Record<string, { ok: boolean; mode?: string; message?: string }> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { ok: true, mode: "postgres" };
  } catch {
    const db = await getLocalDb();
    checks.database = {
      ok: true,
      mode: "local-json",
      message: `${db.organizations.length} negocio(s), ${db.services.length} servicio(s), ${db.appointments.length} reserva(s)`
    };
  }

  checks.email = process.env.RESEND_API_KEY
    ? { ok: true, mode: "resend" }
    : { ok: true, mode: "demo", message: "Los emails se guardan como logs internos." };

  checks.ai = process.env.OPENAI_API_KEY
    ? { ok: true, mode: "openai" }
    : { ok: true, mode: "local-rules", message: "Alma usa detección local por reglas." };

  checks.payments = process.env.STRIPE_SECRET_KEY || process.env.MERCADOPAGO_ACCESS_TOKEN
    ? { ok: true, mode: "real-provider" }
    : { ok: true, mode: "demo/manual", message: "Pagos demo y transferencia manual disponibles." };

  checks.whatsapp = process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID
    ? { ok: true, mode: "meta-cloud-api" }
    : { ok: true, mode: "wa-links", message: "Usa links wa.me y simulador interno." };

  return NextResponse.json({
    ok: Object.values(checks).every((check) => check.ok),
    app: "AgendaViva AI",
    environment: process.env.NODE_ENV ?? "development",
    checks
  });
}
