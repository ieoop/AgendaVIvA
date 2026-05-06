import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: ComponentProps<"button"> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <button
      className={cn(
        "focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        variant === "primary" && "bg-primary text-primary-foreground shadow-soft hover:bg-teal-800 hover:shadow-lg",
        variant === "secondary" && "border bg-white text-slate-900 hover:bg-slate-50 hover:shadow-md",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        className
      )}
      {...props}
    />
  );
}

export function LinkButton({ className, variant = "primary", ...props }: ComponentProps<typeof Link> & { variant?: "primary" | "secondary" | "ghost" }) {
  return (
    <Link
      className={cn(
        "focus-ring group inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        variant === "primary" && "bg-primary text-primary-foreground shadow-soft hover:bg-teal-800 hover:shadow-lg",
        variant === "secondary" && "border bg-white text-slate-900 hover:bg-slate-50 hover:shadow-md",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-lg border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md", className)} {...props} />;
}

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-700", className)} {...props} />;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

export const inputClass = "focus-ring h-11 rounded-lg border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400";
