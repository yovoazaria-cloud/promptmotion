import { NextResponse } from "next/server";
import {
  createUserScopedClient,
  getTokenFromRequest,
} from "@/lib/supabase";
import { getModel } from "@/lib/models";
import {
  buildSystemPrompt,
  buildUserMessage,
  parseGeneration,
  type GenerateOptions,
  type OutputLanguage,
} from "@/lib/prompt-engine";

const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const OPENAI_URL = `${OPENAI_BASE_URL}/chat/completions`;
const CHAT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

// Liste des emails admin (crédits illimités), séparés par des virgules
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

function normalizeOutputLanguage(v: unknown): OutputLanguage {
  if (v === "fr" || v === "both" || v === "en") return v;
  return "en";
}

export async function POST(req: Request) {
  // 1. Authentification
  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const db = createUserScopedClient(token);
  const { data: authData } = await db.auth.getUser();
  const user = authData?.user;
  if (!user) {
    return NextResponse.json(
      { error: "Session expirée. Reconnectez-vous." },
      { status: 401 }
    );
  }

  const isAdmin = isAdminEmail(user.email);

  // 2. Validation des entrées
  const body = (await req.json().catch(() => null)) as
    | (Partial<GenerateOptions> & { model?: string })
    | null;
  if (!body?.idea || body.idea.trim().length < 3) {
    return NextResponse.json(
      { error: "Décrivez votre idée (3 caractères minimum)." },
      { status: 400 }
    );
  }
  if (body.idea.length > 1000) {
    return NextResponse.json(
      { error: "Idée trop longue (1000 caractères max)." },
      { status: 400 }
    );
  }
  const model = getModel(body.model ?? "");
  if (!model) {
    return NextResponse.json({ error: "Modèle inconnu." }, { status: 400 });
  }
  const options: GenerateOptions = {
    idea: body.idea.trim(),
    style: body.style ?? "any",
    duration: Math.min(
      Math.max(Number(body.duration) || 5, 2),
      model.maxDurationSeconds
    ),
    aspect: body.aspect ?? "16:9",
    language: body.language ?? "fr",
    outputLanguage: normalizeOutputLanguage(body.outputLanguage),
  };

  // 3. Vérification des crédits (les admins passent toujours)
  if (!isAdmin) {
    const { data: profile } = await db
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();
    if (!profile || profile.credits <= 0) {
      return NextResponse.json(
        { error: "Crédits épuisés — passez au plan Créateur pour continuer." },
        { status: 402 }
      );
    }
  }

  // 4. Appel du LLM
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY manquante côté serveur (voir .env.local)." },
      { status: 500 }
    );
  }

  let completion: Response;
  try {
    completion = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildSystemPrompt(model, options) },
          { role: "user", content: buildUserMessage(options) },
        ],
      }),
    });
  } catch (err) {
    console.error("[generate] fetch error:", err);
    return NextResponse.json(
      { error: "Le moteur IA est injoignable. Réessayez." },
      { status: 502 }
    );
  }

  if (!completion.ok) {
    const errText = await completion.text().catch(() => "");
    console.error("[generate] API error:", completion.status, errText);
    return NextResponse.json(
      { error: `Le moteur IA n'a pas répondu (${completion.status}). Réessayez.` },
      { status: 502 }
    );
  }

  const payload = await completion.json();
  const raw: string | undefined = payload?.choices?.[0]?.message?.content;
  if (!raw) {
    return NextResponse.json(
      { error: "Réponse vide du moteur IA." },
      { status: 502 }
    );
  }

  let result;
  try {
    result = parseGeneration(raw);
  } catch (err) {
    console.error("[generate] parse error:", err, raw);
    return NextResponse.json(
      { error: "Réponse inattendue du moteur IA. Réessayez." },
      { status: 502 }
    );
  }

  // 5. Décrément d'un crédit (sauf pour les admins)
  if (!isAdmin) {
    const { error: creditError } = await db.rpc("use_credit");
    if (creditError) {
      return NextResponse.json({ error: "Crédits épuisés." }, { status: 402 });
    }
  }

  // 6. Historisation
  await db.from("prompts").insert({
    user_id: user.id,
    idea: options.idea,
    model: model.id,
    options: {
      style: options.style,
      duration: options.duration,
      aspect: options.aspect,
      outputLanguage: options.outputLanguage,
    },
    result,
  });

  const { data: updated } = await db
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    ...result,
    credits_remaining: updated?.credits ?? null,
    is_admin: isAdmin,
  });
}
