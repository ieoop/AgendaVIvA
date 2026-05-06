import type { Role } from "@prisma/client";

const rank: Record<Role, number> = {
  owner: 4,
  admin: 3,
  staff: 2,
  viewer: 1
};

export function can(role: Role, action: "read" | "write" | "billing" | "admin") {
  if (action === "read") return rank[role] >= rank.viewer;
  if (action === "write") return rank[role] >= rank.staff;
  if (action === "billing") return rank[role] >= rank.admin;
  return rank[role] >= rank.owner;
}

export function assertSameTenant(resourceOrganizationId: string, activeOrganizationId: string) {
  if (resourceOrganizationId !== activeOrganizationId) {
    throw new Error("Cross-tenant access denied");
  }
}
