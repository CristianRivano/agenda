import { Button as AriaButton, Link as AriaLink, type ButtonProps, type LinkProps } from "react-aria-components";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: ButtonProps & { variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" }) {
  return <AriaButton {...props} className={cn(
    "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#E5A853] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3B141A] disabled:cursor-not-allowed disabled:opacity-40",
    variant === "primary" && "bg-[#E5A853] text-[#3B141A] hover:bg-[#f0bc6b]",
    variant === "secondary" && "bg-[#6a2b33] text-[#FDF3E7] hover:bg-[#7a3540]",
    variant === "outline" && "border border-[#9e5b3b] bg-transparent text-[#FDF3E7] hover:border-[#E5A853] hover:text-[#E5A853]",
    variant === "ghost" && "text-[#f5dfc1] hover:bg-[#6a2b33]",
    variant === "danger" && "bg-[#8b3b3f] text-[#FDF3E7] hover:bg-[#a94c4f]",
    className,
  )} />;
}

export function Link({ className, ...props }: LinkProps) {
  return <AriaLink {...props} className={cn("outline-none focus-visible:ring-2 focus-visible:ring-[#E5A853] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3B141A]", className)} />;
}

export function IconButton({ label, className, variant = "ghost", ...props }: ButtonProps & { label: string; variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" }) {
  return <Button {...props} aria-label={label} variant={variant} className={cn("h-9 w-9 rounded-full p-0", className)} />;
}

export function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "gold" | "green" | "red" | "orange" }) {
  return <span className={cn(
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
    tone === "neutral" && "border-[#75404a] bg-[#5b2730] text-[#e9cdb9]",
    tone === "gold" && "border-[#c18c4c] bg-[#6b4327] text-[#f7d697]",
    tone === "green" && "border-[#68805d] bg-[#334832] text-[#cbdcb4]",
    tone === "red" && "border-[#a26059] bg-[#572d32] text-[#f2b5a4]",
    tone === "orange" && "border-[#b27447] bg-[#633924] text-[#f4bd8a]",
  )}>{children}</span>;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <div className="space-y-2"><label className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#d8b9a7]">{label}</label>{children}{hint && !error && <p className="text-xs text-[#bda094]">{hint}</p>}{error && <p className="text-xs font-medium text-[#efae94]">{error}</p>}</div>;
}

export const inputClass = "h-11 w-full rounded-lg border border-[#75404a] bg-[#432027] px-3 text-sm text-[#FDF3E7] outline-none placeholder:text-[#a98a80] focus:border-[#E5A853] focus:ring-2 focus:ring-[#E5A853]/25";
