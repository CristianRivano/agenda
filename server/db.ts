import { and, eq, gte, gt, isNull, lt, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { fromZonedTime } from "date-fns-tz";
import { businesses, bookings, clients, InsertUser, services, therapists, users, availability } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) { values.role = user.role ?? "admin"; updateSet.role = values.role; }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function seedNanai() {
  const db = await getDb(); if (!db) return { seeded: false, reason: "database-unavailable" };
  const existing = await db.select().from(businesses).where(eq(businesses.slug, "Nanai")).limit(1);
  if (existing[0]) return { seeded: false, businessId: existing[0].id };
  const [business] = await db.insert(businesses).values({ slug: "Nanai", name: "Masajes Nanai", timezone: "America/Santiago", location: "Talca · atención a domicilio" }).$returningId();
  const businessId = business.id;
  const therapistRows = await db.insert(therapists).values([
    { businessId, name: "Sofía Rojas", initials: "SR", specialty: "Relajación y tejido profundo", active: true },
    { businessId, name: "Camila Torres", initials: "CT", specialty: "Descontracturante y deportivo", active: true },
  ]).$returningId();
  await db.insert(services).values([
    { businessId, slug: "nirvana", name: "Masaje Relajante Nirvana", category: "Relajación", description: "Pases largos y presión suave para bajar el ritmo.", durationMinutes: 60, priceClp: 30000, depositClp: 9000, active: true },
    { businessId, slug: "descontracturante", name: "Masaje Descontracturante", category: "Tensión muscular", description: "Trabajo focalizado en cuello, espalda y hombros.", durationMinutes: 60, priceClp: 28000, depositClp: 8400, active: true },
    { businessId, slug: "deep-tissue", name: "Tejido profundo", category: "Recuperación", description: "Presión progresiva sobre tejidos blandos.", durationMinutes: 60, priceClp: 35000, depositClp: 10500, active: true },
    { businessId, slug: "deportivo", name: "Deportivo de descarga", category: "Movimiento", description: "Una sesión cómoda para acompañar tu entrenamiento.", durationMinutes: 60, priceClp: 30000, depositClp: 9000, active: true },
    { businessId, slug: "drenaje", name: "Drenaje linfático manual", category: "Suave", description: "Movimientos superficiales y rítmicos.", durationMinutes: 60, priceClp: 30000, depositClp: 9000, active: true },
    { businessId, slug: "piernas", name: "Bienestar en piernas", category: "Descanso", description: "Pases lentos y ascendentes para descansar.", durationMinutes: 45, priceClp: 24000, depositClp: 7200, active: true },
  ]);
  for (const therapist of therapistRows) await db.insert(availability).values([1, 2, 3, 4, 5].map(weekday => ({ therapistId: therapist.id, weekday, startTime: "09:00", endTime: "19:00", breakStart: "13:00", breakEnd: "14:00" })));
  return { seeded: true, businessId };
}

export async function getNanaiCatalog() {
  const db = await getDb(); if (!db) return null;
  const business = (await db.select().from(businesses).where(eq(businesses.slug, "Nanai")).limit(1))[0];
  if (!business) return null;
  const [serviceRows, therapistRows] = await Promise.all([
    db.select().from(services).where(and(eq(services.businessId, business.id), eq(services.active, true))),
    db.select().from(therapists).where(and(eq(therapists.businessId, business.id), eq(therapists.active, true))),
  ]);
  return { business, services: serviceRows, therapists: therapistRows };
}

function asDateTime(date: string, time: string, timezone = "America/Santiago") { return fromZonedTime(`${date}T${time}:00`, timezone); }
export async function getAvailableSlots(date: string, serviceId: number, therapistId?: number) {
  const db = await getDb(); if (!db) return [];
  const service = (await db.select().from(services).where(eq(services.id, serviceId)).limit(1))[0];
  if (!service) return [];
  const business = (await db.select().from(businesses).where(eq(businesses.id, service.businessId)).limit(1))[0];
  const timezone = business?.timezone ?? "America/Santiago";
  const therapistRows = await db.select().from(therapists).where(and(eq(therapists.businessId, service.businessId), eq(therapists.active, true), therapistId ? eq(therapists.id, therapistId) : undefined));
  const output: Array<{ startsAt: Date; endsAt: Date; therapistId: number; therapistName: string }> = [];
  for (const therapist of therapistRows) {
    const rules = await db.select().from(availability).where(and(eq(availability.therapistId, therapist.id), eq(availability.weekday, new Date(`${date}T12:00:00`).getDay())));
    for (const rule of rules) {
      for (let minutes = toMinutes(rule.startTime); minutes + service.durationMinutes <= toMinutes(rule.endTime); minutes += 30) {
        if (rule.breakStart && rule.breakEnd && minutes < toMinutes(rule.breakEnd) && minutes + service.durationMinutes > toMinutes(rule.breakStart)) continue;
        const startsAt = asDateTime(date, fromMinutes(minutes), timezone); const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60000);
        const now = new Date();
        const activeStatus = or(eq(bookings.status, "confirmed"), and(eq(bookings.status, "pending"), or(isNull(bookings.holdExpiresAt), gt(bookings.holdExpiresAt, now))));
        const overlapping = await db.select({ id: bookings.id }).from(bookings).where(and(eq(bookings.therapistId, therapist.id), activeStatus, lt(bookings.startsAt, endsAt), gte(bookings.endsAt, startsAt))).limit(1);
        if (!overlapping[0]) output.push({ startsAt, endsAt, therapistId: therapist.id, therapistName: therapist.name });
      }
    }
  }
  return output.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

function toMinutes(value: string) { const [hours, minutes] = value.split(":").map(Number); return hours * 60 + minutes; }
function fromMinutes(value: number) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }

export async function upsertClient(input: { businessId: number; name: string; email: string; phone: string; zone: string; notes?: string }) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const existing = (await db.select().from(clients).where(and(eq(clients.businessId, input.businessId), eq(clients.email, input.email))).limit(1))[0];
  if (existing) { await db.update(clients).set({ ...input, updatedAt: new Date() }).where(eq(clients.id, existing.id)); return existing.id; }
  const [created] = await db.insert(clients).values(input).$returningId(); return created.id;
}
