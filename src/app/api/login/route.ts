import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateLocalUser } from "@/server/local-store";
import { setSessionCookie } from "@/server/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const parsed = schema.parse(Object.fromEntries(await request.formData()));

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      include: { memberships: { where: { active: true }, take: 1 } }
    });
    if (user?.passwordHash && await bcrypt.compare(parsed.password, user.passwordHash)) {
      const membership = user.memberships[0];
      if (membership) {
        await setSessionCookie({ userId: user.id, organizationId: membership.organizationId, email: user.email, role: membership.role });
        return NextResponse.redirect(new URL("/app", request.url), 303);
      }
    }
  } catch {
    // Fall through to the zero-cost local JSON store.
  }

  const localUser = await authenticateLocalUser(parsed.email, parsed.password);
  if (localUser) {
    await setSessionCookie({ userId: localUser.id, organizationId: localUser.organizationId, email: localUser.email, role: localUser.role });
    return NextResponse.redirect(new URL("/app", request.url), 303);
  }

  return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
}
