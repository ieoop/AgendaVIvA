import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSecureToken } from "@/lib/security";
import { appointmentEmailHtml, sendEmail } from "@/server/email/service";
import { getPaymentProvider } from "@/server/payments/providers";
import { createLocalBooking } from "@/server/local-store";

const schema = z.object({
  businessSlug: z.string().min(1),
  serviceId: z.string().min(1),
  slot: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email()
});

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const data = contentType.includes("form")
    ? Object.fromEntries(await request.formData())
    : await request.json();
  const parsed = schema.parse(data);

  try {
    const org = await prisma.organization.findUniqueOrThrow({
      where: { slug: parsed.businessSlug },
      include: { services: { where: { id: parsed.serviceId }, take: 1 }, profile: true, locations: { take: 1 }, staffProfiles: { take: 1 } }
    });
    const service = org.services[0] ?? await prisma.service.findFirstOrThrow({ where: { organizationId: org.id } });
    const startAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    startAt.setHours(10, 30, 0, 0);
    const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000);
    const customer = await prisma.customer.create({
      data: { organizationId: org.id, name: parsed.name, email: parsed.email, country: org.country, tags: ["public_page"], consentMarketing: false }
    });
    const appointment = await prisma.appointment.create({
      data: {
        organizationId: org.id,
        customerId: customer.id,
        serviceId: service.id,
        staffId: org.staffProfiles[0]?.id,
        locationId: org.locations[0]?.id,
        startAt,
        endAt,
        status: service.requiresDeposit ? "pending" : "confirmed",
        paymentStatus: service.requiresDeposit ? "pending" : "none",
        source: "public_page",
        cancelToken: createSecureToken(),
        rescheduleToken: createSecureToken()
      }
    });
    await sendEmail({
      organizationId: org.id,
      to: parsed.email,
      subject: "Reserva recibida",
      html: appointmentEmailHtml({ businessName: org.name, serviceName: service.name, when: startAt.toLocaleString(org.locale), manageUrl: `${process.env.APP_URL ?? "http://localhost:3000"}/b/${org.slug}/reschedule/${appointment.rescheduleToken}` }),
      metadata: { appointmentId: appointment.id }
    });
    if (service.requiresDeposit) {
      const provider = getPaymentProvider(org.country);
      await provider.createDepositPayment({ organizationId: org.id, appointmentId: appointment.id, amountCents: service.depositValueCents ?? Math.round(service.priceCents * 0.2), currency: org.currency, description: `Seña ${service.name}` });
    }
    return NextResponse.redirect(new URL(`/b/${org.slug}?booked=1`, request.url), 303);
  } catch {
    await createLocalBooking({
      businessSlug: parsed.businessSlug,
      serviceId: parsed.serviceId,
      name: parsed.name,
      email: parsed.email,
      slot: parsed.slot
    });
    return NextResponse.redirect(new URL(`/b/${parsed.businessSlug}?booked=local`, request.url), 303);
  }
}
