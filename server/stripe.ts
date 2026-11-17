import Stripe from "stripe";
import type { Express, Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { bookings, payments, processedStripeEvents } from "../drizzle/schema";
import { getDb } from "./db";

function stripeClient() { return process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null; }
function browserOrigin(req: Request) { const origin = req.get("origin"); if (origin) return origin; const referer = req.get("referer"); if (referer) { try { return new URL(referer).origin; } catch {} } return "http://localhost:3000"; }

export async function createCheckoutSession(req: Request, input: { bookingId: string; customerEmail: string; customerName: string; amountClp: number; serviceName: string }) {
  const stripe = stripeClient();
  if (!stripe) return { checkoutUrl: `/confirmation?booking=${encodeURIComponent(input.bookingId)}&demo=stripe`, demo: true };
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: input.customerEmail,
    client_reference_id: input.bookingId,
    allow_promotion_codes: true,
    line_items: [{ price_data: { currency: "clp", product_data: { name: `Señal · ${input.serviceName}`, description: "Reserva de masaje a domicilio con Masajes Nanai" }, unit_amount: input.amountClp }, quantity: 1 }],
    metadata: { booking_id: input.bookingId, customer_name: input.customerName, customer_email: input.customerEmail },
    success_url: `${browserOrigin(req)}/confirmation?booking=${encodeURIComponent(input.bookingId)}&status=success`,
    cancel_url: `${browserOrigin(req)}/book/Nanai?booking=${encodeURIComponent(input.bookingId)}&status=cancelled`,
  });
  return { checkoutUrl: session.url, sessionId: session.id, demo: false };
}

export function registerStripeWebhook(app: Express) {
  app.post("/api/stripe/webhook", async (req: Request, res: Response) => {
    const stripe = stripeClient();
    const signature = req.get("stripe-signature");
    if (!stripe || !signature || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(400).json({ error: "Stripe webhook is not configured" });
    let event: Stripe.Event;
    try { event = stripe.webhooks.constructEvent(req.body as Buffer, signature, process.env.STRIPE_WEBHOOK_SECRET); } catch (error) { console.error("[Stripe] Invalid signature", error); return res.status(400).send("Invalid signature"); }
    const db = await getDb();
    if (!db) return res.status(503).json({ error: "Database unavailable" });
    const seen = await db.select({ id: processedStripeEvents.id }).from(processedStripeEvents).where(eq(processedStripeEvents.eventId, event.id)).limit(1);
    if (seen[0]) return res.json({ received: true, duplicate: true });
    await db.insert(processedStripeEvents).values({ eventId: event.id, eventType: event.type });
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingCode = session.metadata?.booking_id ?? session.client_reference_id;
      if (bookingCode) {
        const booking = await db.select().from(bookings).where(eq(bookings.publicCode, bookingCode)).limit(1);
        if (booking[0]) {
          await db.update(bookings).set({ status: "confirmed", holdExpiresAt: null, updatedAt: new Date() }).where(eq(bookings.id, booking[0].id));
          await db.update(payments).set({ status: "paid", stripeCheckoutSessionId: session.id, stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null, processedAt: new Date() }).where(and(eq(payments.bookingId, booking[0].id), eq(payments.status, "processing")));
        }
      }
    }
    return res.json({ received: true });
  });
}
