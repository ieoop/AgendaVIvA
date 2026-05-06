import { describe, expect, it } from "vitest";
import { AIService, detectIntent } from "@/server/ai/service";

const config = {
  assistantName: "Alma",
  locale: "es-AR" as const,
  tone: "cercano",
  currency: "ARS",
  businessName: "Estética Palermo",
  address: "Armenia 1580, Palermo",
  services: [{ id: "1", name: "Limpieza facial", priceCents: 4200000, durationMinutes: 75, requiresDeposit: true }],
  policies: ["Reprogramación 24h antes."],
  faqs: [["¿Puedo reprogramar?", "Sí, desde el link."]] as [string, string][],
  forbiddenMessages: ["diagnóstico médico"],
  handoffWhen: ["enojo"]
};

describe("local AI service", () => {
  it("detects booking intent", () => {
    expect(detectIntent("quiero un turno mañana").intent).toBe("consultar_disponibilidad");
  });

  it("hands off angry customers", async () => {
    const response = await new AIService().respond("estoy enojado quiero hablar con una persona", config);
    expect(response.suggestedAction).toBe("handoff");
  });

  it("answers price questions with service price", async () => {
    const response = await new AIService().respond("cuánto sale limpieza facial", config);
    expect(response.answer).toContain("Limpieza facial");
    expect(response.suggestedAction).toBe("ask_payment");
  });
});
