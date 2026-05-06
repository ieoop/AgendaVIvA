import { describe, expect, it } from "vitest";
import { assertSameTenant, can } from "@/server/permissions";

describe("permissions", () => {
  it("limits billing to admin and owner", () => {
    expect(can("staff", "billing")).toBe(false);
    expect(can("admin", "billing")).toBe(true);
  });

  it("rejects cross-tenant access", () => {
    expect(() => assertSameTenant("org_a", "org_b")).toThrow("Cross-tenant");
  });
});
