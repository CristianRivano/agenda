import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, datetime, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  timezone: varchar("timezone", { length: 64 }).notNull().default("America/Santiago"),
  location: varchar("location", { length: 160 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const therapists = mysqlTable("therapists", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  initials: varchar("initials", { length: 8 }).notNull(),
  specialty: varchar("specialty", { length: 180 }).notNull(),
  active: boolean("active").notNull().default(true),
});

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  slug: varchar("slug", { length: 80 }).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  category: varchar("category", { length: 80 }).notNull(),
  description: text("description").notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  priceClp: int("priceClp").notNull(),
  depositClp: int("depositClp").notNull(),
  active: boolean("active").notNull().default(true),
});

export const availability = mysqlTable("availability", {
  id: int("id").autoincrement().primaryKey(),
  therapistId: int("therapistId").notNull(),
  weekday: int("weekday").notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(),
  endTime: varchar("endTime", { length: 5 }).notNull(),
  breakStart: varchar("breakStart", { length: 5 }),
  breakEnd: varchar("breakEnd", { length: 5 }),
});

export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  zone: varchar("zone", { length: 120 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  publicCode: varchar("publicCode", { length: 32 }).notNull().unique(),
  businessId: int("businessId").notNull(),
  serviceId: int("serviceId").notNull(),
  therapistId: int("therapistId").notNull(),
  clientId: int("clientId").notNull(),
  startsAt: datetime("startsAt").notNull(),
  endsAt: datetime("endsAt").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).notNull().default("pending"),
  depositClp: int("depositClp").notNull(),
  totalClp: int("totalClp").notNull(),
  holdExpiresAt: timestamp("holdExpiresAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  amountClp: int("amountClp").notNull(),
  currency: varchar("currency", { length: 8 }).notNull().default("clp"),
  status: mysqlEnum("status", ["processing", "paid", "failed", "refunded"]).notNull().default("processing"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const processedStripeEvents = mysqlTable("processedStripeEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 255 }).notNull().unique(),
  eventType: varchar("eventType", { length: 120 }).notNull(),
  processedAt: timestamp("processedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Business = typeof businesses.$inferSelect;
export type Therapist = typeof therapists.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Client = typeof clients.$inferSelect;
