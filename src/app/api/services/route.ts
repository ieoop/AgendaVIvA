import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { demoBusinessFallback } from "@/lib/demo";
import { createLocalService, getLocalDb } from "@/server/local-store";

const schema = z.object({
  organizationId: z.string().default("local_org_ar"),
  name: z.string().min(2),
  description: z.string().default("Servicio creado desde el panel."),
  durationMinutes: z.coerce.number().int().min(15).max(480),
  price: z.coerce.number().min(0),
  requiresDeposit: z.coerce.boolean().default(false),
  deposit: z.coerce.number().min(0).optional(),
  category: z.string().default("General")
});

export async function GET() {
  try {
    return NextResponse.json({ services: await prisma.service.findMany({ take: 50, orderBy: { createdAt: "desc" } }) });
  } catch {
    const db = await getLocalDb();
    return NextResponse.json({ services: db.services });
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const data = contentType.includes("form")
    ? Object.fromEntries(await request.formData())
    : await request.json();
  const parsed = schema.parse(data);

  try {
    const service = await prisma.service.create({
      data: {
        organizationId: parsed.organizationId,
        name: parsed.name,
        description: parsed.description,
        durationMinutes: parsed.durationMinutes,
        priceCents: Math.round(parsed.price * 100),
        requiresDeposit: parsed.requiresDeposit,
        depositValueCents: parsed.deposit ? Math.round(parsed.deposit * 100) : null,
        category: parsed.category
      }
    });
    if (contentType.includes("form")) return NextResponse.redirect(new URL("/app/services?saved=1", request.url), 303);
    return NextResponse.json({ service }, { status: 201 });
  } catch {
    const service = await createLocalService({
      organizationId: parsed.organizationId,
      name: parsed.name,
      description: parsed.description,
      durationMinutes: parsed.durationMinutes,
      priceCents: Math.round(parsed.price * 100),
      requiresDeposit: parsed.requiresDeposit,
      depositValueCents: parsed.deposit ? Math.round(parsed.deposit * 100) : null,
      category: parsed.category
    });
    if (contentType.includes("form")) return NextResponse.redirect(new URL("/app/services?saved=local", request.url), 303);
    return NextResponse.json({ service, mode: "local" }, { status: 201 });
  }
}
