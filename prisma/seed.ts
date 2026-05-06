import { PrismaClient, type Country, type ProviderName, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

const addDays = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const token = () => randomBytes(24).toString("hex");

async function seedPlans() {
  const plans = [
    ["trial", "ES", "EUR", 0, 0, { users: 1, locations: 1, appointments: 20, aiMessages: 100, campaigns: 1 }, ["Página pública", "IA demo", "20 reservas demo"]],
    ["starter", "ES", "EUR", 1900, 19000, { users: 2, locations: 1, appointments: 100, aiMessages: 500, campaigns: 2 }, ["Página pública", "Recordatorios email", "Asistente IA básico"]],
    ["growth", "ES", "EUR", 4900, 49000, { users: 10, locations: 3, appointments: 99999, aiMessages: 3000, campaigns: 10 }, ["WhatsApp/Instagram", "Señas y pagos", "Campañas", "Reseñas", "Analytics"]],
    ["pro", "ES", "EUR", 9900, 99000, { users: 50, locations: 10, appointments: 99999, aiMessages: 10000, campaigns: 999 }, ["Multiubicación", "IA avanzada", "API", "Marca blanca parcial"]],
    ["starter", "AR", "ARS", 2900000, 29000000, { users: 2, locations: 1, appointments: 100, aiMessages: 500, campaigns: 2 }, ["Página pública", "Recordatorios email", "Asistente IA básico"]],
    ["growth", "AR", "ARS", 6900000, 69000000, { users: 10, locations: 3, appointments: 99999, aiMessages: 3000, campaigns: 10 }, ["Mercado Pago", "Señas", "Campañas", "Reseñas", "Analytics"]],
    ["pro", "AR", "ARS", 13900000, 139000000, { users: 50, locations: 10, appointments: 99999, aiMessages: 10000, campaigns: 999 }, ["Multiubicación", "IA avanzada", "API", "Marca blanca parcial"]]
  ] as const;

  for (const [name, country, currency, monthlyPrice, yearlyPrice, limits, features] of plans) {
    await prisma.plan.upsert({
      where: { name_country: { name, country: country as Country } },
      update: { currency, monthlyPrice, yearlyPrice, limits, features: [...features] },
      create: { name, country: country as Country, currency, monthlyPrice, yearlyPrice, limits, features: [...features] }
    });
  }
}

async function createOrg(input: {
  name: string;
  slug: string;
  country: Country;
  locale: string;
  currency: string;
  timezone: string;
  industry: string;
  city: string;
  address: string;
  services: Array<[string, string, number, number, boolean, string]>;
  ownerEmail: string;
  ownerName: string;
  provider: ProviderName;
}) {
  const owner = await prisma.user.upsert({
    where: { email: input.ownerEmail },
    update: {},
    create: {
      email: input.ownerEmail,
      name: input.ownerName,
      passwordHash: await bcrypt.hash("AgendaViva2026!", 12)
    }
  });

  const org = await prisma.organization.upsert({
    where: { slug: input.slug },
    update: {},
    create: {
      name: input.name,
      slug: input.slug,
      country: input.country,
      locale: input.locale,
      currency: input.currency,
      timezone: input.timezone,
      industry: input.industry,
      trialEndsAt: addDays(14),
      subscriptionPlan: "growth",
      status: "trialing",
      memberships: { create: { userId: owner.id, role: "owner" as Role } },
      profile: {
        create: {
          displayName: input.name,
          tagline: input.country === "ES" ? "La recepcionista IA que convierte mensajes en citas pagadas." : "La recepcionista IA que convierte mensajes en turnos pagados.",
          description: "Agenda online, pagos de reserva, recordatorios y seguimiento comercial con Alma, tu recepcionista IA.",
          address: input.address,
          city: input.city,
          whatsapp: input.country === "ES" ? "+34910000000" : "+5491100000000",
          instagram: "@agendaviva_demo",
          aiConfig: {
            assistantName: "Alma",
            tone: input.country === "ES" ? "profesional cercano" : "cercano con voseo moderado",
            forbiddenMessages: ["diagnósticos médicos", "promesas legales"],
            handoffWhen: ["enojo", "urgencia", "confusión", "precio no configurado"],
            faqs: [
              ["¿Puedo reprogramar?", "Sí, desde el enlace de confirmación hasta 24 horas antes."],
              ["¿Hay que pagar seña?", "Algunos servicios requieren una seña para reducir ausencias."]
            ]
          }
        }
      }
    }
  });

  await prisma.membership.upsert({
    where: { userId_organizationId: { userId: owner.id, organizationId: org.id } },
    update: { role: "owner" },
    create: { userId: owner.id, organizationId: org.id, role: "owner" }
  });

  const location = await prisma.location.upsert({
    where: { id: `${input.slug}-location` },
    update: {},
    create: { id: `${input.slug}-location`, organizationId: org.id, name: "Sede principal", address: input.address, timezone: input.timezone }
  });

  const staff = await prisma.staffProfile.upsert({
    where: { id: `${input.slug}-staff` },
    update: {},
    create: { id: `${input.slug}-staff`, organizationId: org.id, locationId: location.id, name: input.country === "ES" ? "Equipo Norte" : "Equipo Palermo", title: "Especialistas" }
  });

  for (const [name, description, durationMinutes, priceCents, requiresDeposit, category] of input.services) {
    const service = await prisma.service.create({
      data: {
        organizationId: org.id,
        name,
        description,
        durationMinutes,
        priceCents,
        requiresDeposit,
        depositValueCents: requiresDeposit ? Math.round(priceCents * 0.2) : null,
        category,
        bufferAfterMinutes: 10,
        staff: { create: { staffId: staff.id } }
      }
    });

    await prisma.auditLog.create({ data: { organizationId: org.id, userId: owner.id, action: "service.seeded", entity: "Service", entityId: service.id } });
  }

  for (const dayOfWeek of [1, 2, 3, 4, 5]) {
    await prisma.availabilityRule.create({ data: { organizationId: org.id, staffId: staff.id, dayOfWeek, startTime: "09:00", endTime: "18:00", capacity: 1 } });
  }
  await prisma.availabilityRule.create({ data: { organizationId: org.id, staffId: staff.id, dayOfWeek: 6, startTime: "10:00", endTime: "14:00", capacity: 1 } });

  for (const provider of ["demo", input.provider, "manual_transfer", "redsys"] as ProviderName[]) {
    await prisma.paymentProviderConfig.upsert({
      where: { organizationId_provider: { organizationId: org.id, provider } },
      update: {},
      create: {
        organizationId: org.id,
        provider,
        enabled: provider === "demo" || provider === input.provider || provider === "manual_transfer",
        mode: provider === "demo" ? "demo" : "sandbox",
        status: provider === input.provider ? "configured_demo" : provider === "manual_transfer" ? "configured" : "requires_configuration",
        publicConfig: provider === "manual_transfer" ? { alias: input.country === "AR" ? "agendaviva.demo" : "IBAN demo configurable", qrText: "Pago manual AgendaViva AI" } : {}
      }
    });
  }

  const customerNames = input.country === "ES"
    ? ["Lucía Martín", "Carlos Pérez", "Ana Torres", "Miguel Ruiz", "Sofía Ortega", "Javier Blanco", "Marta León", "Diego Molina", "Elena Castro", "Pablo Vidal"]
    : ["Martina Suárez", "Nicolás Gómez", "Valentina Ríos", "Federico Castro", "Camila Moreno", "Agustín Silva", "Sofía Benítez", "Tomás Álvarez", "Julieta Vega", "Mateo Pereyra"];

  const services = await prisma.service.findMany({ where: { organizationId: org.id } });
  for (let i = 0; i < customerNames.length; i += 1) {
    const customer = await prisma.customer.create({
      data: {
        organizationId: org.id,
        name: customerNames[i],
        email: `cliente${i + 1}.${input.slug}@example.com`,
        phone: input.country === "ES" ? `+34600000${String(i).padStart(3, "0")}` : `+54911000${String(i).padStart(4, "0")}`,
        country: input.country,
        tags: i % 3 === 0 ? ["vip", "recurrente"] : ["nuevo"],
        totalAppointments: i + 1,
        totalSpentCents: services[i % services.length].priceCents * (i + 1),
        consentMarketing: i % 2 === 0,
        source: i % 2 === 0 ? "ai_chat" : "public_page"
      }
    });

    for (let j = 0; j < 2; j += 1) {
      const service = services[(i + j) % services.length];
      const startAt = addDays(i - 4 + j * 8);
      startAt.setHours(10 + (i % 6), j === 0 ? 0 : 30, 0, 0);
      const endAt = new Date(startAt.getTime() + service.durationMinutes * 60 * 1000);
      const status = i + j < 8 ? "completed" : i % 5 === 0 ? "pending" : "confirmed";
      const appointment = await prisma.appointment.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          serviceId: service.id,
          staffId: staff.id,
          locationId: location.id,
          startAt,
          endAt,
          status,
          paymentStatus: service.requiresDeposit ? "paid" : "none",
          source: i % 3 === 0 ? "ai_chat" : "public_page",
          notes: "Reserva demo creada por seed.",
          cancelToken: token(),
          rescheduleToken: token()
        }
      });
      if (service.requiresDeposit) {
        await prisma.payment.create({
          data: {
            organizationId: org.id,
            appointmentId: appointment.id,
            provider: input.provider,
            kind: "deposit",
            amountCents: service.depositValueCents ?? Math.round(service.priceCents * 0.2),
            currency: input.currency,
            status: "paid",
            externalId: `demo_${token().slice(0, 10)}`
          }
        });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        channel: i % 2 === 0 ? "whatsapp" : "web",
        summary: "Cliente consultó disponibilidad y recibió horarios sugeridos por Alma.",
        messages: {
          create: [
            { sender: "customer", body: input.country === "ES" ? "Hola, quiero una cita para mañana." : "Hola, quiero un turno para mañana." },
            { sender: "ai", body: input.country === "ES" ? "Claro, tengo 10:30 o 16:00. ¿Cuál te viene mejor?" : "Dale, tengo 10:30 o 16:00. ¿Cuál te queda mejor?" }
          ]
        }
      }
    });
    await prisma.whatsAppLog.create({ data: { organizationId: org.id, direction: "outbound", body: `Respuesta demo para ${customer.name}`, status: "sent_demo", metadata: { conversationId: conversation.id } } });
  }

  await prisma.automation.createMany({
    data: [
      { organizationId: org.id, name: "Confirmación inmediata", trigger: "appointment_created", actions: { send_email: true, send_whatsapp_template: true } },
      { organizationId: org.id, name: "Recordatorio 24h", trigger: "appointment_24h_before", actions: { send_email: true, create_task: false } },
      { organizationId: org.id, name: "Pedido de reseña", trigger: "appointment_completed", actions: { request_review: true } },
      { organizationId: org.id, name: "Clientes que podés recuperar", trigger: "customer_inactive_30_days", actions: { send_discount: true } }
    ],
    skipDuplicates: true
  });

  await prisma.campaign.create({
    data: {
      organizationId: org.id,
      name: input.country === "ES" ? "Vuelve este mes con tu cita favorita" : "Volvé este mes con tu turno favorito",
      segment: { inactiveDays: 30 },
      channel: "email_demo",
      status: "sent_demo",
      metrics: { sent: 42, opened: 27, clicks: 9, bookings: 4, estimatedRevenueCents: 84000 }
    }
  });

  await prisma.review.createMany({
    data: [
      { organizationId: org.id, rating: 5, publicText: "Reservé en dos minutos y el recordatorio me salvó.", source: "demo" },
      { organizationId: org.id, rating: 4, publicText: "Muy cómodo el link de reservas.", source: "demo" },
      { organizationId: org.id, rating: 5, publicText: "La atención automática fuera de horario suma muchísimo.", source: "demo" }
    ]
  });

  for (const key of ["whatsapp_integration", "instagram_integration", "ai_receptionist", "campaigns", "reviews", "payments", "referrals", "white_label"]) {
    await prisma.featureFlag.upsert({
      where: { organizationId_key: { organizationId: org.id, key } },
      update: { enabled: key !== "white_label" },
      create: { organizationId: org.id, key, enabled: key !== "white_label", rollout: 100 }
    });
  }

  await prisma.emailLog.create({
    data: {
      organizationId: org.id,
      to: owner.email,
      subject: "Bienvenido a AgendaViva AI",
      html: `<p>Alma ya está lista para convertir mensajes en ${input.country === "ES" ? "citas" : "turnos"} pagados.</p>`,
      metadata: { seed: true }
    }
  });

  await prisma.referral.upsert({
    where: { code: `${input.slug.toUpperCase().replaceAll("-", "")}1MES` },
    update: {},
    create: { organizationId: org.id, code: `${input.slug.toUpperCase().replaceAll("-", "")}1MES`, rewardStatus: "ready" }
  });

  return org;
}

async function main() {
  await seedPlans();

  await createOrg({
    name: "Clínica Dental Norte",
    slug: "clinica-dental-norte",
    country: "ES",
    locale: "es-ES",
    currency: "EUR",
    timezone: "Europe/Madrid",
    industry: "clinicas",
    city: "Madrid",
    address: "Calle Serrano 120, Madrid",
    ownerEmail: "owner.es@agendaviva.ai",
    ownerName: "Elena García",
    provider: "stripe",
    services: [
      ["Limpieza dental", "Higiene profesional con revisión inicial.", 45, 6500, true, "Odontología"],
      ["Primera consulta", "Diagnóstico y plan de tratamiento.", 30, 4500, false, "Consulta"],
      ["Blanqueamiento", "Tratamiento estético dental supervisado.", 60, 18000, true, "Estética dental"]
    ]
  });

  await createOrg({
    name: "Estética Palermo",
    slug: "estetica-palermo",
    country: "AR",
    locale: "es-AR",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
    industry: "estetica",
    city: "Buenos Aires",
    address: "Armenia 1580, Palermo, CABA",
    ownerEmail: "owner.ar@agendaviva.ai",
    ownerName: "Valeria Fernández",
    provider: "mercado_pago",
    services: [
      ["Limpieza facial profunda", "Tratamiento completo con extracción e hidratación.", 75, 4200000, true, "Facial"],
      ["Perfilado de cejas", "Diseño y perfilado personalizado.", 30, 1200000, false, "Cejas"],
      ["Depilación láser sesión", "Sesión por zona con equipo profesional.", 45, 3000000, true, "Depilación"]
    ]
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@agendaviva.ai" },
    update: { isSuperAdmin: true },
    create: {
      email: "admin@agendaviva.ai",
      name: "Admin AgendaViva",
      isSuperAdmin: true,
      passwordHash: await bcrypt.hash("AgendaViva2026!", 12)
    }
  });

  await prisma.auditLog.create({ data: { userId: admin.id, action: "seed.completed", entity: "System", metadata: { demoUsers: ["owner.es@agendaviva.ai", "owner.ar@agendaviva.ai", "admin@agendaviva.ai"], password: "AgendaViva2026!" } } });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("AgendaViva AI demo data ready.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
