import { prisma } from "@/lib/prisma";
import { getLocalBusinessBySlug } from "@/server/local-store";

export const industries = [
  "Barberías",
  "Estética",
  "Clínicas",
  "Veterinarias",
  "Talleres",
  "Entrenadores",
  "Odontólogos",
  "Psicólogos",
  "Academias",
  "Spas"
];

export const integrations = ["WhatsApp Business", "Instagram", "Google Calendar", "Stripe", "Mercado Pago", "Redsys/Bizum", "Email", "Web chat"];

export const demoBusinessFallback = {
  id: "demo-org",
  name: "Estética Palermo",
  slug: "estetica-palermo",
  country: "AR" as const,
  locale: "es-AR",
  currency: "ARS",
  timezone: "America/Argentina/Buenos_Aires",
  industry: "estetica",
  trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  subscriptionPlan: "growth",
  status: "trialing",
  profile: {
    displayName: "Estética Palermo",
    tagline: "La recepcionista IA que convierte mensajes en turnos pagados.",
    description: "Tratamientos faciales, cejas y depilación con reservas online, señas y recordatorios automáticos.",
    address: "Armenia 1580, Palermo, CABA",
    city: "Buenos Aires",
    assistantName: "Alma"
  },
  services: [
    { id: "svc1", name: "Limpieza facial profunda", description: "Tratamiento completo con extracción e hidratación.", durationMinutes: 75, priceCents: 4200000, requiresDeposit: true, depositValueCents: 840000, category: "Facial", color: "#0f766e" },
    { id: "svc2", name: "Perfilado de cejas", description: "Diseño y perfilado personalizado.", durationMinutes: 30, priceCents: 1200000, requiresDeposit: false, depositValueCents: null, category: "Cejas", color: "#0891b2" },
    { id: "svc3", name: "Depilación láser sesión", description: "Sesión por zona con equipo profesional.", durationMinutes: 45, priceCents: 3000000, requiresDeposit: true, depositValueCents: 600000, category: "Depilación", color: "#16a34a" }
  ],
  customers: [
    { id: "c1", name: "Martina Suárez", tags: ["vip"], totalSpentCents: 22000000, noShowCount: 0 },
    { id: "c2", name: "Nicolás Gómez", tags: ["nuevo"], totalSpentCents: 4200000, noShowCount: 1 },
    { id: "c3", name: "Valentina Ríos", tags: ["recuperable"], totalSpentCents: 18000000, noShowCount: 0 }
  ]
};

export async function getBusinessBySlug(slug = "estetica-palermo") {
  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      include: {
        profile: true,
        services: { where: { active: true }, take: 6 },
        customers: { take: 6, orderBy: { createdAt: "desc" } },
        appointments: { take: 8, orderBy: { startAt: "asc" }, include: { customer: true, service: true } },
        payments: { take: 6, orderBy: { createdAt: "desc" } },
        reviews: { take: 5, orderBy: { createdAt: "desc" } },
        emailLogs: { take: 8, orderBy: { createdAt: "desc" } }
      }
    });
    return org ?? demoBusinessFallback;
  } catch {
    return getLocalBusinessBySlug(slug);
  }
}

export const routeTitles: Record<string, string> = {
  "/app/calendar": "Calendario que evita huecos muertos",
  "/app/appointments": "Reservas, pagos y estados",
  "/app/customers": "Clientes que podés recuperar",
  "/app/services": "Servicios que Alma puede vender",
  "/app/conversations": "Bandeja inteligente de conversaciones",
  "/app/ai-receptionist": "Alma, tu recepcionista IA",
  "/app/automations": "Automatizaciones que recuperan tiempo y dinero",
  "/app/campaigns": "Campañas para llenar la agenda",
  "/app/reviews": "Reseñas que convierten confianza en reservas",
  "/app/payments": "Señas, pagos y transferencias",
  "/app/analytics": "Dinero potencial recuperado",
  "/app/team": "Equipo y permisos",
  "/app/settings": "Configuración del negocio",
  "/app/billing": "Plan, límites y facturación",
  "/app/integrations": "Canales conectados"
};
