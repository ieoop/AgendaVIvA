import { describe, expect, it } from "vitest";
import { getAvailableSlots, suggestNextSlots } from "@/server/availability";

describe("availability engine", () => {
  it("respects duration, buffers and existing appointments", () => {
    const from = new Date(2026, 4, 4, 9, 0, 0, 0);
    const slots = getAvailableSlots({
      from,
      days: 1,
      durationMinutes: 60,
      bufferAfterMinutes: 15,
      rules: [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00", capacity: 1 }],
      exceptions: [],
      appointments: [{ startAt: new Date(2026, 4, 4, 10, 30), endAt: new Date(2026, 4, 4, 11, 0), status: "confirmed" }]
    });

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].startAt.getHours()).toBe(9);
    expect(slots[0].startAt.getMinutes()).toBe(0);
    expect(slots.some((slot) => slot.startAt.getHours() === 10)).toBe(false);
  });

  it("suggests the next five slots", () => {
    const slots = suggestNextSlots({
      from: new Date("2026-05-04T09:00:00.000Z"),
      days: 2,
      durationMinutes: 30,
      rules: [{ dayOfWeek: 1, startTime: "09:00", endTime: "12:00" }, { dayOfWeek: 2, startTime: "09:00", endTime: "12:00" }],
      exceptions: [],
      appointments: []
    });

    expect(slots).toHaveLength(5);
  });
});
