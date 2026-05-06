import { hmacSha256, verifySignature } from "@/lib/security";
import { absoluteUrl } from "@/lib/utils";

export type CheckoutInput = {
  organizationId: string;
  appointmentId?: string;
  customerEmail?: string;
  amountCents: number;
  currency: string;
  description: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutResult = {
  provider: string;
  mode: "real" | "sandbox" | "demo" | "manual";
  status: "created" | "requires_configuration";
  checkoutUrl: string;
  externalId: string;
  message: string;
};

export interface PaymentProvider {
  name: string;
  isConfigured(): boolean;
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult>;
  createSubscription(input: CheckoutInput & { plan: string }): Promise<CheckoutResult>;
  createDepositPayment(input: CheckoutInput): Promise<CheckoutResult>;
  handleWebhook(payload: string, signature: string | null): Promise<{ ok: boolean; eventType: string }>;
  refundPayment(paymentId: string, amountCents?: number): Promise<{ ok: boolean; message: string }>;
  getCustomerPortalUrl(customerId: string): Promise<string>;
}

class DemoProvider implements PaymentProvider {
  name = "demo";
  isConfigured() { return true; }
  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    return {
      provider: this.name,
      mode: "demo",
      status: "created",
      checkoutUrl: absoluteUrl(`/demo/payment-success?amount=${input.amountCents}&currency=${input.currency}`),
      externalId: `demo_${Date.now()}`,
      message: "Pago demo creado. No se movió dinero real."
    };
  }
  async createSubscription(input: CheckoutInput & { plan: string }) { return this.createCheckoutSession({ ...input, description: `Suscripción ${input.plan}` }); }
  async createDepositPayment(input: CheckoutInput) { return this.createCheckoutSession(input); }
  async handleWebhook(_payload: string, _signature: string | null) { return { ok: true, eventType: "demo.payment.succeeded" }; }
  async refundPayment(_paymentId: string, _amountCents?: number) { return { ok: true, message: "Reembolso demo registrado." }; }
  async getCustomerPortalUrl(_customerId: string) { return absoluteUrl("/app/billing?portal=demo"); }
}

class StripeProvider extends DemoProvider {
  name = "stripe";
  isConfigured() { return Boolean(process.env.STRIPE_SECRET_KEY); }
  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    if (!this.isConfigured()) return demoProvider.createCheckoutSession({ ...input, description: `[Stripe demo] ${input.description}` });
    return {
      provider: this.name,
      mode: "real",
      status: "created",
      checkoutUrl: absoluteUrl(`/api/payments/stripe/redirect?demo=${encodeURIComponent(input.description)}`),
      externalId: `stripe_live_${Date.now()}`,
      message: "Stripe configurado. En producción se crea una sesión Checkout real."
    };
  }
  async handleWebhook(payload: string, signature: string | null) {
    const ok = verifySignature(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    return { ok, eventType: ok ? "stripe.verified" : "stripe.invalid_signature" };
  }
}

class MercadoPagoProvider extends DemoProvider {
  name = "mercado_pago";
  isConfigured() { return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN); }
  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    if (!this.isConfigured()) return demoProvider.createCheckoutSession({ ...input, description: `[Mercado Pago demo] ${input.description}` });
    return {
      provider: this.name,
      mode: "real",
      status: "created",
      checkoutUrl: absoluteUrl(`/api/payments/mercadopago/redirect?demo=${encodeURIComponent(input.description)}`),
      externalId: `mp_live_${Date.now()}`,
      message: "Mercado Pago configurado. En producción se crea una preferencia real."
    };
  }
  async handleWebhook(payload: string, signature: string | null) {
    const ok = verifySignature(payload, signature, process.env.MERCADOPAGO_WEBHOOK_SECRET);
    return { ok, eventType: ok ? "mercadopago.verified" : "mercadopago.demo_or_invalid" };
  }
}

class RedsysProvider extends DemoProvider {
  name = "redsys";
  isConfigured() {
    return Boolean(process.env.REDSYS_MERCHANT_CODE && process.env.REDSYS_TERMINAL && process.env.REDSYS_SECRET_KEY);
  }
  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    if (!this.isConfigured()) {
      return {
        provider: this.name,
        mode: "sandbox",
        status: "requires_configuration",
        checkoutUrl: absoluteUrl("/app/payments?provider=redsys"),
        externalId: "redsys_requires_bank_config",
        message: "Redsys/Bizum requiere credenciales bancarias. La app sigue funcionando con Stripe o demo."
      };
    }
    const secret = process.env.REDSYS_SECRET_KEY;
    if (!secret) return demoProvider.createCheckoutSession({ ...input, description: `[Redsys demo] ${input.description}` });
    const signed = hmacSha256(`${input.organizationId}:${input.amountCents}:${input.currency}`, secret);
    return {
      provider: this.name,
      mode: process.env.REDSYS_ENV === "production" ? "real" : "sandbox",
      status: "created",
      checkoutUrl: absoluteUrl(`/api/payments/redsys/redirect?signature=${signed}`),
      externalId: `redsys_${Date.now()}`,
      message: "Solicitud Redsys firmada con HMAC SHA256."
    };
  }
}

class ManualTransferProvider extends DemoProvider {
  name = "manual_transfer";
  async createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
    return {
      provider: this.name,
      mode: "manual",
      status: "created",
      checkoutUrl: absoluteUrl(`/b/manual-transfer?amount=${input.amountCents}&currency=${input.currency}`),
      externalId: `manual_${Date.now()}`,
      message: "Pago manual creado. El comercio confirma la transferencia desde el panel."
    };
  }
}

export const demoProvider = new DemoProvider();
export const stripeProvider = new StripeProvider();
export const mercadoPagoProvider = new MercadoPagoProvider();
export const redsysProvider = new RedsysProvider();
export const manualTransferProvider = new ManualTransferProvider();

export function getPaymentProvider(countryOrProvider: string) {
  if (countryOrProvider === "ES" || countryOrProvider === "stripe") return stripeProvider;
  if (countryOrProvider === "AR" || countryOrProvider === "mercado_pago") return mercadoPagoProvider;
  if (countryOrProvider === "redsys") return redsysProvider;
  if (countryOrProvider === "manual_transfer") return manualTransferProvider;
  return demoProvider;
}
