# AgendaViva AI - Plan De Lanzamiento Económico

Este proyecto ya puede trabajar en modo local gratuito, pero para lanzarlo a internet como SaaS real necesitás separar dos etapas.

## Etapa 1: Lanzar Barato Para Validar

Objetivo: vender demos, conseguir primeros negocios, probar reservas reales y cobrar manualmente.

Necesario:

- Dominio propio.
- Hosting para Next.js.
- PostgreSQL online.
- Variables `.env` seguras.
- Email transaccional o email demo interno.
- Pago manual por transferencia/alias/CBU/IBAN.

No necesario al inicio:

- OpenAI.
- WhatsApp Cloud API.
- Instagram API.
- Stripe productivo.
- Mercado Pago productivo.
- Redis.
- Workers complejos.

Flujo recomendado:

1. Publicar landing y demo.
2. Crear 1 negocio demo por rubro que quieras vender.
3. Compartir `/b/[slug]/book` con negocios reales.
4. Cobrar manualmente transferencia o Mercado Pago link externo.
5. Registrar feedback y mejorar onboarding.

## Etapa 2: Producción Real

Para que sea SaaS comercial real:

- Hosting: Vercel, Railway, Render o VPS.
- DB: Neon Postgres, Supabase Postgres, Railway Postgres o similar.
- Email: Resend, Postmark, Mailgun o SMTP propio.
- Pagos España: Stripe primero; Redsys/Bizum después con banco.
- Pagos Argentina: Mercado Pago; transferencia manual como fallback.
- WhatsApp: Meta WhatsApp Cloud API cuando ya tengas negocios pagando.
- IA: OpenAI cuando tengas volumen o puedas absorber costo por mensaje.
- Cron/jobs: Vercel Cron, GitHub Actions programado, Railway cron o worker simple.
- Observabilidad: logs del hosting + `/api/health`.

## APIs Y Credenciales Que Vas A Necesitar

Mínimas para lanzar online:

- `DATABASE_URL`: Postgres online.
- `NEXTAUTH_SECRET`: secreto largo.
- `NEXTAUTH_URL`: URL pública.
- `APP_URL`: URL pública.
- `APP_ENCRYPTION_KEY`: clave para cifrar secretos.

Para cobrar suscripción SaaS:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER_ES`
- `STRIPE_PRICE_GROWTH_ES`
- `STRIPE_PRICE_PRO_ES`

Para Argentina:

- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_PLAN_STARTER_AR`
- `MERCADOPAGO_PLAN_GROWTH_AR`
- `MERCADOPAGO_PLAN_PRO_AR`

Para emails reales:

- `RESEND_API_KEY`
- `EMAIL_FROM`

Para IA real:

- `OPENAI_API_KEY`

Para WhatsApp real:

- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`

Para calendario Google completo:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Qué Está Listo Ya

- Landing y demo.
- Registro/login local.
- Servicios persistentes.
- Horarios semanales persistentes.
- Slots disponibles calculados.
- Reservas públicas persistentes.
- Bloqueo básico de doble reserva.
- Clientes creados por reservas.
- Emails demo guardados.
- Cancelación/reprogramación por token.
- IA local por reglas.
- Pagos demo/manual.
- Health check en `/api/health`.

## Lo Que Falta Antes De Vender Como SaaS Completo

- Cambiar modo local JSON por Postgres online en producción.
- Configurar dominio y HTTPS.
- Activar pagos reales con webhooks.
- Activar email real.
- Crear cron de recordatorios 24h/2h.
- Revisar textos legales con profesional.
- Política de backup de base de datos.
- Test E2E contra entorno desplegado.

## Recomendación De Costo Cero Inicial

La ruta recomendada ahora es **Netlify Free + Neon Free**. Está documentada paso a paso en `DEPLOY_NETLIFY_NEON.md`.

Usá la app así:

```bash
corepack pnpm dev
```

Vendé primero con demo y reserva pública. Si un negocio quiere usarlo, lo cargás vos, le das su link, y cobrás manualmente. Cuando tengas 2-3 interesados, recién conectás Postgres online y dominio.
