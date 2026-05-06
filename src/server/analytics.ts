export function estimateRecoveredValue(input: { appointments: number; averageTicketCents: number; noShowRate: number; replyMinutesPerDay: number }) {
  const lostRevenueCents = Math.round(input.appointments * input.averageTicketCents * (input.noShowRate / 100));
  const recoverableCents = Math.round(lostRevenueCents * 0.55);
  const hoursSaved = Math.round((input.replyMinutesPerDay * 30 * 0.7) / 60);
  return { lostRevenueCents, recoverableCents, hoursSaved };
}

export const demoSeries = [
  { day: "Lun", reservas: 12, ingresos: 420 },
  { day: "Mar", reservas: 16, ingresos: 560 },
  { day: "Mié", reservas: 9, ingresos: 330 },
  { day: "Jue", reservas: 18, ingresos: 710 },
  { day: "Vie", reservas: 21, ingresos: 850 },
  { day: "Sáb", reservas: 14, ingresos: 480 }
];
