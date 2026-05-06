import { NextResponse } from "next/server";
import { z } from "zod";
import { aiService } from "@/server/ai/service";

const schema = z.object({
  message: z.string().min(1),
  locale: z.enum(["es-ES", "es-AR"]).default("es-AR")
});

export async function POST(request: Request) {
  const body = schema.parse(await request.json());
  const now = new Date();
  now.setHours(9, 0, 0, 0);
  const response = await aiService.respond(body.message, {
    assistantName: "Alma",
    locale: body.locale,
    tone: body.locale === "es-ES" ? "profesional cercano" : "cercano con voseo moderado",
    currency: body.locale === "es-ES" ? "EUR" : "ARS",
    businessName: body.locale === "es-ES" ? "Clínica Dental Norte" : "Estética Palermo",
    address: body.locale === "es-ES" ? "Calle Serrano 120, Madrid" : "Armenia 1580, Palermo, CABA",
    services: [
      { id: "svc1", name: "Limpieza facial", priceCents: body.locale === "es-ES" ? 6500 : 4200000, durationMinutes: 75, requiresDeposit: true }
    ],
    policies: ["Se puede reprogramar hasta 24 horas antes."],
    faqs: [["¿Puedo reprogramar?", "Sí, desde el link de confirmación."]],
    forbiddenMessages: ["diagnóstico médico"],
    handoffWhen: ["enojo", "urgencia", "confusión"]
  }, {
    from: now,
    days: 5,
    durationMinutes: 75,
    rules: [{ dayOfWeek: now.getDay(), startTime: "09:00", endTime: "18:00" }],
    exceptions: [],
    appointments: []
  });
  return NextResponse.json(response);
}
