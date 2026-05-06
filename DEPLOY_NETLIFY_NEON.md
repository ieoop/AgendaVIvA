# Deploy Barato Recomendado: Netlify + Neon

Esta es la opción que más conviene en tu estado actual: buena calidad, costo inicial $0, y sin reescribir la app.

## Por Qué Esta Opción

- Netlify Free permite lanzar proyectos comerciales y tiene límites duros para no cobrarte por sorpresa.
- Netlify soporta Next.js App Router con OpenNext.
- Neon Free da Postgres administrado sin tarjeta para empezar.
- La app ya tiene Prisma/Postgres listo.

Fuentes oficiales:

- Netlify Free pricing: https://www.netlify.com/pricing/
- Netlify comercial en Free: https://www.netlify.com/blog/introducing-netlify-free-plan/
- Netlify Next.js support: https://docs.netlify.com/frameworks/next-js/overview/
- Neon pricing: https://neon.com/pricing

## Qué Tenés Que Crear Vos

### 1. Cuenta en GitHub

Link: https://github.com

Subí este proyecto a un repo privado o público.

### 2. Cuenta en Neon

Link: https://neon.com

Pasos:

1. Crear proyecto.
2. Elegir región cercana:
   - España: Europa.
   - Argentina: US East suele ir bien si no hay región Latam.
3. Copiar la connection string.
4. Asegurarte de que tenga `sslmode=require`.

Variable:

```env
DATABASE_URL="postgresql://..."
```

### 3. Cuenta en Netlify

Link: https://www.netlify.com

Pasos:

1. New site from Git.
2. Elegir GitHub.
3. Elegir el repo.
4. Build command:

```bash
corepack pnpm build
```

5. Publish directory:

```bash
.next
```

Netlify debería detectar `netlify.toml`.

## Variables Obligatorias En Netlify

En Netlify: Site configuration > Environment variables.

Pegá:

```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
APP_URL=
APP_ENCRYPTION_KEY=
```

Valores:

- `DATABASE_URL`: la URL de Neon.
- `NEXTAUTH_SECRET`: generá una clave larga.
- `NEXTAUTH_URL`: URL pública de Netlify, ejemplo `https://agendaviva-ai.netlify.app`.
- `APP_URL`: la misma URL pública.
- `APP_ENCRYPTION_KEY`: clave larga para cifrado.

Para generar claves localmente:

```bash
node -e "console.log(crypto.randomUUID()+crypto.randomUUID())"
```

## Inicializar La Base De Datos Online

Cuando tengas `DATABASE_URL` de Neon, en tu máquina:

```bash
$env:DATABASE_URL="PEGAR_URL_DE_NEON"
corepack pnpm db:migrate
corepack pnpm db:seed
```

Después redeploy en Netlify.

## Variables Opcionales Para Cuando Ya Tengas Clientes

Email real:

```env
RESEND_API_KEY=
EMAIL_FROM=
```

IA real:

```env
OPENAI_API_KEY=
```

España pagos:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER_ES=
STRIPE_PRICE_GROWTH_ES=
STRIPE_PRICE_PRO_ES=
```

Argentina pagos:

```env
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_WEBHOOK_SECRET=
MERCADOPAGO_PLAN_STARTER_AR=
MERCADOPAGO_PLAN_GROWTH_AR=
MERCADOPAGO_PLAN_PRO_AR=
```

WhatsApp real:

```env
WHATSAPP_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
```

## Qué Podés Vender Sin APIs Pagas

Podés vender una primera versión así:

- Link público de reservas.
- Agenda online.
- Servicios y horarios.
- Clientes.
- Emails demo/log interno.
- WhatsApp manual con links.
- Cobro por transferencia o Mercado Pago link manual.
- Alma IA local para demo.

Esto alcanza para validar con negocios reales antes de gastar.

## Checklist Antes De Compartir

1. `/api/health` devuelve `ok: true`.
2. `/register` crea usuario.
3. `/app/services` crea servicio.
4. `/app/calendar` guarda horarios.
5. `/b/estetica-palermo/book` crea reserva.
6. `/app/appointments` muestra reservas.
7. Textos legales revisados al menos de forma básica.
8. Dominio conectado si ya tenés uno.

## Cuándo Pagar

No pagues todavía por OpenAI, WhatsApp API ni Stripe/Mercado Pago avanzado.

Pagá recién cuando:

- Un negocio te diga “sí, lo quiero usar”.
- Necesites cobrar online automáticamente.
- Los recordatorios manuales ya te queden cortos.
