import Link from "next/link";
import { ArrowRight, BadgeCheck, BarChart3, Bot, CalendarCheck, Check, ChevronRight, Clock, CreditCard, Globe2, HeartHandshake, MessageSquare, QrCode, Search, Settings, ShieldCheck, Sparkles, Star, Users, Zap } from "lucide-react";
import { Logo } from "@/components/logo";
import { AnalyticsChart, ChatDemo, MoneyCalculator } from "@/components/interactive";
import { Badge, Card, Field, LinkButton, inputClass } from "@/components/ui";
import { demoBusinessFallback, getBusinessBySlug, industries, integrations, routeTitles } from "@/lib/demo";
import { getLocaleConfig } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";

export default async function CatchAllPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const resolved = await params;
  const parts = resolved.slug ?? [];
  const path = `/${parts.join("/")}`;

  if (path === "/") return <MarketingPage />;
  if (path === "/pricing") return <MarketingPage focus="pricing" />;
  if (path === "/demo") return <DemoPage />;
  if (path.startsWith("/use-cases")) return <UseCasesPage active={parts[1]} />;
  if (path === "/login") return <AuthPage mode="login" />;
  if (path === "/register") return <AuthPage mode="register" />;
  if (["/privacy", "/terms", "/cookies"].includes(path)) return <LegalPage type={parts[0]} />;
  if (path.startsWith("/onboarding")) return <OnboardingPage step={parts[1] ?? "country"} />;
  if (path.startsWith("/app")) return <DashboardPage path={path} />;
  if (path.startsWith("/admin")) return <AdminPage path={path} />;
  if (path.startsWith("/b/")) return <BusinessPublicPage parts={parts} />;
  if (path.startsWith("/ref/")) return <ReferralPage code={parts[1]} />;
  return <MarketingPage />;
}

function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/demo">Demo</Link>
          <Link href="/use-cases">Rubros</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacidad</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LinkButton href="/login" variant="ghost" className="hidden md:inline-flex">Entrar</LinkButton>
          <LinkButton href="/register">Crear mi agenda gratis</LinkButton>
        </div>
      </div>
    </header>
  );
}

function MarketingPage({ focus }: { focus?: "pricing" }) {
  return (
    <main className="animated-page-bg">
      <Header />
      <section className="content-above-bg relative mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1fr_0.92fr] md:items-center md:py-16">
        <span className="signal-line left-4 top-24 hidden md:block" />
        <span className="signal-line bottom-20 right-4 hidden md:block" />
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge>Problema claro</Badge>
            <Badge>Solución en 10 minutos</Badge>
            <Badge>Trial 14 días</Badge>
          </div>
          <h1 className="max-w-4xl text-4xl font-bold tracking-normal text-slate-950 md:text-6xl">
            Dejá de perder reservas por responder tarde
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Cuando un cliente escribe y nadie contesta, la agenda pierde dinero. AgendaViva AI responde, ofrece horarios, cobra seña y confirma la cita o turno mientras vos trabajás.
          </p>
          <div className="mt-7 grid gap-3 lg:grid-cols-2">
            <Card className="border-red-100 bg-red-50/80 p-4">
              <p className="text-sm font-bold text-red-700">Antes</p>
              <p className="mt-2 text-sm text-slate-700">Mensaje sin responder, cliente impaciente, hueco en agenda y horas del equipo persiguiendo confirmaciones.</p>
            </Card>
            <Card className="border-emerald-100 bg-emerald-50/90 p-4 pulse-border">
              <p className="text-sm font-bold text-emerald-700">Con AgendaViva AI</p>
              <p className="mt-2 text-sm text-slate-700">Alma atiende en segundos, sugiere horarios reales, pide seña y dispara recordatorios automáticos.</p>
            </Card>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/register">Crear mi agenda gratis <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></LinkButton>
            <LinkButton href="/demo" variant="secondary">Ver demo interactiva</LinkButton>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <Trust icon={<Zap />} text="La IA atiende 24/7" />
            <Trust icon={<CreditCard />} text="Señas y pagos integrados" />
            <Trust icon={<BarChart3 />} text="Dinero recuperado visible" />
          </div>
        </div>
        <div className="soft-float relative min-h-[460px] overflow-hidden rounded-lg border bg-white/95 p-4 shadow-soft backdrop-blur">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <Badge>Dashboard live demo</Badge>
          </div>
          <div className="mt-4 rounded-lg border bg-slate-950 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Mensaje entrante</p>
            <p className="mt-2 text-sm">"Hola, quiero turno mañana. ¿Cuánto sale?"</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-200 sm:grid-cols-3">
              <span className="rounded-md bg-white/10 px-2 py-1">Alma responde</span>
              <span className="rounded-md bg-white/10 px-2 py-1">Ofrece horarios</span>
              <span className="rounded-md bg-white/10 px-2 py-1">Pide seña</span>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[0.75fr_1fr]">
            <div className="grid gap-3">
              <MiniStat label="Reservas IA" value="38" />
              <MiniStat label="Señas cobradas" value="€1.840" />
              <MiniStat label="Horas ahorradas" value="18 h" />
              <Card className="p-3">
                <p className="text-sm font-semibold">Alma detectó intención</p>
                <p className="mt-1 text-xs text-slate-500">reservar · confianza 92% · pedir seña</p>
              </Card>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <AnalyticsChart />
            </div>
          </div>
          <div className="mt-4 rounded-lg border bg-emerald-50 p-4">
            <p className="text-sm text-slate-600">AgendaViva AI te ahorró aproximadamente</p>
            <p className="text-3xl font-bold text-teal-950">18 horas este mes</p>
          </div>
        </div>
      </section>
      <ProblemSolution />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <ChatDemo country="AR" />
      </section>
      <UseCasesGrid />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <MoneyCalculator />
      </section>
      <HowItWorks />
      <Integrations />
      <Testimonials />
      <Pricing highlight={focus === "pricing"} />
      <FAQ />
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-lg bg-primary px-6 py-12 text-center text-white shadow-soft">
          <h2 className="text-3xl font-bold">Activá tu recepcionista IA hoy y dejá de perder reservas.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-teal-50">Más reservas. Menos trabajo manual. Una agenda que trabaja cuando el equipo está atendiendo.</p>
          <LinkButton href="/register" variant="secondary" className="mt-6">Crear mi agenda gratis</LinkButton>
        </div>
      </section>
    </main>
  );
}

function Trust({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <span className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">{icon}<span>{text}</span></span>;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}

function ProblemSolution() {
  const pains = ["Te escriben fuera de horario y contestás tarde.", "Perdés clientes porque no respondés rápido.", "Tenés ausencias sin aviso.", "Tu agenda está repartida entre WhatsApp, papel y memoria.", "No pedís reseñas ni recuperás clientes.", "El equipo pierde horas confirmando turnos."];
  const solutions = ["Recepcionista IA 24/7", "Agenda online", "Cobro de reserva/seña", "Recordatorios automáticos", "Campañas de recuperación", "Métricas de dinero recuperado"];
  return (
    <section className="border-y bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-primary">El problema</p>
          <h2 className="mt-2 text-3xl font-bold">Responder tarde cuesta dinero todos los días</h2>
          <div className="mt-6 grid gap-3">
            {pains.map((item) => <Card key={item} className="flex items-center gap-3 p-4"><Clock className="h-5 w-5 text-amber-500" /> {item}</Card>)}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary">La solución</p>
          <h2 className="mt-2 text-3xl font-bold">Alma atiende, agenda, cobra y vuelve a vender</h2>
          <div className="mt-6 grid gap-3">
            {solutions.map((item) => <Card key={item} className="flex items-center gap-3 p-4"><Check className="h-5 w-5 text-emerald-600" /> {item}</Card>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesGrid() {
  const benefits = {
    Barberías: "Reduce huecos y llena horas valle con recordatorios.",
    Estética: "Cobra señas, recupera clientas dormidas y pide reseñas.",
    Clínicas: "Ordena citas, consentimientos y derivaciones a humano.",
    Veterinarias: "Atiende urgencias con handoff y agenda controles.",
    Talleres: "Convierte consultas de precio en turnos confirmados.",
    Entrenadores: "Automatiza pagos recurrentes y reprogramaciones."
  };
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-semibold text-primary">Casos de uso</p>
      <h2 className="mt-2 text-3xl font-bold">Plantillas por rubro para configurar en minutos</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Object.entries(benefits).map(([name, text]) => (
          <Card key={name}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{name}</h3>
              <ChevronRight className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-sm text-slate-600">{text}</p>
            <Link href={`/use-cases/${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`} className="mt-4 inline-flex text-sm font-semibold text-primary">Ver flujo</Link>
          </Card>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = ["Configurá servicios y horarios", "Compartí tu link o conectá WhatsApp", "La IA agenda, confirma y recuerda", "Vos cobrás más y trabajás menos"];
  return (
    <section className="border-y bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <p className="text-sm font-semibold text-primary">Cómo funciona</p>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => <Card key={step}><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-white">{index + 1}</span><p className="mt-4 font-semibold">{step}</p></Card>)}
        </div>
      </div>
    </section>
  );
}

function Integrations() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <p className="text-sm font-semibold text-primary">Integraciones</p>
      <h2 className="mt-2 text-3xl font-bold">WhatsApp, Instagram, pagos y calendario en un solo lugar</h2>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        {integrations.map((item) => <Card key={item} className="flex items-center gap-3 p-4"><Globe2 className="h-5 w-5 text-primary" /> {item}</Card>)}
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    ["Barbería en Madrid", "Pasamos de contestar al final del día a confirmar citas con seña en minutos."],
    ["Centro de estética en Buenos Aires", "La recuperación de clientas dormidas nos llenó la semana siguiente."],
    ["Clínica dental en Valencia", "Los recordatorios bajaron ausencias y el equipo dejó de perseguir confirmaciones."],
    ["Veterinaria en Córdoba", "El triage demo de urgencias nos ayuda a derivar rápido a una persona."]
  ];
  return (
    <section className="border-y bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-primary">Testimonios demo</p>
            <h2 className="mt-2 text-3xl font-bold">Historias realistas para probar el posicionamiento</h2>
          </div>
          <Badge>Datos ficticios en ambiente demo</Badge>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {items.map(([name, text]) => <Card key={name}><div className="flex gap-1 text-amber-400">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className="h-4 w-4 fill-current" />)}</div><p className="mt-4 text-sm text-slate-700">{text}</p><p className="mt-4 text-sm font-bold">{name}</p></Card>)}
        </div>
      </div>
    </section>
  );
}

function Pricing({ highlight }: { highlight?: boolean }) {
  const plans = [
    ["Free Trial", "14 días", "1 negocio, 1 staff, 20 reservas demo, página pública, IA demo"],
    ["Starter", "19 €/mes", "1 ubicación, 2 usuarios, 100 reservas/mes, recordatorios email, asistente IA básico"],
    ["Growth", "49 €/mes", "3 ubicaciones, 10 usuarios, WhatsApp/Instagram, señas, campañas, reseñas, analytics"],
    ["Pro", "99 €/mes", "Multiubicación, IA avanzada, automatizaciones ilimitadas, API, marca blanca parcial"],
    ["Enterprise", "Personalizado", "Clínicas, cadenas y franquicias con SSO, SLA y onboarding asistido"]
  ];
  return (
    <section id="pricing" className={highlight ? "bg-emerald-50" : ""}>
      <div className="mx-auto max-w-7xl px-4 py-14">
        <p className="text-sm font-semibold text-primary">Pricing</p>
        <h2 className="mt-2 text-3xl font-bold">Planes claros para activar PLG desde el día uno</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-5">
          {plans.map(([name, price, details]) => (
            <Card key={name} className={name === "Growth" ? "border-primary shadow-soft" : ""}>
              <p className="font-bold">{name}</p>
              <p className="mt-3 text-2xl font-bold">{price}</p>
              <p className="mt-3 text-sm text-slate-600">{details}</p>
              <LinkButton href="/register" variant={name === "Growth" ? "primary" : "secondary"} className="mt-5 w-full">Empezar</LinkButton>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">Argentina usa precios ARS configurables desde admin. España usa Stripe; Argentina usa Mercado Pago.</p>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = ["¿Necesito saber tecnología?", "¿Funciona con WhatsApp?", "¿Puedo cobrar señas?", "¿Sirve para España?", "¿Sirve para Argentina?", "¿Puedo cancelar?", "¿Qué pasa si la IA no sabe responder?", "¿Puedo usar solo el link de reservas?"];
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h2 className="text-3xl font-bold">Preguntas frecuentes</h2>
      <div className="mt-6 grid gap-3">
        {qs.map((q) => <Card key={q}><p className="font-semibold">{q}</p><p className="mt-2 text-sm text-slate-600">Sí. AgendaViva AI funciona con configuración guiada, modo demo cuando faltan credenciales y derivación a humano cuando Alma no tiene suficiente confianza.</p></Card>)}
      </div>
    </section>
  );
}

function DemoPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Badge>Sin registro</Badge>
          <h1 className="mt-4 text-4xl font-bold">Probá cómo Alma convierte una consulta en reserva</h1>
          <p className="mt-4 text-slate-600">Elegí rubro, escribí como cliente y mirá la intención detectada, horarios sugeridos, seña y mini dashboard.</p>
          <div className="mt-6 grid gap-3">
            {industries.slice(0, 6).map((item) => <Card key={item} className="flex items-center justify-between p-4"><span>{item}</span><Badge>Plantilla lista</Badge></Card>)}
          </div>
        </div>
        <div className="grid gap-4">
          <ChatDemo country="AR" />
          <Card>
            <h3 className="font-bold">Mini dashboard generado</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStat label="Reserva simulada" value="1" />
              <MiniStat label="Seña demo" value="$8.400" />
              <MiniStat label="Email demo" value="enviado" />
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}

function UseCasesPage({ active }: { active?: string }) {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-7xl px-4 py-12">
        <Badge>{active ? "Caso específico" : "Biblioteca de rubros"}</Badge>
        <h1 className="mt-4 text-4xl font-bold">{active ? `AgendaViva AI para ${active}` : "Casos de uso por rubro"}</h1>
        <p className="mt-4 max-w-3xl text-slate-600">Cada plantilla trae servicios sugeridos, políticas, tono de Alma, campañas y mensajes de recuperación adaptados al negocio.</p>
        <UseCasesGrid />
      </section>
    </main>
  );
}

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold">{isLogin ? "Entrar a AgendaViva AI" : "Crear tu agenda gratis"}</h1>
        <p className="mt-2 text-sm text-slate-600">{isLogin ? "Demo: owner.ar@agendaviva.ai / AgendaViva2026!" : "Tu trial de 14 días arranca con modo demo funcional."}</p>
        <form action={isLogin ? "/api/login" : "/api/register"} method="post" className="mt-6 grid gap-4">
          <Field label="Email"><input className={inputClass} name="email" type="email" defaultValue={isLogin ? "owner.ar@agendaviva.ai" : ""} required /></Field>
          <Field label="Contraseña"><input className={inputClass} name="password" type="password" defaultValue={isLogin ? "AgendaViva2026!" : ""} required /></Field>
          {!isLogin && <Field label="Nombre del negocio"><input className={inputClass} name="businessName" defaultValue="Mi negocio" required /></Field>}
          <button className="focus-ring h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white" type="submit">{isLogin ? "Entrar al dashboard" : "Crear cuenta y configurar"}</button>
        </form>
        <Link href={isLogin ? "/register" : "/login"} className="mt-5 block text-sm font-semibold text-primary">{isLogin ? "Crear cuenta nueva" : "Ya tengo cuenta"}</Link>
      </Card>
    </main>
  );
}

function OnboardingPage({ step }: { step: string }) {
  const steps = ["country", "business", "services", "schedule", "payments", "ai", "share"];
  const current = Math.max(0, steps.indexOf(step));
  const copy: Record<string, [string, string]> = {
    country: ["¿Dónde está tu negocio?", "España ajusta citas/EUR/Stripe. Argentina ajusta turnos/ARS/Mercado Pago."],
    business: ["¿Qué tipo de negocio tenés?", "Elegí una plantilla y Alma cargará ejemplos de servicios y mensajes."],
    services: ["Cargá tus primeros servicios", "Podés usar plantillas por rubro y editar duración, precio y seña."],
    schedule: ["Definí tus horarios", "Arrancamos con lunes a viernes 9 a 18 y sábados medio día."],
    payments: ["Elegí cómo querés cobrar", "Stripe en España, Mercado Pago en Argentina o transferencia manual."],
    ai: ["Configurá a Alma", "Nombre, tono, idioma, FAQs, políticas y cuándo derivar a humano."],
    share: ["Compartí tu link", "Copiá tu página pública, descargá QR o abrí WhatsApp con mensaje prellenado."]
  };
  const [title, subtitle] = copy[step] ?? copy.country;
  return (
    <main className="min-h-screen">
      <Header />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex gap-2">
          {steps.map((item, index) => <span key={item} className={`h-2 flex-1 rounded-full ${index <= current ? "bg-primary" : "bg-slate-200"}`} />)}
        </div>
        <Card>
          <Badge>Paso {current + 1} de 7</Badge>
          <h1 className="mt-4 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {(step === "country" ? ["España", "Argentina", "Otro"] : step === "business" ? industries.slice(0, 9) : ["Configuración recomendada", "Editar manualmente", "Cargar después"]).map((item) => <Card key={item} className="cursor-pointer p-4 hover:border-primary"><p className="font-semibold">{item}</p><p className="mt-2 text-sm text-slate-500">Listo para continuar sin bloquear el flujo.</p></Card>)}
          </div>
          <div className="mt-8 flex justify-between">
            <LinkButton href={`/onboarding/${steps[Math.max(0, current - 1)]}`} variant="secondary">Atrás</LinkButton>
            <LinkButton href={current === steps.length - 1 ? "/app" : `/onboarding/${steps[current + 1]}`}>Continuar</LinkButton>
          </div>
        </Card>
      </section>
    </main>
  );
}

async function DashboardPage({ path }: { path: string }) {
  const business = await getBusinessBySlug("estetica-palermo");
  const title = path === "/app" ? "Panel de crecimiento" : routeTitles[path] ?? "Panel AgendaViva AI";
  const nav = [
    { href: "/app", label: "Inicio", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/app/calendar", label: "Agenda", icon: <CalendarCheck className="h-4 w-4" /> },
    { href: "/app/customers", label: "Clientes", icon: <Users className="h-4 w-4" /> },
    { href: "/app/conversations", label: "Mensajes", icon: <MessageSquare className="h-4 w-4" /> },
    { href: "/app/ai-receptionist", label: "Alma IA", icon: <Bot className="h-4 w-4" /> },
    { href: "/app/campaigns", label: "Marketing", icon: <Sparkles className="h-4 w-4" /> },
    { href: "/app/settings", label: "Ajustes", icon: <Settings className="h-4 w-4" /> }
  ];
  return (
    <main className="animated-page-bg min-h-screen bg-slate-50">
      <div className="content-above-bg grid min-h-screen md:grid-cols-[232px_1fr]">
        <aside className="hidden border-r bg-white p-4 md:block">
          <Logo />
          <div className="mt-7 rounded-lg border bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Siguiente acción</p>
            <p className="mt-2 text-sm font-bold text-slate-950">Respondé mensajes y llená huecos.</p>
            <Link href="/app/conversations" className="mt-3 inline-flex text-sm font-semibold text-primary">Ir a mensajes</Link>
          </div>
          <nav className="mt-5 grid gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${item.href === path ? "bg-primary text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 grid gap-2 border-t pt-4 text-xs text-slate-500">
            <Link href="/app/payments" className="hover:text-primary">Pagos y señas</Link>
            <Link href="/app/analytics" className="hover:text-primary">Analytics completo</Link>
            <Link href="/admin" className="hover:text-primary">Admin SaaS</Link>
          </div>
        </aside>
        <section>
          <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white/90 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="md:hidden"><Logo /></div>
              <div className="hidden items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-slate-500 lg:flex"><Search className="h-4 w-4" /> Buscar cliente, reserva o conversación</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{business.name}</Badge>
              <LinkButton href="/app/appointments">Crear reserva</LinkButton>
            </div>
          </div>
          <div className="px-4 py-6 md:px-8">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="mt-2 text-slate-600">Más reservas, menos trabajo manual y cada automatización conectada a dinero recuperado.</p>
            {path === "/app/conversations" ? <ConversationsView /> : path === "/app/ai-receptionist" ? <AiSettingsView /> : path === "/app/analytics" ? <AnalyticsView /> : path === "/app/settings" ? <SettingsView /> : path === "/app/services" ? <ServicesView business={business} /> : path === "/app/calendar" ? <CalendarView business={business} /> : path === "/app/appointments" ? <AppointmentsView business={business} /> : path === "/app/customers" ? <CustomersView business={business} /> : <DashboardGenericView path={path} business={business} />}
          </div>
          <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-5 border-t bg-white p-2 md:hidden">
            {["/app", "/app/calendar", "/app/conversations", "/app/analytics", "/app/settings"].map((href) => <Link key={href} href={href} className="grid place-items-center rounded-lg p-2 text-xs text-slate-600"><CalendarCheck className="h-5 w-5" /></Link>)}
          </nav>
        </section>
      </div>
    </main>
  );
}

function DashboardGenericView({ path, business }: { path: string; business: typeof demoBusinessFallback | Awaited<ReturnType<typeof getBusinessBySlug>> }) {
  const locale = getLocaleConfig(business.country === "ES" ? "ES" : "AR");
  const services = "services" in business ? business.services : demoBusinessFallback.services;
  return (
    <div className="mt-6 grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat label="Reservas este mes" value="126" />
        <MiniStat label="Dinero potencial recuperado" value={formatMoney(8600000, locale.currency, locale.locale)} />
        <MiniStat label="Ausencias que te costaron dinero" value="7.8%" />
        <MiniStat label="Reservas generadas por IA" value="38" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Agenda semanal</h2>
            <Badge>día · semana · mes</Badge>
          </div>
          <div className="mt-4 grid gap-2">
            {["10:30 Limpieza facial profunda · Martina", "12:00 Perfilado de cejas · Nicolás", "16:15 Depilación láser · Valentina"].map((item) => <div key={item} className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm"><span>{item}</span><Badge>confirmado</Badge></div>)}
          </div>
        </Card>
        <Card>
          <h2 className="font-bold">Servicios que Alma puede vender</h2>
          <div className="mt-4 grid gap-3">
            {services.slice(0, 4).map((service) => <div key={service.id} className="rounded-lg border p-3"><p className="font-semibold">{service.name}</p><p className="text-sm text-slate-500">{service.durationMinutes} min · {formatMoney(service.priceCents, locale.currency, locale.locale)} · {service.requiresDeposit ? "con seña" : "sin seña"}</p></div>)}
          </div>
        </Card>
      </div>
      <FeatureMatrix path={path} />
    </div>
  );
}

function ServicesView({ business }: { business: typeof demoBusinessFallback | Awaited<ReturnType<typeof getBusinessBySlug>> }) {
  const locale = getLocaleConfig(business.country === "ES" ? "ES" : "AR");
  const services = "services" in business ? business.services : demoBusinessFallback.services;
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <Badge>CRUD real sin pagar</Badge>
        <h2 className="mt-3 text-xl font-bold">Crear servicio</h2>
        <p className="mt-2 text-sm text-slate-600">Se guarda en Postgres si está activo. Si no, queda persistido gratis en `data/agendaviva.local.json`.</p>
        <form action="/api/services" method="post" className="mt-5 grid gap-4">
          <input type="hidden" name="organizationId" value={business.id} />
          <Field label="Nombre"><input className={inputClass} name="name" placeholder="Corte + barba" required /></Field>
          <Field label="Descripción"><textarea className={`${inputClass} h-24 py-3`} name="description" placeholder="Qué incluye y para quién es." /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duración minutos"><input className={inputClass} name="durationMinutes" type="number" defaultValue="45" min="15" /></Field>
            <Field label={`Precio ${locale.currency}`}><input className={inputClass} name="price" type="number" defaultValue={locale.currency === "ARS" ? "25000" : "35"} min="0" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoría"><input className={inputClass} name="category" defaultValue="General" /></Field>
            <Field label="Seña opcional"><input className={inputClass} name="deposit" type="number" placeholder="0" /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input name="requiresDeposit" type="checkbox" value="true" />
            Requiere seña para confirmar
          </label>
          <button className="focus-ring h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-800" type="submit">Guardar servicio</button>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Servicios publicados</h2>
        <div className="mt-4 grid gap-3">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between gap-4 rounded-lg border bg-white p-4">
              <div>
                <p className="font-semibold">{service.name}</p>
                <p className="text-sm text-slate-500">{service.durationMinutes} min · {formatMoney(service.priceCents, locale.currency, locale.locale)} · {service.requiresDeposit ? "con seña" : "sin seña"}</p>
              </div>
              <Badge>{service.category}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AppointmentsView({ business }: { business: typeof demoBusinessFallback | Awaited<ReturnType<typeof getBusinessBySlug>> }) {
  const locale = getLocaleConfig(business.country === "ES" ? "ES" : "AR");
  const services = "services" in business ? business.services : demoBusinessFallback.services;
  const appointments = "appointments" in business ? business.appointments : [];
  const slots = getBusinessSlots(business);
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <Badge>Reserva manual</Badge>
        <h2 className="mt-3 text-xl font-bold">Crear reserva rápida</h2>
        <form action="/api/public/book" method="post" className="mt-5 grid gap-4">
          <input type="hidden" name="businessSlug" value={business.slug} />
          <Field label="Servicio"><select className={inputClass} name="serviceId">{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></Field>
          <Field label="Horario"><select className={inputClass} name="slot">{slots.map((slot) => <option key={slot.startAt.toISOString()} value={slot.startAt.toISOString()}>{slot.startAt.toLocaleString(locale.locale, { weekday: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</option>)}</select></Field>
          <Field label="Nombre cliente"><input className={inputClass} name="name" defaultValue="Cliente mostrador" required /></Field>
          <Field label="Email cliente"><input className={inputClass} name="email" type="email" defaultValue="cliente@example.com" required /></Field>
          <button className="focus-ring h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-800" type="submit">Crear reserva</button>
        </form>
      </Card>
      <Card>
        <h2 className="text-xl font-bold">Próximas reservas</h2>
        <div className="mt-4 grid gap-3">
          {appointments.length === 0 && <div className="rounded-lg border bg-emerald-50 p-4 text-sm text-slate-700">Todavía no hay reservas reales. Creá una desde el formulario o desde la página pública.</div>}
          {appointments.slice(0, 8).map((appointment) => {
            const service = services.find((item) => item.id === appointment.serviceId);
            return (
              <div key={appointment.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{service?.name ?? "Servicio"}</p>
                  <Badge>{appointment.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">{new Date(appointment.startAt).toLocaleString(locale.locale)} · {appointment.paymentStatus}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Link href={`/b/${business.slug}/reschedule/${appointment.rescheduleToken}`} className="rounded-full border px-3 py-1 font-semibold text-primary">Reprogramar</Link>
                  <Link href={`/b/${business.slug}/cancel/${appointment.cancelToken}`} className="rounded-full border px-3 py-1 font-semibold text-red-600">Cancelar</Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function CalendarView({ business }: { business: typeof demoBusinessFallback | Awaited<ReturnType<typeof getBusinessBySlug>> }) {
  const locale = getLocaleConfig(business.country === "ES" ? "ES" : "AR");
  const slots = getBusinessSlots(business);
  const rules = "availabilityRules" in business ? business.availabilityRules : [];
  const weekdays = [
    ["1", "Lunes"],
    ["2", "Martes"],
    ["3", "Miércoles"],
    ["4", "Jueves"],
    ["5", "Viernes"],
    ["6", "Sábado"],
    ["0", "Domingo"]
  ];

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <Badge>Disponibilidad real</Badge>
        <h2 className="mt-3 text-xl font-bold">Configurar horario semanal</h2>
        <p className="mt-2 text-sm text-slate-600">Esto alimenta la página pública, evita doble reserva y calcula los próximos horarios disponibles.</p>
        <form action="/api/schedule" method="post" className="mt-5 grid gap-4">
          <input type="hidden" name="organizationId" value={business.id} />
          <Field label="Día"><select className={inputClass} name="dayOfWeek">{weekdays.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Abre"><input className={inputClass} name="startTime" type="time" defaultValue="09:00" /></Field>
            <Field label="Cierra"><input className={inputClass} name="endTime" type="time" defaultValue="18:00" /></Field>
          </div>
          <Field label="Capacidad por slot"><input className={inputClass} name="capacity" type="number" min="1" defaultValue="1" /></Field>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input name="active" type="checkbox" value="true" defaultChecked />
            Día activo para reservas online
          </label>
          <button className="focus-ring h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-800" type="submit">Guardar horario</button>
        </form>
      </Card>
      <div className="grid gap-6">
        <Card>
          <h2 className="text-xl font-bold">Próximos horarios disponibles</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {slots.slice(0, 10).map((slot) => (
              <div key={slot.startAt.toISOString()} className="rounded-lg border bg-white p-3 text-sm font-semibold">
                {slot.startAt.toLocaleString(locale.locale, { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold">Reglas activas</h2>
          <div className="mt-4 grid gap-2">
            {rules.length === 0 && <p className="text-sm text-slate-600">Usando horario recomendado: lunes a viernes 9 a 18.</p>}
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between rounded-lg border bg-white p-3 text-sm">
                <span>Día {rule.dayOfWeek} · {rule.startTime} a {rule.endTime}</span>
                <Badge>{rule.active ? "activo" : "cerrado"}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getBusinessSlots(business: typeof demoBusinessFallback | Awaited<ReturnType<typeof getBusinessBySlug>>) {
  if ("availableSlots" in business && Array.isArray(business.availableSlots) && business.availableSlots.length > 0) {
    return business.availableSlots.map((slot) => ({ startAt: new Date(slot.startAt), endAt: new Date(slot.endAt) }));
  }
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(10, 30, 0, 0);
  return [0, 1, 2, 3, 4].map((index) => {
    const startAt = new Date(tomorrow.getTime() + index * 90 * 60_000);
    return { startAt, endAt: new Date(startAt.getTime() + 45 * 60_000) };
  });
}

function CustomersView({ business }: { business: typeof demoBusinessFallback | Awaited<ReturnType<typeof getBusinessBySlug>> }) {
  const customers = "customers" in business ? business.customers : demoBusinessFallback.customers;
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {customers.length === 0 && <Card className="md:col-span-3"><h2 className="font-bold">Aún no hay clientes</h2><p className="mt-2 text-sm text-slate-600">Cuando alguien reserve, aparecerá acá con historial, tags y acciones de recuperación.</p></Card>}
      {customers.map((customer) => (
        <Card key={customer.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">{customer.name}</h2>
              <p className="text-sm text-slate-500">No-shows: {customer.noShowCount}</p>
            </div>
            <Badge>{customer.tags?.[0] ?? "cliente"}</Badge>
          </div>
          <div className="mt-4 grid gap-2">
            <button className="focus-ring rounded-lg border px-3 py-2 text-left text-sm font-semibold">Enviar promo de regreso</button>
            <button className="focus-ring rounded-lg border px-3 py-2 text-left text-sm font-semibold">Crear reserva</button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function FeatureMatrix({ path }: { path: string }) {
  const items = [
    ["Modo demo", "Activo sin API keys y con logs visibles."],
    ["Modo real", "Se activa cuando configurás credenciales en .env o ajustes."],
    ["Permisos", "Owner/admin/staff/viewer con aislamiento por organización."],
    ["Upgrade prompt", "Límites de plan aplicados en UI y backend."]
  ];
  return (
    <Card>
      <h2 className="font-bold">{path.includes("payments") ? "Estado de proveedores" : "Controles operativos"}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {items.map(([name, text]) => <div key={name} className="rounded-lg bg-slate-50 p-4"><p className="font-semibold">{name}</p><p className="mt-1 text-sm text-slate-600">{text}</p></div>)}
      </div>
    </Card>
  );
}

function ConversationsView() {
  return (
    <div className="mt-6 grid min-h-[620px] gap-4 lg:grid-cols-[280px_1fr_300px]">
      <Card className="p-3">
        {["Martina Suárez", "Nicolás Gómez", "Valentina Ríos"].map((name, index) => <div key={name} className={`rounded-lg p-3 ${index === 0 ? "bg-primary text-white" : "hover:bg-slate-50"}`}><p className="font-semibold">{name}</p><p className="text-sm opacity-80">Quiere reservar mañana</p></div>)}
      </Card>
      <ChatDemo country="AR" />
      <Card>
        <h2 className="font-bold">Cliente y acciones</h2>
        <div className="mt-4 grid gap-3">
          {["Crear reserva", "Pedir pago", "Derivar a humano", "Aplicar promo de regreso"].map((item) => <button key={item} className="focus-ring rounded-lg border bg-white px-3 py-2 text-left text-sm font-semibold">{item}</button>)}
        </div>
      </Card>
    </div>
  );
}

function AiSettingsView() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h2 className="font-bold">Alma sigue tus reglas</h2>
        <div className="mt-4 grid gap-4">
          <Field label="Nombre del asistente"><input className={inputClass} defaultValue="Alma" /></Field>
          <Field label="Tono"><select className={inputClass} defaultValue="cercano"><option>profesional</option><option>cercano</option><option>premium</option><option>divertido</option><option>formal</option></select></Field>
          <Field label="Cuándo derivar a humano"><textarea className={`${inputClass} h-28 py-3`} defaultValue="Enojo, urgencia, confusión, mensajes prohibidos o baja confianza." /></Field>
        </div>
      </Card>
      <ChatDemo country="AR" />
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="mt-6 grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat label="Ingresos estimados" value="$4.2M" />
        <MiniStat label="Señas cobradas" value="$840k" />
        <MiniStat label="Horas ahorradas" value="18 h" />
        <MiniStat label="Reseñas recibidas" value="27" />
      </div>
      <Card>
        <h2 className="font-bold">Reservas por día</h2>
        <AnalyticsChart />
      </Card>
      <MoneyCalculator currency="ARS" locale="es-AR" />
    </div>
  );
}

function SettingsView() {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <Card>
        <h2 className="font-bold">QR marketing</h2>
        <div className="mt-4 grid h-48 place-items-center rounded-lg border bg-white">
          <QrCode className="h-24 w-24 text-primary" />
        </div>
        <p className="mt-3 text-sm text-slate-600">Imprimí este QR y pegalo en tu mostrador.</p>
      </Card>
      <Card>
        <h2 className="font-bold">Email log demo</h2>
        <div className="mt-4 grid gap-2 text-sm">
          {["Bienvenida", "Reserva confirmada", "Recordatorio 24h", "Pedido de reseña"].map((item) => <div key={item} className="rounded-lg border p-3">{item} · stored_demo</div>)}
        </div>
      </Card>
    </div>
  );
}

async function BusinessPublicPage({ parts }: { parts: string[] }) {
  const slug = parts[1] ?? "estetica-palermo";
  const business = await getBusinessBySlug(slug);
  const locale = getLocaleConfig(business.country === "ES" ? "ES" : "AR");
  const section = parts[2] ?? "home";
  const services = "services" in business ? business.services : demoBusinessFallback.services;
  const profile = business.profile ?? demoBusinessFallback.profile;
  const slots = getBusinessSlots(business);
  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Badge>Reservado con AgendaViva AI</Badge>
        </div>
        <div className="mt-8 rounded-lg bg-primary px-6 py-10 text-white shadow-soft">
          <h1 className="text-4xl font-bold">{profile.displayName}</h1>
          <p className="mt-3 max-w-2xl text-teal-50">{profile.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href={`/b/${slug}/book`} variant="secondary">{locale.reserveCta}</LinkButton>
            <LinkButton href={`https://wa.me/?text=${encodeURIComponent(`Quiero reservar en ${profile.displayName}`)}`} variant="secondary">Compartir por WhatsApp</LinkButton>
          </div>
        </div>
        {section === "book" ? (
          <Card className="mt-6">
            <h2 className="text-2xl font-bold">Elegí servicio y horario</h2>
            <form action="/api/public/book" method="post" className="mt-6 grid gap-4 md:grid-cols-2">
              <input type="hidden" name="businessSlug" value={slug} />
              <Field label="Servicio"><select className={inputClass} name="serviceId">{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></Field>
              <Field label="Horario"><select className={inputClass} name="slot">{slots.map((slot) => <option key={slot.startAt.toISOString()} value={slot.startAt.toISOString()}>{slot.startAt.toLocaleString(locale.locale, { weekday: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</option>)}</select></Field>
              <Field label="Nombre"><input className={inputClass} name="name" required /></Field>
              <Field label="Email"><input className={inputClass} name="email" type="email" required /></Field>
              <button className="focus-ring h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white md:col-span-2" type="submit">Confirmar y continuar a pago demo</button>
            </form>
          </Card>
        ) : section === "cancel" || section === "reschedule" || section === "review" ? (
          <Card className="mt-6">
            <h2 className="text-2xl font-bold">{section === "cancel" ? "Cancelar reserva" : section === "reschedule" ? "Reprogramar reserva" : "Dejar reseña"}</h2>
            <p className="mt-2 text-slate-600">Token seguro recibido. La acción se registra en base de datos o en modo local gratuito.</p>
            <form action="/api/public/appointment-action" method="post" className="mt-5">
              <input type="hidden" name="businessSlug" value={slug} />
              <input type="hidden" name="token" value={parts[3] ?? "demo-token"} />
              <input type="hidden" name="action" value={section} />
              <button className="focus-ring h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-800" type="submit">Guardar acción</button>
            </form>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {services.map((service) => <Card key={service.id}><h2 className="font-bold">{service.name}</h2><p className="mt-2 text-sm text-slate-600">{service.description}</p><p className="mt-4 font-bold">{formatMoney(service.priceCents, locale.currency, locale.locale)}</p><p className="text-sm text-slate-500">{service.durationMinutes} min · {service.requiresDeposit ? "requiere seña" : "sin seña"}</p></Card>)}
          </div>
        )}
      </section>
    </main>
  );
}

function AdminPage({ path }: { path: string }) {
  const items = ["Organizaciones activas", "MRR demo", "Trials por vencer", "Pagos fallidos", "Feature flags", "Health check"];
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Logo />
        <h1 className="mt-8 text-3xl font-bold">Admin SaaS</h1>
        <p className="mt-2 text-slate-600">{path} · gestión interna de AgendaViva AI.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((item, index) => <Card key={item}><p className="text-sm text-slate-500">{item}</p><p className="mt-2 text-2xl font-bold">{index === 1 ? "€8.940" : index === 5 ? "OK" : 24 + index}</p></Card>)}
        </div>
      </div>
    </main>
  );
}

function LegalPage({ type }: { type: string }) {
  const title = type === "privacy" ? "Política de privacidad" : type === "cookies" ? "Política de cookies" : "Términos del servicio";
  return (
    <main>
      <Header />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-4 text-slate-600">Plantilla informativa para AgendaViva AI. El usuario debe adaptar estos textos con asesoría profesional antes de operar en producción.</p>
        <div className="mt-8 grid gap-4">
          {["GDPR/LOPDGDD", "Consentimiento de marketing", "Opt-out de campañas", "Exportación y eliminación de datos", "Encargado de tratamiento", "Cookies técnicas y analíticas"].map((item) => <Card key={item}><h2 className="font-bold">{item}</h2><p className="mt-2 text-sm text-slate-600">Se informa el tratamiento, finalidad, base legal, conservación y canales de ejercicio de derechos sin hacer promesas legales absolutas.</p></Card>)}
        </div>
      </article>
    </main>
  );
}

function ReferralPage({ code }: { code?: string }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="max-w-xl text-center">
        <HeartHandshake className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-3xl font-bold">Invitá un negocio y ganá 1 mes gratis</h1>
        <p className="mt-3 text-slate-600">Código referido: <strong>{code}</strong>. El alta queda asociada cuando el negocio complete su trial.</p>
        <LinkButton href="/register" className="mt-6">Crear agenda con referido</LinkButton>
      </Card>
    </main>
  );
}
