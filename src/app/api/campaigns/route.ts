import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    return NextResponse.json({ campaigns: await prisma.campaign.findMany({ take: 30 }) });
  } catch {
    return NextResponse.json({ campaigns: [{ name: "Clientes que podés recuperar", metrics: { sent: 42, bookings: 4 } }] });
  }
}
