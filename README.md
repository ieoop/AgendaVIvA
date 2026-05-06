# AgendaViva AI

AgendaViva AI es una plataforma SaaS multi-tenant para negocios con cita previa en España y Argentina. Combina agenda online, recepcionista IA, conversaciones automatizadas, pagos de reserva, recordatorios, campañas de recuperación, reseñas, analytics y growth loops.

Eslogan principal: **“Tu recepcionista IA que llena la agenda mientras vos trabajás.”**

## Stack

- Next.js 15 App Router, React 19, TypeScript
- Tailwind CSS, componentes estilo shadcn/ui, Lucide, Framer Motion-ready, Recharts
- Prisma ORM + PostgreSQL
- Auth.js / NextAuth con credentials provider y Prisma Adapter
- Providers adapter para IA, pagos, email y WhatsApp
- Docker Compose para Postgres y Redis
- Vitest y Playwright

## Instalación

```bash
corepack enable
corepack pnpm install
copy .env.example .env
docker compose up -d
corepack pnpm db:migrate
corepack pnpm db:seed
corepack pnpm dev
```

Abrir `http://localhost:3000`.

## Modo gratis sin Docker ni base de datos

Si no tenés dinero, Docker no está abierto o todavía no querés contratar ningún servicio, la app funciona con **modo local persistente**:

- Guarda negocios, servicios, clientes, reservas y emails demo en `data/agendaviva.local.json`.
- No requiere PostgreSQL, Redis, Stripe, Mercado Pago, WhatsApp, Resend ni OpenAI.
- Cuando más adelante conectes PostgreSQL, las rutas intentan usar Prisma primero y dejan el modo local como respaldo.

Arranque mínimo:

```bash
corepack pnpm install
corepack pnpm dev
```

Después podés:

- Registrarte en `/register`.
- Entrar desde `/login`.
- Crear servicios en `/app/services`.
- Crear reservas en `/app/appointments`.
- Reservar desde `/b/estetica-palermo/book`.
- Ver clientes en `/app/customers`.
- Ver emails demo guardados desde `/app/settings`.

El archivo `data/agendaviva.local.json` está ignorado por git para no subir datos personales.

Usuarios demo creados por seed:

- `owner.es@agendaviva.ai`
- `owner.ar@agendaviva.ai`
- `admin@agendaviva.ai`
- Password: `AgendaViva2026!`

## Comandos

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm db:migrate
corepack pnpm db:seed
```

## Variables de entorno

`.env.example` incluye las claves para:

- `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `APP_URL`, `APP_ENCRYPTION_KEY`, `REDIS_URL`
- OpenAI
- Resend
- Stripe
- Mercado Pago
- Redsys/Bizum
- WhatsApp Cloud API
- Google OAuth

Si faltan claves externas, la app no rompe: usa modo demo o sandbox funcional y registra el estado en UI/logs.

## Pagos

La arquitectura separa dos flujos:

- **Billing SaaS:** trial, checkout, suscripción, portal, facturación básica y estado de pago.
- **Pagos del comercio:** señas para reservas, pagos pendientes/confirmados, refund básico e historial.

Providers implementados:

- `demo`: siempre funcional, no mueve dinero.
- `stripe`: principal España. Si `STRIPE_SECRET_KEY` existe, queda listo para crear sesiones reales; sin keys usa demo.
- `mercado_pago`: principal Argentina. Si `MERCADOPAGO_ACCESS_TOKEN` existe, queda listo para preferencias reales; sin keys usa demo.
- `redsys`: estructura sandbox y firma HMAC SHA256 cuando existen credenciales; sin credenciales muestra “requiere configuración bancaria”.
- `manual_transfer`: alias/CBU/IBAN/QR configurable por comercio.

## IA

`AIService` usa provider adapter:

- Con `OPENAI_API_KEY`, el punto de extensión queda activo para proveedor real.
- Sin key, usa motor local determinístico con reglas de intención, tono, handoff y plantillas por negocio.

Intenciones soportadas:

- reservar
- cancelar
- reprogramar
- consultar precio
- consultar dirección
- consultar disponibilidad
- pedir promoción
- hablar con humano

## Rutas principales

Públicas:

- `/`, `/pricing`, `/demo`, `/use-cases`, `/login`, `/register`, `/privacy`, `/terms`, `/cookies`

Onboarding:

- `/onboarding/country`, `/onboarding/business`, `/onboarding/services`, `/onboarding/schedule`, `/onboarding/payments`, `/onboarding/ai`, `/onboarding/share`

Dashboard:

- `/app`, `/app/calendar`, `/app/appointments`, `/app/customers`, `/app/services`, `/app/conversations`, `/app/ai-receptionist`, `/app/automations`, `/app/campaigns`, `/app/reviews`, `/app/payments`, `/app/analytics`, `/app/team`, `/app/settings`, `/app/billing`, `/app/integrations`

Negocio público:

- `/b/[businessSlug]`, `/b/[businessSlug]/book`, `/b/[businessSlug]/services`, `/b/[businessSlug]/reschedule/[token]`, `/b/[businessSlug]/cancel/[token]`, `/b/[businessSlug]/review/[token]`

Admin:

- `/admin`, `/admin/users`, `/admin/organizations`, `/admin/subscriptions`, `/admin/payments`, `/admin/feature-flags`, `/admin/email-templates`, `/admin/system-health`

## Seed demo

`corepack pnpm db:seed` crea:

- España: `Clínica Dental Norte`, Madrid, EUR, servicios odontología, Stripe demo.
- Argentina: `Estética Palermo`, Buenos Aires, ARS, servicios estética, Mercado Pago demo.
- 20 clientes, 30+ reservas, conversaciones, pagos demo, campañas, reseñas, emails, logs, referrals, feature flags y planes.

## Testing

Unitarios:

- Availability engine
- AI local intent detection
- Payment provider demo
- Permisos multi-tenant
- Firma de webhooks

E2E:

- Landing
- Demo pública
- Página pública de reserva

## Despliegue

Vercel + Neon/Supabase/Railway funciona bien:

1. Crear PostgreSQL administrado.
2. Configurar `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `APP_URL`, `APP_ENCRYPTION_KEY`.
3. Ejecutar `corepack pnpm db:migrate`.
4. Ejecutar `corepack pnpm db:seed` si se quiere demo.
5. Añadir Stripe/Mercado Pago/Resend/WhatsApp según país.

Redis es opcional. Sin `REDIS_URL`, rate limiting y jobs usan fallback demo/memoria en desarrollo.

## Limitaciones reales

- Stripe, Mercado Pago, Resend, OpenAI y WhatsApp quedan en modo real solo al configurar credenciales y completar credenciales productivas.
- Redsys/Bizum requiere alta bancaria; el adapter firma requests con HMAC SHA256 cuando hay credenciales, pero no sustituye la certificación bancaria.
- Los textos legales son plantillas prudentes para GDPR/LOPDGDD y Argentina; deben revisarse con asesoría profesional antes de producción.
- El worker de jobs está preparado a nivel de reglas y logs; en producción conviene conectar una cola persistente.

## Checklist implementado

- Proyecto Next.js 15 + TypeScript + Tailwind
- Prisma schema multi-tenant
- Auth.js credentials + Prisma Adapter
- Landing, demo, onboarding, dashboard, negocio público, admin y legales
- Availability engine real
- AIService con fallback local
- Payment Provider Adapter
- Email demo/Resend-ready
- WhatsApp demo/Meta-ready
- Analytics, QR, referrals y feature flags
- `.env.example`, Docker Compose, seed demo, tests y README
