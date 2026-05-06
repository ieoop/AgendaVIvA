export type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity?: number;
  staffId?: string | null;
};

export type AvailabilityException = {
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
  closed?: boolean;
  staffId?: string | null;
};

export type ExistingAppointment = {
  startAt: Date;
  endAt: Date;
  staffId?: string | null;
  status?: string;
};

export type AvailabilityInput = {
  from: Date;
  days: number;
  durationMinutes: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  staffId?: string | null;
  rules: AvailabilityRule[];
  exceptions: AvailabilityException[];
  appointments: ExistingAppointment[];
  slotStepMinutes?: number;
};

export type Slot = { startAt: Date; endAt: Date; staffId?: string | null };

const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

function withMinutes(base: Date, value: number) {
  const next = new Date(base);
  next.setHours(Math.floor(value / 60), value % 60, 0, 0);
  return next;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && bStart < aEnd;
}

export function getAvailableSlots(input: AvailabilityInput): Slot[] {
  const result: Slot[] = [];
  const step = input.slotStepMinutes ?? 15;
  const bufferBefore = input.bufferBeforeMinutes ?? 0;
  const bufferAfter = input.bufferAfterMinutes ?? 0;
  const blockedStatuses = new Set(["pending", "confirmed", "paid"]);

  for (let day = 0; day < input.days; day += 1) {
    const date = new Date(input.from);
    date.setDate(input.from.getDate() + day);
    date.setHours(0, 0, 0, 0);
    const jsDay = date.getDay();
    const rules = input.rules.filter((rule) => rule.dayOfWeek === jsDay && (!input.staffId || !rule.staffId || rule.staffId === input.staffId));
    const exceptions = input.exceptions.filter((exception) => dateKey(exception.date) === dateKey(date) && (!input.staffId || !exception.staffId || exception.staffId === input.staffId));
    if (exceptions.some((exception) => exception.closed)) continue;

    for (const rule of rules) {
      const start = minutes(rule.startTime);
      const end = minutes(rule.endTime);
      for (let cursor = start; cursor + input.durationMinutes <= end; cursor += step) {
        const startAt = withMinutes(date, cursor);
        const endAt = new Date(startAt.getTime() + input.durationMinutes * 60_000);
        const protectedStart = new Date(startAt.getTime() - bufferBefore * 60_000);
        const protectedEnd = new Date(endAt.getTime() + bufferAfter * 60_000);

        const exceptionBlocked = exceptions.some((exception) => {
          if (!exception.startTime || !exception.endTime) return false;
          return overlaps(protectedStart, protectedEnd, withMinutes(date, minutes(exception.startTime)), withMinutes(date, minutes(exception.endTime)));
        });
        if (exceptionBlocked) continue;

        const collisions = input.appointments.filter((appointment) => {
          if (appointment.status && !blockedStatuses.has(appointment.status)) return false;
          if (input.staffId && appointment.staffId && appointment.staffId !== input.staffId) return false;
          return overlaps(protectedStart, protectedEnd, appointment.startAt, appointment.endAt);
        }).length;

        if (collisions < (rule.capacity ?? 1) && startAt >= input.from) {
          result.push({ startAt, endAt, staffId: input.staffId ?? rule.staffId ?? null });
        }
      }
    }
  }

  return result.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

export function suggestNextSlots(input: AvailabilityInput, take = 5) {
  return getAvailableSlots(input).slice(0, take);
}
