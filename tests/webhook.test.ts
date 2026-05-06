import { describe, expect, it } from "vitest";
import { hmacSha256, verifySignature } from "@/lib/security";

describe("webhook signatures", () => {
  it("verifies HMAC SHA256 signatures", () => {
    const payload = JSON.stringify({ id: "evt_1" });
    const signature = hmacSha256(payload, "secret");
    expect(verifySignature(payload, signature, "secret")).toBe(true);
    expect(verifySignature(payload, "bad", "secret")).toBe(false);
  });
});
