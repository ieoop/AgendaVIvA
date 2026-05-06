import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const cookieName = "agendaviva_session";

function secret() {
  return process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me";
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export type LocalSession = {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
};

export function encodeSession(session: LocalSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function setSessionCookie(session: LocalSession) {
  const jar = await cookies();
  jar.set(cookieName, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function getSessionCookie() {
  const jar = await cookies();
  const value = jar.get(cookieName)?.value;
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as LocalSession;
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(cookieName);
}
