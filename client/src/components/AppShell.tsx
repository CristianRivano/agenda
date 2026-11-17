import { Link, useLocation } from "wouter";
import { CalendarBlank, ChartLineUp, CreditCard, GearSix, House, IdentificationCard, ListBullets, SignOut, Sparkle, UsersThree, Clock } from "@phosphor-icons/react";
import { Button, Link as AriaLink, StatusPill } from "./aria";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";

const navItems = [
  { path: "/app", label: "Hoy", icon: House, exact: true },
  { path: "/app/calendar", label: "Calendario", icon: CalendarBlank },
  { path: "/app/availability", label: "Disponibilidad", icon: Clock },
  { path: "/app/services", label: "Servicios", icon: Sparkle },
  { path: "/app/clients", label: "Clientes", icon: UsersThree },
  { path: "/app/payments", label: "Pagos", icon: CreditCard },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full border border-[#E5A853] text-sm font-bold text-[#E5A853]">N</span>{!compact && <span className="font-serif text-xl tracking-tight text-[#FDF3E7]">Agenda<span className="italic text-[#E5A853]">Nanai</span></span>}</div>;
}

export function AppShell({ children, title, eyebrow, action }: { children: React.ReactNode; title: string; eyebrow?: string; action?: React.ReactNode }) {
  const [location] = useLocation();
  const { user, loading, logout } = useAuth();
  const overviewQuery = trpc.owner.overview.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const current = location === "/app" ? "/app" : location;

  return <div className="min-h-screen bg-[#3B141A] text-[#FDF3E7]">
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[236px] border-r border-[#63323d] bg-[#351219] px-4 py-5 lg:flex lg:flex-col">
      <div className="mb-8 px-2"><BrandMark /></div>
      <div className="mb-5 rounded-xl border border-[#6b3b42] bg-[#522129] p-3"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-lg bg-[#E5A853] text-sm font-bold text-[#3B141A]">MN</div><div className="min-w-0"><p className="truncate text-sm font-semibold">Masajes Nanai</p><p className="text-xs text-[#c9a49a]">Talca · a domicilio</p></div></div><div className="mt-3 flex items-center justify-between"><StatusPill tone="green">Abierto hoy</StatusPill><span className="text-[11px] text-[#bda094]">UTC−04</span></div></div>
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a88680]">Operación</p>
      <nav className="space-y-1" aria-label="Navegación del workspace">{navItems.map(({ path, label, icon: Icon, exact }) => { const active = exact ? current === path : current.startsWith(path); return <Link key={path} href={path} asChild><AriaLink className={`group flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition ${active ? "bg-[#6b3a32] font-semibold text-[#f7d697]" : "text-[#d2b6aa] hover:bg-[#522129] hover:text-[#FDF3E7]"}`}><Icon size={18} weight={active ? "fill" : "regular"} />{label}{label === "Calendario" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#E5A853]" />}</AriaLink></Link>; })}</nav>
      <div className="mt-auto space-y-3"><div className="border-t border-[#63323d] pt-4"><Link href="/" asChild><AriaLink className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#bda094] hover:bg-[#522129] hover:text-[#FDF3E7]"><ListBullets size={17} />Ver vista pública</AriaLink></Link><button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[#bda094] hover:bg-[#522129] hover:text-[#FDF3E7]" onClick={() => void logout()}><SignOut size={17} />Cerrar sesión</button></div><div className="flex items-center gap-2 px-2 text-[11px] text-[#9d7e78]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#6a2b33] text-[10px] text-[#f5d9bc]">{user?.name?.slice(0, 2).toUpperCase() ?? "GO"}</span><span className="truncate">{loading ? "Comprobando sesión…" : user?.name ?? "Owner demo"}</span><GearSix className="ml-auto" size={15} /></div></div>
    </aside>
    <main className="min-h-screen lg:pl-[236px]">{!user && <div className="flex items-center justify-between gap-3 border-b border-[#8b5e3a] bg-[#6b4327] px-5 py-2.5 text-xs text-[#f7d697] lg:px-8"><span className="flex items-center gap-2"><IdentificationCard size={16} />Vista demo activa. Inicia sesión con Goauth para operar reservas reales.</span><Button variant="outline" className="h-7 px-3 text-xs" onPress={() => startLogin()}>Entrar con Goauth</Button></div>}<header className="flex items-end justify-between gap-4 border-b border-[#63323d] px-5 py-6 lg:px-8"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#bc8a61]">{eyebrow ?? "AgendaNanai · Masajes Nanai"}</p><h1 className="font-serif text-3xl tracking-tight text-[#fff6ed]">{title}</h1></div><div className="flex items-center gap-3">{action}<div className="hidden items-center gap-2 rounded-lg border border-[#6b3b42] bg-[#522129] px-3 py-2 text-xs text-[#d2b6aa] sm:flex"><span className={`h-2 w-2 rounded-full ${overviewQuery.isError ? "bg-[#e0a17b]" : overviewQuery.isLoading ? "bg-[#f7d697]" : "bg-[#b7c990]"}`} />{!user ? "Demo local" : overviewQuery.isLoading ? "Sincronizando…" : overviewQuery.isError ? "Error de sincronización" : `${overviewQuery.data?.bookings.length ?? 0} reservas sincronizadas`}</div></div></header><div className="px-5 py-6 lg:px-8">{children}</div></main>
  </div>;
}
