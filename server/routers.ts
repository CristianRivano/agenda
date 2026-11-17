import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { formatInTimeZone } from "date-fns-tz";
import { COOKIE_NAME } from "@shared/const";
import { bookings, businesses, clients, services, payments, therapists } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createCheckoutSession } from "./stripe";
import { getDb, getAvailableSlots, getNanaiCatalog, seedNanai, upsertClient } from "./db";

const publicBookingSchema = z.object({
  serviceSlug: z.string().min(1),
  therapistId: z.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  zone: z.string().min(2),
  notes: z.string().max(300).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  public: router({
    catalog: publicProcedure.query(async () => { await seedNanai(); return getNanaiCatalog(); }),
    slots: publicProcedure.input(z.object({ date: z.string(), serviceId: z.number().int().positive(), therapistId: z.number().int().positive().optional() })).query(({ input }) => getAvailableSlots(input.date, input.serviceId, input.therapistId)),
    booking: publicProcedure.input(z.object({ publicCode: z.string().min(3) })).query(async ({ input }) => { const db = await getDb(); if (!db) return null; const rows = await db.select({ booking: bookings, client: clients, service: services, therapist: therapists }).from(bookings).innerJoin(clients, eq(bookings.clientId, clients.id)).innerJoin(services, eq(bookings.serviceId, services.id)).innerJoin(therapists, eq(bookings.therapistId, therapists.id)).where(eq(bookings.publicCode, input.publicCode)).limit(1); return rows[0] ?? null; }),
    hold: publicProcedure.input(publicBookingSchema).mutation(async ({ input, ctx }) => {
      const db = await getDb(); if (!db) throw new Error("Database is not available");
      await seedNanai();
      const business = (await db.select().from(businesses).where(eq(businesses.slug, "Nanai")).limit(1))[0];
      if (!business) throw new Error("Business not found");
      const service = (await db.select().from(services).where(and(eq(services.businessId, business.id), eq(services.slug, input.serviceSlug))).limit(1))[0];
      if (!service) throw new Error("Service not found");
      const candidateSlots = await getAvailableSlots(input.date, service.id, input.therapistId);
      const chosen = candidateSlots.find(slot => formatInTimeZone(slot.startsAt, "America/Santiago", "HH:mm") === input.time);
      if (!chosen) throw new Error("That time is no longer available");
      const clientId = await upsertClient({ businessId: business.id, name: input.name, email: input.email, phone: input.phone, zone: input.zone, notes: input.notes });
      const publicCode = `BN-${Date.now().toString().slice(-6)}`;
      const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      const [created] = await db.insert(bookings).values({ publicCode, businessId: business.id, serviceId: service.id, therapistId: chosen.therapistId, clientId, startsAt: chosen.startsAt, endsAt: chosen.endsAt, status: "pending", depositClp: service.depositClp, totalClp: service.priceClp, holdExpiresAt, notes: input.notes }).$returningId();
      await db.insert(payments).values({ bookingId: created.id, amountClp: service.depositClp, currency: "clp", status: "processing" });
      const checkout = await createCheckoutSession(ctx.req, { bookingId: publicCode, customerEmail: input.email, customerName: input.name, amountClp: service.depositClp, serviceName: service.name });
      return { publicCode, holdExpiresAt, checkoutUrl: checkout.checkoutUrl, demo: checkout.demo };
    }),
  }),
  owner: router({
    overview: protectedProcedure.query(async () => { const db = await getDb(); if (!db) return { bookings: [], payments: [], clients: [] }; return { bookings: await db.select().from(bookings), payments: await db.select().from(payments) }; }),
    updateBooking: protectedProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(), therapistId: z.number().int().positive().optional(), startsAt: z.string().optional(), endsAt: z.string().optional() })).mutation(async ({ input }) => { const db = await getDb(); if (!db) throw new Error("Database is not available"); const update = { status: input.status, therapistId: input.therapistId, startsAt: input.startsAt ? new Date(input.startsAt) : undefined, endsAt: input.endsAt ? new Date(input.endsAt) : undefined, updatedAt: new Date() }; await db.update(bookings).set(update).where(eq(bookings.id, input.id)); return { success: true }; }),
  }),
});

export type AppRouter = typeof appRouter;
