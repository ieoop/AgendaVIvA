import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { updateLocalAppointmentByToken } from "@/server/local-store";

const schema = z.object({
  businessSlug: z.string().min(1),
  token: z.string().min(8),
  action: z.enum(["cancel", "reschedule", "review"])
});

export async function POST(request: Request) {
  const parsed = schema.parse(Object.fromEntries(await request.formData()));

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        OR: [{ cancelToken: parsed.token }, { rescheduleToken: parsed.token }]
      }
    });
    if (appointment) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: parsed.action === "cancel" ? "cancelled" : parsed.action === "reschedule" ? "rescheduled" : appointment.status,
          startAt: parsed.action === "reschedule" ? new Date(appointment.startAt.getTime() + 2 * 24 * 60 * 60 * 1000) : undefined
        }
      });
      return NextResponse.redirect(new URL(`/b/${parsed.businessSlug}?${parsed.action}=ok`, request.url), 303);
    }
  } catch {
    // Fall through to local mode.
  }

  await updateLocalAppointmentByToken({ token: parsed.token, action: parsed.action });
  return NextResponse.redirect(new URL(`/b/${parsed.businessSlug}?${parsed.action}=local`, request.url), 303);
}
