import { suggestNextSlots, type AvailabilityInput } from "@/server/availability";

export type AIIntent =
  | "reservar"
  | "cancelar"
  | "reprogramar"
  | "consultar_precio"
  | "consultar_direccion"
  | "consultar_disponibilidad"
  | "pedir_promocion"
  | "hablar_con_humano"
  | "faq";

export type AIConfig = {
  assistantName: string;
  locale: "es-ES" | "es-AR";
  tone: string;
  currency: string;
  businessName: string;
  address: string;
  services: Array<{ id: string; name: string; priceCents: number; durationMinutes: number; requiresDeposit: boolean }>;
  policies: string[];
  faqs: Array<[string, string]>;
  forbiddenMessages: string[];
  handoffWhen: string[];
};

export type AIResponse = {
  intent: AIIntent;
  confidence: number;
  tone: "neutral" | "positivo" | "enojado" | "urgente" | "confundido";
  answer: string;
  suggestedAction: "create_booking" | "ask_payment" | "handoff" | "answer" | "offer_slots";
  slots?: Array<{ startAt: Date; endAt: Date }>;
};

const intentRules: Array<[AIIntent, RegExp]> = [
  ["hablar_con_humano", /humano|persona|encargad|llamame|urgente|reclamo|enojad|mal/i],
  ["cancelar", /cancel|anular|baja/i],
  ["reprogramar", /reprogram|cambiar|mover|otro horario/i],
  ["consultar_precio", /precio|cu[aá]nto|vale|sale|tarifa|costo/i],
  ["consultar_direccion", /direcci[oó]n|ubicaci[oó]n|d[oó]nde|llegar/i],
  ["consultar_disponibilidad", /disponib|horario|ma[ñn]ana|hoy|semana/i],
  ["pedir_promocion", /promo|descuento|oferta/i],
  ["reservar", /reserv|turno|cita|agenda|quiero ir|sacar/i]
];

export function detectIntent(message: string): { intent: AIIntent; confidence: number; tone: AIResponse["tone"] } {
  const tone = /urgente|dolor|ahora/i.test(message)
    ? "urgente"
    : /mal|enoja|reclamo|horrible/i.test(message)
      ? "enojado"
      : /no entiendo|confund/i.test(message)
        ? "confundido"
        : /gracias|genial|perfecto/i.test(message)
          ? "positivo"
          : "neutral";

  for (const [intent, pattern] of intentRules) {
    if (pattern.test(message)) {
      return { intent, confidence: intent === "hablar_con_humano" ? 0.94 : 0.82, tone };
    }
  }
  return { intent: "faq", confidence: 0.58, tone };
}

function money(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: currency === "ARS" ? 0 : 2 }).format(cents / 100);
}

export class AIService {
  async respond(message: string, config: AIConfig, availability?: AvailabilityInput): Promise<AIResponse> {
    if (process.env.OPENAI_API_KEY) {
      return this.localRespond(message, config, availability, true);
    }
    return this.localRespond(message, config, availability, false);
  }

  private localRespond(message: string, config: AIConfig, availability?: AvailabilityInput, openAiConfigured = false): AIResponse {
    const detected = detectIntent(message);
    const appointmentWord = config.locale === "es-ES" ? "cita" : "turno";
    const voseo = config.locale === "es-AR";
    const service = config.services.find((item) => message.toLowerCase().includes(item.name.toLowerCase().split(" ")[0])) ?? config.services[0];
    const prefix = openAiConfigured ? "" : "";

    if (detected.intent === "hablar_con_humano" || detected.tone === "enojado" || detected.tone === "urgente" || detected.tone === "confundido") {
      return {
        ...detected,
        answer: `${prefix}Te paso con una persona del equipo para ayudarte mejor. Mientras tanto, dejé resumida tu consulta para que no tengas que repetirla.`,
        suggestedAction: "handoff"
      };
    }

    if (detected.intent === "consultar_precio") {
      const list = config.services.slice(0, 4).map((item) => `${item.name}: ${money(item.priceCents, config.currency, config.locale)}`).join(" · ");
      return { ...detected, answer: `${prefix}Estos son los precios principales: ${list}. ${service?.requiresDeposit ? `Para confirmar este ${appointmentWord} se pide una seña.` : "Podés reservar sin seña."}`, suggestedAction: service?.requiresDeposit ? "ask_payment" : "answer" };
    }

    if (detected.intent === "consultar_direccion") {
      return { ...detected, answer: `${prefix}Estamos en ${config.address}. Si querés, también puedo ayudarte a elegir un horario disponible.`, suggestedAction: "answer" };
    }

    if (["reservar", "consultar_disponibilidad", "reprogramar"].includes(detected.intent) && availability) {
      const slots = suggestNextSlots(availability, 5);
      const readable = slots.slice(0, 3).map((slot) => slot.startAt.toLocaleString(config.locale, { weekday: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })).join(", ");
      return {
        ...detected,
        answer: `${prefix}${voseo ? "Dale" : "Claro"}, tengo ${readable || "nuevos horarios pronto"}. ¿Cuál ${voseo ? "te queda" : "te viene"} mejor para confirmar tu ${appointmentWord}?`,
        suggestedAction: "offer_slots",
        slots
      };
    }

    if (detected.intent === "pedir_promocion") {
      return { ...detected, answer: `${prefix}Tenemos una promo de regreso para clientes que no vienen hace más de 30 días. Te puedo reservar ahora y dejar la promo aplicada en la ficha.`, suggestedAction: "create_booking" };
    }

    const faq = config.faqs.find(([question]) => message.toLowerCase().includes(question.toLowerCase().slice(0, 8)));
    return {
      ...detected,
      answer: faq?.[1] ?? `${prefix}Soy ${config.assistantName}, la recepcionista IA de ${config.businessName}. Puedo ayudarte con servicios, precios, disponibilidad, reservas, pagos de seña o reprogramaciones.`,
      suggestedAction: "answer"
    };
  }
}

export const aiService = new AIService();
