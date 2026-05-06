import { describe, expect, it } from "vitest";
import { demoProvider, getPaymentProvider, redsysProvider } from "@/server/payments/providers";

describe("payment providers", () => {
  it("creates a demo checkout without keys", async () => {
    const result = await demoProvider.createCheckoutSession({
      organizationId: "org",
      amountCents: 1900,
      currency: "EUR",
      description: "Starter"
    });
    expect(result.mode).toBe("demo");
    expect(result.checkoutUrl).toContain("/demo/payment-success");
  });

  it("falls back Stripe country routing", () => {
    expect(getPaymentProvider("ES").name).toBe("stripe");
    expect(getPaymentProvider("AR").name).toBe("mercado_pago");
  });

  it("keeps Redsys functional without bank credentials", async () => {
    const result = await redsysProvider.createCheckoutSession({
      organizationId: "org",
      amountCents: 2000,
      currency: "EUR",
      description: "Seña"
    });
    expect(result.status).toBe("requires_configuration");
  });
});
