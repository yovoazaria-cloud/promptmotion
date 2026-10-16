import { NextResponse } from "next/server";
import {
  createUserScopedClient,
  getTokenFromRequest,
} from "@/lib/supabase";
/** Renvoie le solde de crédits et le plan de l'utilisateur connecté */
export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const db = createUserScopedClient(token);
  const { data: authData } = await db.auth.getUser();
  const user = authData?.user;
  if (!user) {
    return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  }
  const { data: profile } = await db
    .from("profiles")
    .select("credits, plan")
    .eq("id", user.id)
    .single();
  return NextResponse.json({
    credits: profile?.credits ?? 0,
    plan: profile?.plan ?? "free",
  });
}