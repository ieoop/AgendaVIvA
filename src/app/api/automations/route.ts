import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    return NextResponse.json({ automations: await prisma.automation.findMany({ take: 30 }) });
  } catch {
    return NextResponse.json({ automations: ["Confirmación", "Recordatorio 24h", "Pedido de reseña", "Te extrañamos"] });
  }
}
