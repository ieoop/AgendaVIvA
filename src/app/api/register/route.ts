import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { createLocalOrganization } from "@/server/local-store";
import { setSessionCookie } from "@/server/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  businessName: z.string().min(2).default("Mi negocio")
});

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = schema.parse(Object.fromEntries(form));
  const slug = slugify(parsed.businessName);

  try {
    const user = await prisma.user.upsert({
      where: { email: parsed.email },
      update: {},
      create: { email: parsed.email, name: parsed.email.split("@")[0], passwordHash: await bcrypt.hash(parsed.password, 12) }
    });
    const org = await prisma.organization.upsert({
      where: { slug },
      update: {},
      create: {
        name: parsed.businessName,
        slug,
        country: "AR",
        locale: "es-AR",
        currency: "ARS",
        timezone: "America/Argentina/Buenos_Aires",
        industry: "servicios",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        memberships: { create: { userId: user.id, role: "owner" } },
        profile: {
          create: {
            displayName: parsed.businessName,
            tagline: "La recepcionista IA que convierte mensajes en turnos pagados.",
            description: "Configurá servicios, horarios, pagos y Alma en menos de 10 minutos.",
            address: "Dirección a configurar",
            city: "Buenos Aires",
            aiConfig: { assistantName: "Alma", tone: "cercano", faqs: [], policies: [] }
          }
        }
      }
    });
    await prisma.auditLog.create({ data: { organizationId: org.id, userId: user.id, action: "organization.registered", entity: "Organization", entityId: org.id } });
    await setSessionCookie({ userId: user.id, organizationId: org.id, email: user.email, role: "owner" });
  } catch {
    const local = await createLocalOrganization({ email: parsed.email, password: parsed.password, businessName: parsed.businessName });
    await setSessionCookie({ userId: local.user.id, organizationId: local.organization.id, email: local.user.email, role: local.user.role });
    return NextResponse.redirect(new URL("/onboarding/country?mode=local", request.url), 303);
  }

  return NextResponse.redirect(new URL("/onboarding/country", request.url), 303);
}
