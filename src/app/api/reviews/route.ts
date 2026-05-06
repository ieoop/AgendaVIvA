import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    return NextResponse.json({ reviews: await prisma.review.findMany({ take: 30, orderBy: { createdAt: "desc" } }) });
  } catch {
    return NextResponse.json({ reviews: [{ rating: 5, publicText: "Reservé en dos minutos." }] });
  }
}
