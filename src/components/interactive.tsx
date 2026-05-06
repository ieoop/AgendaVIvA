"use client";

import { useMemo, useState } from "react";
import { Bot, CalendarCheck, CreditCard, MessageSquare, Send, Sparkles } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { demoSeries, estimateRecoveredValue } from "@/server/analytics";
import { formatMoney } from "@/lib/utils";

export function MoneyCalculator({ currency = "EUR", locale = "es-ES" }: { currency?: string; locale?: string }) {
  const [appointments, setAppointments] = useState(180);
  const [ticket, setTicket] = useState(currency === "ARS" ? 38000 : 55);
  const [noShow, setNoShow] = useState(14);
  const [replyMinutes, setReplyMinutes] = useState(95);
  const result = estimateRecoveredValue({ appointments, averageTicketCents: ticket * 100, noShowRate: noShow, replyMinutesPerDay: replyMinutes });

  return (
    <Card className="grid gap-5">
      <div>
        <p className="text-sm font-semibold text-primary">Calculadora de agenda perdida</p>
        <h3 className="mt-1 text-2xl font-bold">Cuánto dinero se escapa por responder tarde</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Reservas al mes">
          <input className={inputClass} type="number" value={appointments} onChange={(event) => setAppointments(Number(event.target.value))} />
        </Field>
        <Field label="Ticket promedio">
          <input className={inputClass} type="number" value={ticket} onChange={(event) => setTicket(Number(event.target.value))} />
        </Field>
        <Field label="Ausencias %">
          <input className={inputClass} type="number" value={noShow} onChange={(event) => setNoShow(Number(event.target.value))} />
        </Field>
        <Field label="Minutos respondiendo por día">
          <input className={inputClass} type="number" value={replyMinutes} onChange={(event) => setReplyMinutes(Number(event.target.value))} />
        </Field>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Dinero perdido estimado" value={formatMoney(result.lostRevenueCents, currency, locale)} />
        <Metric label="Dinero recuperable" value={formatMoney(result.recoverableCents, currency, locale)} />
        <Metric label="Horas ahorrables al mes" value={`${result.hoursSaved} h`} />
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-emerald-50 p-4">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-bold text-teal-950">{value}</p>
    </div>
  );
}

export function ChatDemo({ country = "AR" }: { country?: "ES" | "AR" }) {
  const [message, setMessage] = useState(country === "ES" ? "Hola, quiero una cita para limpieza facial mañana" : "Hola, quiero un turno para limpieza facial mañana");
  const appointmentWord = country === "ES" ? "cita" : "turno";
  const response = useMemo(() => {
    const price = country === "ES" ? "65 EUR" : "$42.000";
    const intro = country === "ES" ? "Claro, tengo mañana 10:30, 12:00 o 16:15." : "Dale, tengo mañana 10:30, 12:00 o 16:15.";
    return `${intro} La limpieza facial dura 75 min y cuesta ${price}. Para confirmar la ${appointmentWord} te envío un link de seña segura.`;
  }, [country, appointmentWord]);

  return (
    <Card className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Demo interactiva</p>
          <h3 className="text-xl font-bold">Probá a Alma sin registrarte</h3>
        </div>
        <Sparkles className="h-6 w-6 text-emerald-500" />
      </div>
      <div className="grid gap-3 rounded-lg bg-slate-50 p-3">
        <Bubble side="right" icon={<MessageSquare className="h-4 w-4" />}>{message}</Bubble>
        <Bubble side="left" icon={<Bot className="h-4 w-4" />}>{response}</Bubble>
        <div className="grid gap-2 rounded-lg border bg-white p-3 text-sm md:grid-cols-3">
          <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-primary" /> Intención: reservar</span>
          <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Acción: pedir seña</span>
          <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Confianza: 92%</span>
        </div>
      </div>
      <div className="flex gap-2">
        <input className={`${inputClass} flex-1`} value={message} onChange={(event) => setMessage(event.target.value)} aria-label="Mensaje de cliente" />
        <Button type="button"><Send className="h-4 w-4" /> Simular</Button>
      </div>
    </Card>
  );
}

function Bubble({ side, icon, children }: { side: "left" | "right"; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[82%] gap-2 rounded-lg px-3 py-2 text-sm ${side === "right" ? "bg-primary text-white" : "bg-white text-slate-800 shadow-sm"}`}>
        {icon}
        <span>{children}</span>
      </div>
    </div>
  );
}

export function AnalyticsChart() {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={demoSeries}>
          <defs>
            <linearGradient id="agenda" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="reservas" stroke="#0f766e" fill="url(#agenda)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
