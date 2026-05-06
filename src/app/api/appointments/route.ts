import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { demoBusinessFallback } from "@/lib/demo";
import { createSecureToken } from "@/lib/security";
import { createLocalBooking, getLocalDb } from "@/server/local-store";

const schema = z.object({
  organizationId: z.string(),
  customerId: z.string(),
  serviceId: z.string(),
  startAt: z.string().datetime()
});

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({ take: 30, orderBy: { startAt: "asc" }, include: { customer: true, service: true } });
    return NextResponse.json({ appointments });
  } catch {
    const db = await getLocalDb();
    return NextResponse.json({ appointments: db.appointments });
  }
}

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  try {
    const service = await prisma.service.findUniqueOrThrow({ where: { id: body.serviceId } });
    const startAt = new Date(body.startAt);
    const appointment = await prisma.appointment.create({
      data: {
        organizationId: body.organizationId,
        customerId: body.customerId,
        serviceId: body.serviceId,
        startAt,
        endAt: new Date(startAt.getTime() + service.durationMinutes * 60_000),
        cancelToken: createSecureToken(),
        rescheduleToken: createSecureToken(),
        source: "admin",
        status: "confirmed"
      }
    });
    return NextResponse.json({ appointment }, { status: 201 });
  } catch {
    const booking = await createLocalBooking({
      businessSlug: "estetica-palermo",
      serviceId: body.serviceId,
      name: "Cliente manual",
      email: "cliente.manual@example.com",
      source: "admin"
    });
    return NextResponse.json({ appointment: booking.appointment, mode: "local" }, { status: 201 });
  }
}
