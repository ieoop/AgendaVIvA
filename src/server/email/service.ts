import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type SendEmailInput = {
  organizationId?: string;
  to: string;
  subject: string;
  html: string;
  metadata?: Record<string, unknown>;
};

export async function sendEmail(input: SendEmailInput) {
  if (process.env.RESEND_API_KEY) {
    await prisma.emailLog.create({
      data: { ...input, provider: "resend", status: "queued_real", metadata: (input.metadata ?? {}) as Prisma.InputJsonValue }
    });
    return { provider: "resend", status: "queued_real" };
  }

  await prisma.emailLog.create({
    data: { ...input, provider: "demo", status: "stored_demo", metadata: (input.metadata ?? {}) as Prisma.InputJsonValue }
  });
  return { provider: "demo", status: "stored_demo" };
}

export function appointmentEmailHtml(input: { businessName: string; serviceName: string; when: string; manageUrl: string }) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#0f172a;line-height:1.5">
      <h1 style="color:#0f766e">Reserva confirmada</h1>
      <p>${input.businessName} confirmó tu reserva para <strong>${input.serviceName}</strong>.</p>
      <p><strong>${input.when}</strong></p>
      <p><a href="${input.manageUrl}">Gestionar reserva</a></p>
      <p style="color:#64748b">Enviado por AgendaViva AI.</p>
    </div>
  `;
}
