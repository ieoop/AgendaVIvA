import { CalendarDays, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="AgendaViva AI">
      <span className="relative grid h-10 w-10 place-items-center rounded-lg bg-primary text-white shadow-soft">
        <CalendarDays className="h-5 w-5" />
        <MessageCircle className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-emerald-400 p-0.5 text-teal-950" />
        <Sparkles className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-cyan-300 p-0.5 text-teal-950" />
      </span>
      <span className="text-lg font-bold tracking-normal text-slate-950">AgendaViva AI</span>
    </Link>
  );
}
