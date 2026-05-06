import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoBusinessFallback } from "@/lib/demo";

export async function GET() {
  try {
    return NextResponse.json({ customers: await prisma.customer.findMany({ take: 50, orderBy: { createdAt: "desc" } }) });
  } catch {
    return NextResponse.json({ customers: demoBusinessFallback.customers });
  }
}
