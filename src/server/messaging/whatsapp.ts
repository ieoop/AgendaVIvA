import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export function isWhatsAppConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export async function sendWhatsApp(input: { organizationId?: string; to: string; body: string }) {
  const configured = isWhatsAppConfigured();
  await prisma.whatsAppLog.create({
    data: {
      organizationId: input.organizationId,
      direction: "outbound",
      body: input.body,
      status: configured ? "queued_real" : "stored_demo",
      metadata: { to: input.to, provider: configured ? "meta_cloud_api" : "demo" }
    }
  });
  return {
    status: configured ? "queued_real" : "stored_demo",
    waUrl: `https://wa.me/${input.to.replace(/\D/g, "")}?text=${encodeURIComponent(input.body)}`
  };
}

export function instagramIntegrationStatus() {
  return {
    connected: false,
    mode: "demo",
    webhookUrl: absoluteUrl("/api/webhooks/instagram"),
    message: "Estructura lista para Meta Messaging. Activable cuando existan credenciales."
  };
}
