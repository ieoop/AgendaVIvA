import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getLocalDb, updateLocalAvailabilityRule } from "@/server/local-store";

const schema = z.object({
  organizationId: z.string().default("local_org_ar"),
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.coerce.number().int().min(1).max(20).default(1),
  active: z.coerce.boolean().default(true)
});

export async function GET() {
  try {
    const rules = await prisma.availabilityRule.findMany({ orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] });
    return NextResponse.json({ rules, mode: "postgres" });
  } catch {
    const db = await getLocalDb();
    return NextResponse.json({ rules: db.availabilityRules, mode: "local" });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const data = contentType.includes("form") ? Object.fromEntries(await request.formData()) : await request.json();
  const parsed = schema.parse(data);

  try {
    await prisma.availabilityRule.upsert({
      where: { id: `${parsed.organizationId}-${parsed.dayOfWeek}` },
      update: {
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        capacity: parsed.capacity,
        active: parsed.active
      },
      create: {
        id: `${parsed.organizationId}-${parsed.dayOfWeek}`,
        organizationId: parsed.organizationId,
        dayOfWeek: parsed.dayOfWeek,
        startTime: parsed.startTime,
        endTime: parsed.endTime,
        capacity: parsed.capacity,
        active: parsed.active
      }
    });
  } catch {
    await updateLocalAvailabilityRule(parsed);
  }

  if (contentType.includes("form")) return NextResponse.redirect(new URL("/app/calendar?schedule=saved", request.url), 303);
  return NextResponse.json({ ok: true });
}
