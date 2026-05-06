import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/server/availability";
import { getLocalAvailableSlots } from "@/server/local-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessSlug = searchParams.get("businessSlug") ?? "estetica-palermo";
  const serviceId = searchParams.get("serviceId") ?? undefined;
  try {
    const localSlots = await getLocalAvailableSlots(businessSlug, serviceId);
    if (localSlots.length > 0) {
      return NextResponse.json({ slots: localSlots.slice(0, 12), mode: "local" });
    }
  } catch {
    // Keep static fallback below.
  }

  const now = new Date();
  now.setHours(9, 0, 0, 0);
  const slots = getAvailableSlots({
    from: now,
    days: 7,
    durationMinutes: 45,
    bufferAfterMinutes: 10,
    rules: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", capacity: 1 },
      { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", capacity: 1 },
      { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", capacity: 1 },
      { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", capacity: 1 },
      { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", capacity: 1 }
    ],
    exceptions: [],
    appointments: []
  });
  return NextResponse.json({ slots: slots.slice(0, 12) });
}
