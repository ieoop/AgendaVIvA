import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  status: z.enum(["pending", "confirmed", "paid", "completed", "cancelled", "no_show", "rescheduled"]).optional(),
  startAt: z.string().datetime().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = schema.parse(await request.json());
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: body.status,
      startAt: body.startAt ? new Date(body.startAt) : undefined
    }
  });
  return NextResponse.json({ appointment });
}
