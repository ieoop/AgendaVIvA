import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    return NextResponse.json({ conversations: await prisma.conversation.findMany({ take: 30, include: { messages: { take: 3 }, customer: true }, orderBy: { lastMessageAt: "desc" } }) });
  } catch {
    return NextResponse.json({ conversations: [{ id: "demo", channel: "whatsapp", summary: "Cliente quiere reservar mañana", messages: [{ body: "Hola, quiero un turno" }] }] });
  }
}
