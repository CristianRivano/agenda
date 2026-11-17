import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarBlank, CaretDown, CaretRight, Check, Clock, CreditCard, MapPin, ShieldCheck, Sparkle, UserCircle, WarningCircle } from "@phosphor-icons/react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "sonner";
import { Link as WouterLink, useLocation } from "wouter";
import { Button, Field, inputClass, Link, StatusPill } from "@/components/aria";
import { BrandMark } from "@/components/AppShell";
import { business, formatCLP, services, slotsByDate, therapists, type Service, type Slot, type Therapist } from "@/data/demo";
import { trpc } from "@/lib/trpc";

const formSchema = z.object({
  name: z.string().min(2, "Escribe tu nombre completo."),
  email: z.string().email("Revisa el formato de tu email."),
  phone: z.string().min(8, "Incluye un teléfono válido."),
  zone: z.string().min(2, "Indica tu sector para confirmar cobertura."),
  notes: z.string().max(300, "Máximo 300 caracteres.").optional(),
});
type FormValues = z.infer<typeof formSchema>;

function StepHeader({ number, title, detail, active, complete, onClick }: { number: string; title: string; detail?: string; active: boolean; complete: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 border-b border-[#75404a] px-5 py-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#E5A853] ${active ? "bg-[#5a2930]" : "hover:bg-[#5a2930]/60"}`} aria-expanded={active}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${complete ? "border-[#E5A853] bg-[#E5A853] text-[#3B141A]" : active ? "border-[#E5A853] text-[#f7d697]" : "border-[#8b5a55] text-[#c6a79b]"}`}>{complete ? <Check size={15} weight="bold" /> : number}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#fff6ed]">{title}</span>{detail && <span className="mt-0.5 block truncate text-xs text-[#c4a49a]">{detail}</span>}</span>{active ? <CaretDown size={16} className="text-[#E5A853]" /> : <CaretRight size={16} className="text-[#bda094]" />}</button>;
}

export default function Book() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [date, setDate] = useState<Date>(new Date(2026, 10, 18));
  const [slot, setSlot] = useState<Slot | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(900);
  const [isPaying, setIsPaying] = useState(false);
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<FormValues>({ resolver: zodResolver(formSchema), mode: "onChange" });
  const catalogQuery = trpc.public.catalog.useQuery(undefined, { retry: false });
  const holdMutation = trpc.public.hold.useMutation();
  const dateKey = format(date, "yyyy-MM-dd");
  const remoteServices = catalogQuery.data?.services?.map(item => ({ id: item.slug, dbId: item.id, name: item.name, shortName: item.name.replace(/^Masaje /, ""), category: item.category, description: item.description, duration: item.durationMinutes, price: item.priceClp, deposit: item.depositClp, tone: item.category })) ?? [];
  const availableServices = remoteServices.length ? remoteServices : services;
  const remoteTherapists = catalogQuery.data?.therapists?.map(item => ({ id: String(item.id), dbId: item.id, name: item.name, initials: item.initials, specialty: item.specialty, availability: "Disponibilidad real" })) ?? [];
  const availableTherapists = [{ id: "any", name: "Cualquiera disponible", initials: "∞", specialty: "La primera opción disponible", availability: "Más franjas" }, ...(remoteTherapists.length ? remoteTherapists : therapists.slice(1))];
  const slotsQuery = trpc.public.slots.useQuery({ date: dateKey, serviceId: service?.dbId ?? 0, therapistId: therapist?.dbId }, { enabled: Boolean(service?.dbId && step >= 4), retry: false });
  const availableSlots = useMemo(() => {
    if (slotsQuery.isSuccess) return slotsQuery.data.map((item, index) => { const start = new Date(item.startsAt); return { id: `db-${index}`, time: formatInTimeZone(start, business.timezone, "HH:mm"), localTime: new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit", hour12: false }).format(start), therapist: item.therapistName, status: "available" as const }; });
    return slotsByDate[dateKey] ?? [];
  }, [dateKey, slotsQuery.data, slotsQuery.isSuccess]);
  const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone.replace("/", " · ");

  useEffect(() => {
    if (!slot) return;
    const timer = window.setInterval(() => setSecondsLeft(value => value > 0 ? value - 1 : 0), 1000);
    return () => window.clearInterval(timer);
  }, [slot]);

  const selectService = (item: Service) => { setService(item); setTherapist(null); setSlot(null); setStep(2); };
  const selectTherapist = (item: Therapist) => { setTherapist(item); setStep(3); };
  const selectDate = (value: Date | undefined) => { if (!value) return; setDate(value); setSlot(null); setStep(4); };
  const selectSlot = (value: Slot) => { setSlot(value); setSecondsLeft(900); setStep(5); toast.success("Franja bloqueada por 15 minutos", { description: "Puedes completar tus datos con calma." }); };

  const onSubmit = async (values: FormValues) => {
    if (!service || !slot) return;
    setIsPaying(true);
    try {
      if (service.dbId) {
        const result = await holdMutation.mutateAsync({ serviceSlug: service.id, therapistId: therapist?.dbId, date: dateKey, time: slot.time, ...values });
        const expiresAt = new Date(result.holdExpiresAt).getTime();
        setSecondsLeft(Math.max(0, Math.round((expiresAt - Date.now()) / 1000)));
        localStorage.setItem("nanai-booking", JSON.stringify({ ...values, service: service.name, therapist: therapist?.name ?? slot.therapist, date: dateKey, time: slot.time, bookingId: result.publicCode }));
        if (result.demo || !result.checkoutUrl) { toast.info("Stripe está listo para conectarse", { description: "La reserva quedó guardada como pendiente." }); navigate(`/confirmation?booking=${result.publicCode}`); } else { window.location.href = result.checkoutUrl; }
      } else {
        const bookingId = `BN-${Date.now().toString().slice(-6)}`;
        localStorage.setItem("nanai-booking", JSON.stringify({ ...values, service: service.name, therapist: therapist?.name ?? slot.therapist, date: dateKey, time: slot.time, bookingId }));
        toast.info("Vista demo", { description: "La base de datos todavía no respondió; se conserva el flujo local." });
        navigate(`/confirmation?booking=${bookingId}`);
      }
    } catch (error) { toast.error("No pudimos bloquear esa franja", { description: error instanceof Error ? error.message : "Prueba otra hora disponible." }); } finally { setIsPaying(false); }
  };

  const stepDetail = { service: service?.shortName, therapist: therapist?.name, date: format(date, "EEE d MMM", { locale: es }), slot: slot ? `${slot.time} · ${slot.therapist}` : undefined };
  const formatCountdown = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  return <div className="min-h-screen bg-[#3B141A] text-[#FDF3E7]">
    <header className="border-b border-[#63323d] bg-[#351219]"><div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-8"><WouterLink href="/" asChild><Link><BrandMark /></Link></WouterLink><div className="hidden items-center gap-5 text-xs text-[#bda094] sm:flex"><span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#E5A853]" />Pago seguro con Stripe</span><span className="h-4 w-px bg-[#75404a]" /><span>Talca · {business.timezone}</span></div><WouterLink href="/" asChild><Link className="text-xs text-[#d4b4a7] hover:text-[#E5A853]">Salir</Link></WouterLink></div></header>
    <main className="mx-auto max-w-[1280px] px-5 py-7 lg:px-8 lg:py-10"><div className="mb-8 max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#bc8a61]">Reserva online · Masajes Nanai</p><h1 className="mt-2 font-serif text-4xl tracking-tight text-[#fff6ed]">Elige cómo quieres sentirte.</h1><p className="mt-2 text-sm text-[#c8a9a0]">Unos pocos pasos. La visita se coordina en tu casa y la señal se paga online.</p></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"><div className="overflow-hidden rounded-xl border border-[#75404a] bg-[#522129]">
      <section><StepHeader number="1" title="Elige tu masaje" detail={stepDetail.service} active={step === 1} complete={Boolean(service)} onClick={() => setStep(1)} />{step === 1 && <div className="grid gap-3 p-4 sm:grid-cols-2">{availableServices.map(item => <button type="button" key={item.id} onClick={() => selectService(item)} className={`rounded-xl border p-4 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#E5A853] ${service?.id === item.id ? "border-[#E5A853] bg-[#63372f]" : "border-[#75404a] bg-[#432027] hover:border-[#a16e44]"}`}><div className="flex items-start justify-between gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#bc8a61]">{item.category}</span><span className="text-xs text-[#c5a69a]">{item.duration} min</span></div><h2 className="mt-7 font-serif text-xl text-[#fff6ed]">{item.shortName}</h2><p className="mt-2 min-h-10 text-xs leading-5 text-[#c3a59b]">{item.description}</p><div className="mt-4 flex items-center justify-between border-t border-[#75404a] pt-3"><span className="text-sm font-semibold text-[#f7d697]">{formatCLP(item.price)}</span><span className="text-[11px] font-semibold text-[#E5A853]">Señal {formatCLP(item.deposit)}</span></div></button>)}</div>}</section>
      <section><StepHeader number="2" title="Elige tu masajista" detail={stepDetail.therapist} active={step === 2} complete={Boolean(therapist)} onClick={() => service && setStep(2)} />{step === 2 && <div className="space-y-2 p-4">{availableTherapists.map(item => <button type="button" key={item.id} onClick={() => selectTherapist(item)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#E5A853] ${therapist?.id === item.id ? "border-[#E5A853] bg-[#63372f]" : "border-[#75404a] bg-[#432027] hover:border-[#a16e44]"}`}><span className="grid h-10 w-10 place-items-center rounded-lg border border-[#9e6c43] bg-[#5d2b2d] text-sm font-semibold text-[#f7d697]">{item.initials}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.name}</span><span className="block text-xs text-[#bda094]">{item.specialty}</span></span><span className="text-[11px] text-[#c7aa9e]">{item.availability}</span></button>)}</div>}</section>
      <section><StepHeader number="3" title="Elige una fecha" detail={stepDetail.date} active={step === 3} complete={Boolean(date && step > 3)} onClick={() => therapist && setStep(3)} />{step === 3 && <div className="p-4"><div className="rounded-xl border border-[#75404a] bg-[#432027] p-3"><DayPicker mode="single" selected={date} onSelect={selectDate} locale={es} fromDate={new Date(2026, 10, 17)} toDate={new Date(2026, 11, 17)} showOutsideDays classNames={{ month_caption: "text-sm font-semibold text-[#fff6ed]", weekdays: "text-[#bda094]", day: "h-10 w-10 rounded-lg text-sm text-[#f5ddd0] hover:bg-[#6b3a32]", selected: "!bg-[#E5A853] !text-[#3B141A]", today: "border border-[#E5A853]", disabled: "text-[#72525a]" }} /></div><p className="mt-3 flex items-center gap-2 text-xs text-[#bda094]"><Clock size={14} className="text-[#E5A853]" />Las horas se muestran en Talca y también en tu zona local: {localZone}.</p></div>}</section>
      <section><StepHeader number="4" title="Elige una franja" detail={stepDetail.slot} active={step === 4} complete={Boolean(slot)} onClick={() => date && setStep(4)} />{step === 4 && <div className="p-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm text-[#d9b9ad]">Franjas para el {format(date, "EEEE d 'de' MMMM", { locale: es })}</p><span className="text-[11px] text-[#a98a80]">Zona del negocio: UTC−04</span></div>{slotsQuery.isLoading ? <div className="rounded-lg border border-[#75404a] bg-[#432027] p-8 text-center text-sm text-[#bda094]">Calculando disponibilidad real…</div> : slotsQuery.isError ? <div className="rounded-lg border border-[#8b5d3d] bg-[#633b27] p-8 text-center text-sm text-[#f3d5bd]">No pudimos calcular esta fecha. Prueba otra.</div> : availableSlots.length ? <div className="grid gap-2 sm:grid-cols-2">{availableSlots.map(item => <button type="button" key={item.id} onClick={() => selectSlot(item)} className="flex items-center justify-between rounded-lg border border-[#75404a] bg-[#432027] px-4 py-3 text-left outline-none transition hover:border-[#E5A853] focus-visible:ring-2 focus-visible:ring-[#E5A853]"><span><span className="block text-base font-semibold tabular-nums text-[#f7d697]">{item.time}</span><span className="mt-1 flex items-center gap-1 text-[11px] text-[#bda094]"><Clock size={12} />Tu hora local · {item.localTime}</span></span>{item.status === "popular" ? <StatusPill tone="orange">Popular</StatusPill> : <span className="text-[11px] text-[#c6aa9f]">{item.therapist}</span>}</button>)}</div> : <div className="rounded-lg border border-dashed border-[#75404a] p-8 text-center text-sm text-[#bda094]">No hay franjas para este día. Prueba otra fecha.</div>}</div>}</section>
      <section><div className="flex items-center gap-3 border-b border-[#75404a] px-5 py-4"><span className={`grid h-7 w-7 place-items-center rounded-full border text-xs font-bold ${slot ? "border-[#E5A853] bg-[#E5A853] text-[#3B141A]" : "border-[#8b5a55] text-[#c6a79b]"}`}>{slot ? <Check size={15} weight="bold" /> : "5"}</span><span className="text-sm font-semibold">Tus datos y pago</span></div>{step === 5 && <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5"><div className="rounded-lg border border-[#8b5d3d] bg-[#633b27] p-3 text-xs text-[#f3d5bd]"><div className="flex items-center gap-2 font-semibold text-[#f7d697]"><WarningCircle size={15} />Tu franja está bloqueada durante {formatCountdown}</div><p className="mt-1 text-[#dfbda6]">Completa tus datos para pasar a Stripe Checkout.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre completo" error={errors.name?.message}><input className={inputClass} placeholder="Ej. Javiera González" {...register("name")} /></Field><Field label="Email" error={errors.email?.message}><input className={inputClass} type="email" placeholder="tu@email.com" {...register("email")} /></Field><Field label="Teléfono" error={errors.phone?.message}><input className={inputClass} placeholder="+56 9 1234 5678" {...register("phone")} /></Field><Field label="Sector en Talca" hint="Solo necesitamos tu sector por ahora." error={errors.zone?.message}><input className={inputClass} placeholder="Ej. Las Rastras" {...register("zone")} /></Field></div><Field label="Notas para Nanai" hint="Alergias, preferencias de presión o detalles del espacio."><textarea className={`${inputClass} h-20 resize-none py-3`} placeholder="Cuéntanos algo que debamos saber…" {...register("notes")} /></Field><div className="border-t border-[#75404a] pt-5"><div className="flex items-center justify-between text-sm"><span className="text-[#c5a69a]">Señal a pagar ahora</span><span className="text-lg font-semibold text-[#f7d697]">{formatCLP(service?.deposit ?? 0)}</span></div><Button type="submit" className="mt-4 w-full" isDisabled={!isValid || isPaying || secondsLeft === 0}>{isPaying ? "Preparando Stripe Checkout…" : <><CreditCard size={17} />Pagar señal con Stripe</>}</Button><p className="mt-3 text-center text-[11px] leading-5 text-[#a98a80]">El saldo restante se paga al finalizar la sesión. No guardamos datos de tarjeta.</p></div></form>}</section>
    </div><aside className="xl:sticky xl:top-6"><div className="rounded-xl border border-[#75404a] bg-[#522129] p-5"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bc8a61]">Resumen de reserva</p><h2 className="mt-2 font-serif text-2xl text-[#fff6ed]">Tu momento Nanai</h2></div><CalendarBlank className="text-[#E5A853]" size={22} /></div><div className="mt-6 space-y-4">{[{label:"Masaje", value: service?.shortName ?? "Aún no elegido", icon: Sparkle},{label:"Masajista", value: therapist?.name ?? "Aún no elegido", icon: UserCircle},{label:"Fecha", value: date ? format(date, "EEE d MMM", { locale: es }) : "Aún no elegida", icon: CalendarBlank},{label:"Hora", value: slot ? `${slot.time} · Talca` : "Aún no elegida", icon: Clock}].map(item => <div key={item.label} className="flex items-start gap-3"><item.icon size={17} className="mt-0.5 text-[#bc8a61]" /><div><p className="text-[10px] uppercase tracking-[0.14em] text-[#a98a80]">{item.label}</p><p className="mt-1 text-sm font-medium text-[#f5ddd0]">{item.value}</p></div></div>)}</div><div className="my-5 border-t border-[#75404a]" /><div className="space-y-2 text-sm"><div className="flex justify-between text-[#c7a89c]"><span>Sesión</span><span>{formatCLP(service?.price ?? 0)}</span></div><div className="flex justify-between text-[#c7a89c]"><span>Señal online</span><span className="font-semibold text-[#f7d697]">{formatCLP(service?.deposit ?? 0)}</span></div><div className="flex justify-between text-[#c7a89c]"><span>Saldo en visita</span><span>{formatCLP((service?.price ?? 0) - (service?.deposit ?? 0))}</span></div></div></div><div className="mt-3 rounded-xl border border-[#75404a] bg-[#432027] p-4"><div className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-[#E5A853]" /><div><p className="text-sm font-semibold">Atención a domicilio</p><p className="mt-1 text-xs leading-5 text-[#bda094]">Nanai confirma cobertura, traslado y detalles prácticos después de recibir tu reserva.</p></div></div></div></aside></div></main>
  </div>;
}
