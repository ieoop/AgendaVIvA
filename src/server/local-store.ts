import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { createSecureToken } from "@/lib/security";
import { slugify } from "@/lib/utils";
import { getAvailableSlots } from "@/server/availability";

export type LocalService = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  requiresDeposit: boolean;
  depositValueCents: number | null;
  category: string;
  active: boolean;
  color: string;
};

export type LocalCustomer = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  tags: string[];
  totalSpentCents: number;
  noShowCount: number;
  consentMarketing: boolean;
  createdAt: string;
};

export type LocalAppointment = {
  id: string;
  organizationId: string;
  customerId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: "pending" | "confirmed" | "paid" | "completed" | "cancelled" | "no_show" | "rescheduled";
  paymentStatus: "none" | "pending" | "paid" | "refunded" | "failed";
  source: "public_page" | "ai_chat" | "manual" | "whatsapp" | "instagram" | "admin";
  cancelToken: string;
  rescheduleToken: string;
  notes?: string;
  createdAt: string;
};

export type LocalAvailabilityRule = {
  id: string;
  organizationId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  active: boolean;
};

export type LocalOrganization = {
  id: string;
  name: string;
  slug: string;
  country: "ES" | "AR" | "OTHER";
  locale: "es-ES" | "es-AR";
  currency: "EUR" | "ARS";
  timezone: string;
  industry: string;
  subscriptionPlan: string;
  trialEndsAt: string;
  status: string;
  profile: {
    displayName: string;
    tagline: string;
    description: string;
    address: string;
    city: string;
    assistantName: string;
    assistantTone: string;
    aiConfig: Record<string, unknown>;
  };
};

type LocalUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  organizationId: string;
  role: "owner" | "admin" | "staff" | "viewer";
};

export type LocalEmailLog = {
  id: string;
  organizationId: string;
  to: string;
  subject: string;
  html: string;
  status: string;
  createdAt: string;
};

type LocalDb = {
  users: LocalUser[];
  organizations: LocalOrganization[];
  services: LocalService[];
  availabilityRules: LocalAvailabilityRule[];
  customers: LocalCustomer[];
  appointments: LocalAppointment[];
  emailLogs: LocalEmailLog[];
};

const dbPath = path.join(process.cwd(), "data", "agendaviva.local.json");

function id(prefix: string) {
  return `${prefix}_${createSecureToken(8)}`;
}

async function defaultDb(): Promise<LocalDb> {
  const now = new Date();
  const org: LocalOrganization = {
    id: "local_org_ar",
    name: "Estética Palermo",
    slug: "estetica-palermo",
    country: "AR",
    locale: "es-AR",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
    industry: "estetica",
    subscriptionPlan: "growth",
    trialEndsAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "trialing",
    profile: {
      displayName: "Estética Palermo",
      tagline: "La recepcionista IA que convierte mensajes en turnos pagados.",
      description: "Reservas online, señas, recordatorios y recuperación de clientes con Alma.",
      address: "Armenia 1580, Palermo, CABA",
      city: "Buenos Aires",
      assistantName: "Alma",
      assistantTone: "cercano",
      aiConfig: { faqs: [], policies: ["Se puede reprogramar hasta 24 horas antes."] }
    }
  };

  const availabilityRules: LocalAvailabilityRule[] = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
    id: `local_rule_${dayOfWeek}`,
    organizationId: org.id,
    dayOfWeek,
    startTime: "09:00",
    endTime: "18:00",
    capacity: 1,
    active: true
  }));
  availabilityRules.push({
    id: "local_rule_6",
    organizationId: org.id,
    dayOfWeek: 6,
    startTime: "10:00",
    endTime: "14:00",
    capacity: 1,
    active: true
  });

  return {
    users: [
      {
        id: "local_user_owner",
        email: "owner.ar@agendaviva.ai",
        name: "Valeria Fernández",
        passwordHash: await bcrypt.hash("AgendaViva2026!", 12),
        organizationId: org.id,
        role: "owner"
      }
    ],
    organizations: [org],
    services: [
      {
        id: "local_service_facial",
        organizationId: org.id,
        name: "Limpieza facial profunda",
        description: "Tratamiento completo con extracción e hidratación.",
        durationMinutes: 75,
        priceCents: 4200000,
        requiresDeposit: true,
        depositValueCents: 840000,
        category: "Facial",
        active: true,
        color: "#0f766e"
      },
      {
        id: "local_service_cejas",
        organizationId: org.id,
        name: "Perfilado de cejas",
        description: "Diseño y perfilado personalizado.",
        durationMinutes: 30,
        priceCents: 1200000,
        requiresDeposit: false,
        depositValueCents: null,
        category: "Cejas",
        active: true,
        color: "#0891b2"
      }
    ],
    availabilityRules,
    customers: [],
    appointments: [],
    emailLogs: []
  };
}

async function readDb(): Promise<LocalDb> {
  try {
    const db = JSON.parse(await readFile(dbPath, "utf8")) as LocalDb;
    if (!db.availabilityRules) {
      db.availabilityRules = db.organizations.flatMap((org) => [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        id: id("rule"),
        organizationId: org.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "18:00",
        capacity: 1,
        active: true
      })));
      await writeDb(db);
    }
    return db;
  } catch {
    const db = await defaultDb();
    await writeDb(db);
    return db;
  }
}

async function writeDb(db: LocalDb) {
  await mkdir(path.dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export async function getLocalDb() {
  return readDb();
}

export async function authenticateLocalUser(email: string, password: string) {
  const db = await readDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function createLocalOrganization(input: { email: string; password: string; businessName: string; country?: "ES" | "AR" }) {
  const db = await readDb();
  const slugBase = slugify(input.businessName);
  const slug = db.organizations.some((org) => org.slug === slugBase) ? `${slugBase}-${db.organizations.length + 1}` : slugBase;
  const country = input.country ?? "AR";
  const org: LocalOrganization = {
    id: id("org"),
    name: input.businessName,
    slug,
    country,
    locale: country === "ES" ? "es-ES" : "es-AR",
    currency: country === "ES" ? "EUR" : "ARS",
    timezone: country === "ES" ? "Europe/Madrid" : "America/Argentina/Buenos_Aires",
    industry: "servicios",
    subscriptionPlan: "trial",
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: "trialing",
    profile: {
      displayName: input.businessName,
      tagline: country === "ES" ? "La recepcionista IA que convierte mensajes en citas pagadas." : "La recepcionista IA que convierte mensajes en turnos pagados.",
      description: "Tu página pública de reservas ya está lista para vender mientras configurás el resto.",
      address: "Dirección a configurar",
      city: country === "ES" ? "Madrid" : "Buenos Aires",
      assistantName: "Alma",
      assistantTone: "cercano",
      aiConfig: { faqs: [], policies: [] }
    }
  };
  const user: LocalUser = {
    id: id("user"),
    email: input.email,
    name: input.email.split("@")[0],
    passwordHash: await bcrypt.hash(input.password, 12),
    organizationId: org.id,
    role: "owner"
  };
  db.organizations.push(org);
  db.users.push(user);
  db.services.push({
    id: id("service"),
    organizationId: org.id,
    name: country === "ES" ? "Primera cita" : "Primer turno",
    description: "Servicio inicial editable.",
    durationMinutes: 45,
    priceCents: country === "ES" ? 3500 : 2500000,
    requiresDeposit: false,
    depositValueCents: null,
    category: "General",
    active: true,
    color: "#0f766e"
  });
  for (const dayOfWeek of [1, 2, 3, 4, 5]) {
    db.availabilityRules.push({
      id: id("rule"),
      organizationId: org.id,
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00",
      capacity: 1,
      active: true
    });
  }
  await writeDb(db);
  return { user, organization: org };
}

export async function getLocalBusinessBySlug(slug: string) {
  const db = await readDb();
  const organization = db.organizations.find((org) => org.slug === slug) ?? db.organizations[0];
  const services = db.services.filter((service) => service.organizationId === organization.id && service.active);
  return {
    ...organization,
    services,
    availabilityRules: db.availabilityRules.filter((rule) => rule.organizationId === organization.id && rule.active),
    availableSlots: getLocalSlotsFromDb(db, organization.id, services[0]?.id).slice(0, 12),
    customers: db.customers.filter((customer) => customer.organizationId === organization.id),
    appointments: db.appointments.filter((appointment) => appointment.organizationId === organization.id),
    emailLogs: db.emailLogs.filter((email) => email.organizationId === organization.id),
    payments: [],
    reviews: []
  };
}

function getLocalSlotsFromDb(db: LocalDb, organizationId: string, serviceId?: string) {
  const service = db.services.find((item) => item.id === serviceId && item.organizationId === organizationId)
    ?? db.services.find((item) => item.organizationId === organizationId);
  if (!service) return [];
  const from = new Date();
  const rules = db.availabilityRules
    .filter((rule) => rule.organizationId === organizationId && rule.active)
    .map((rule) => ({
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      capacity: rule.capacity
    }));
  return getAvailableSlots({
    from,
    days: 21,
    durationMinutes: service.durationMinutes,
    bufferAfterMinutes: 10,
    rules,
    exceptions: [],
    appointments: db.appointments
      .filter((appointment) => appointment.organizationId === organizationId)
      .map((appointment) => ({
        startAt: new Date(appointment.startAt),
        endAt: new Date(appointment.endAt),
        status: appointment.status
      }))
  });
}

export async function getLocalAvailableSlots(slug = "estetica-palermo", serviceId?: string) {
  const db = await readDb();
  const organization = db.organizations.find((org) => org.slug === slug) ?? db.organizations[0];
  return getLocalSlotsFromDb(db, organization.id, serviceId).slice(0, 20);
}

export async function updateLocalAvailabilityRule(input: {
  organizationId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity?: number;
  active?: boolean;
}) {
  const db = await readDb();
  const existing = db.availabilityRules.find((rule) => rule.organizationId === input.organizationId && rule.dayOfWeek === input.dayOfWeek);
  if (existing) {
    existing.startTime = input.startTime;
    existing.endTime = input.endTime;
    existing.capacity = input.capacity ?? existing.capacity;
    existing.active = input.active ?? true;
  } else {
    db.availabilityRules.push({
      id: id("rule"),
      organizationId: input.organizationId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      capacity: input.capacity ?? 1,
      active: input.active ?? true
    });
  }
  await writeDb(db);
  return db.availabilityRules.filter((rule) => rule.organizationId === input.organizationId);
}

export async function createLocalService(input: Omit<LocalService, "id" | "active" | "color"> & { color?: string }) {
  const db = await readDb();
  const service: LocalService = { ...input, id: id("service"), active: true, color: input.color ?? "#0f766e" };
  db.services.push(service);
  await writeDb(db);
  return service;
}

export async function createLocalBooking(input: { businessSlug: string; serviceId: string; name: string; email: string; slot?: string; source?: LocalAppointment["source"] }) {
  const db = await readDb();
  const organization = db.organizations.find((org) => org.slug === input.businessSlug) ?? db.organizations[0];
  const service = db.services.find((item) => item.id === input.serviceId && item.organizationId === organization.id) ?? db.services.find((item) => item.organizationId === organization.id);
  if (!service) throw new Error("No service available");
  const customer: LocalCustomer = {
    id: id("customer"),
    organizationId: organization.id,
    name: input.name,
    email: input.email,
    tags: ["public_page"],
    totalSpentCents: 0,
    noShowCount: 0,
    consentMarketing: false,
    createdAt: new Date().toISOString()
  };
  const requestedStart = input.slot && !Number.isNaN(Date.parse(input.slot)) ? new Date(input.slot) : null;
  const available = getLocalSlotsFromDb(db, organization.id, service.id);
  const chosenSlot = requestedStart
    ? available.find((slot) => slot.startAt.getTime() === requestedStart.getTime())
    : available[0];
  const startAt = chosenSlot?.startAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000);
  if (!chosenSlot) startAt.setHours(input.slot?.includes("12") ? 12 : 10, input.slot?.includes("16") ? 15 : 30, 0, 0);
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000);
  const appointment: LocalAppointment = {
    id: id("appointment"),
    organizationId: organization.id,
    customerId: customer.id,
    serviceId: service.id,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    status: service.requiresDeposit ? "pending" : "confirmed",
    paymentStatus: service.requiresDeposit ? "pending" : "none",
    source: input.source ?? "public_page",
    cancelToken: createSecureToken(),
    rescheduleToken: createSecureToken(),
    notes: "Reserva creada en modo local gratuito.",
    createdAt: new Date().toISOString()
  };
  db.customers.push(customer);
  db.appointments.push(appointment);
  db.emailLogs.push({
    id: id("email"),
    organizationId: organization.id,
    to: input.email,
    subject: "Reserva recibida",
    html: `<p>${organization.name} recibió tu reserva para ${service.name}.</p>`,
    status: "stored_local",
    createdAt: new Date().toISOString()
  });
  await writeDb(db);
  return { organization, service, customer, appointment };
}

export async function updateLocalAppointmentByToken(input: { token: string; action: "cancel" | "reschedule" | "review" }) {
  const db = await readDb();
  const appointment = db.appointments.find((item) => item.cancelToken === input.token || item.rescheduleToken === input.token);
  if (!appointment) return null;
  if (input.action === "cancel") appointment.status = "cancelled";
  if (input.action === "reschedule") {
    appointment.status = "rescheduled";
    const next = new Date(appointment.startAt);
    next.setDate(next.getDate() + 2);
    appointment.startAt = next.toISOString();
    appointment.endAt = new Date(next.getTime() + 45 * 60_000).toISOString();
  }
  await writeDb(db);
  return appointment;
}
