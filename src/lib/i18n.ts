import type { Country } from "@prisma/client";

export type LocaleConfig = {
  country: Country;
  locale: "es-ES" | "es-AR";
  currency: "EUR" | "ARS";
  appointmentWord: "cita" | "turno";
  appointmentWordPlural: "citas" | "turnos";
  reserveCta: string;
  paymentPrimary: string;
  tone: string;
};

export const locales: Record<"ES" | "AR", LocaleConfig> = {
  ES: {
    country: "ES",
    locale: "es-ES",
    currency: "EUR",
    appointmentWord: "cita",
    appointmentWordPlural: "citas",
    reserveCta: "Reserva tu cita",
    paymentPrimary: "Stripe",
    tone: "formal cercano"
  },
  AR: {
    country: "AR",
    locale: "es-AR",
    currency: "ARS",
    appointmentWord: "turno",
    appointmentWordPlural: "turnos",
    reserveCta: "Reservá tu turno",
    paymentPrimary: "Mercado Pago",
    tone: "cercano con voseo moderado"
  }
};

export function getLocaleConfig(country: Country | "ES" | "AR" | "OTHER" = "AR") {
  return country === "ES" ? locales.ES : locales.AR;
}
