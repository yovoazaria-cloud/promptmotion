

import { createClient } from "@supabase/supabase-js";
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
if (!supabaseUrl || !supabaseAnonKey) {
  // On ne plante pas au build : les pages publiques restent rendables.
  console.warn(
    "⚠️  NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes — " +
      "copie .env.example vers .env.local (voir README)."
  );
}
/** Client navigateur (auth, lecture historique via RLS) */
export const supabase = createClient(
  supabaseUrl ?? "http://localhost:54321",
  supabaseAnonKey ?? "placeholder"
);
/** Récupère le token JWT envoyé par le front dans l'en-tête Authorization */
export function getTokenFromRequest(req: Request): string | null {
  const header = req.headers.get("authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7) : null;
}
/** Client Supabase "agissant comme l'utilisateur" pour les API routes */
export function createUserScopedClient(token: string) {
  return createClient(supabaseUrl ?? "http://localhost:54321", supabaseAnonKey ?? "placeholder", {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}
/** Client admin (service_role) — serveur uniquement, jamais côté navigateur */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(supabaseUrl ?? "http://localhost:54321", serviceKey);
}