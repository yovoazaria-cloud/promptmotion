import { NextResponse } from "next/server";
import Stripe from "stripe";
import {
  createUserScopedClient,
  getTokenFromRequest,
} from "@/lib/supabase";
const PLANS: Record<string, { priceId?: string; label: string }> = {
  creator: { priceId: process.env.STRIPE_PRICE_CREATOR, label: "Créateur" },
  pro: { priceId: process.env.STRIPE_PRICE_PRO, label: "Pro" },
};
/** Crée une session Stripe Checkout pour l'abonnement choisi */
export async function POST(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe n'est pas configuré côté serveur (STRIPE_SECRET_KEY)." },
      { status: 501 }
    );
  }
  const db = createUserScopedClient(token);
  const { data: authData } = await db.auth.getUser();
  const user = authData?.user;
  if (!user) {
    return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as { plan?: string } | null;
  const plan = PLANS[body?.plan ?? ""];
  if (!plan?.priceId) {
    return NextResponse.json(
      { error: "Plan indisponible (vérifiez STRIPE_PRICE_CREATOR / STRIPE_PRICE_PRO)." },
      { status: 400 }
    );
  }
  const stripe = new Stripe(stripeKey);
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    client_reference_id: user.id,
    metadata: { plan: body?.plan ?? "creator" },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/dashboard?checkout=cancel`,
  });
  return NextResponse.json({ url: session.url });
}