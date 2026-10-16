"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { MODEL_PROFILES, type ModelProfile } from "@/lib/models";
import {
  STYLE_OPTIONS,
  OUTPUT_LANGUAGE_OPTIONS,
  type OutputLanguage,
  type GenerationResult,
} from "@/lib/prompt-engine";

interface CreditsInfo {
  credits: number;
  plan: string;
}

type ApiResult = GenerationResult & { credits_remaining?: number };

export default function GeneratePage() {
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const [model, setModel] = useState<ModelProfile>(MODEL_PROFILES[0]);
  const [style, setStyle] = useState("cinematic");
  const [duration, setDuration] = useState(5);
  const [aspect, setAspect] = useState("16:9");
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);
  const [credits, setCredits] = useState<CreditsInfo | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  // Garde d'authentification
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  // La durée ne peut pas dépasser la limite du modèle choisi
  useEffect(() => {
    setDuration((d) => Math.min(d, model.maxDurationSeconds));
  }, [model]);

  const refreshCredits = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/credits", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setCredits(await res.json());
  }, []);

  useEffect(() => {
    refreshCredits();
  }, [refreshCredits]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (idea.trim().length < 3) {
      setError("Décrivez votre idée en quelques mots (3 caractères minimum).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          idea,
          model: model.id,
          style,
          duration,
          aspect,
          outputLanguage,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setError(payload.error ?? "Une erreur est survenue. Réessayez.");
        return;
      }
      setResult(payload);
      if (typeof payload.credits_remaining === "number") {
        setCredits((c) =>
          c ? { ...c, credits: payload.credits_remaining } : c
        );
      }
    } catch {
      setError("Réseau indisponible — réessayez.");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string, index: number) {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 1500);
  }

  function buildCopyText(v: {
    prompt: string;
    negative_prompt: string | null;
    prompt_fr?: string;
    prompt_en?: string;
  }): string {
    const parts: string[] = [v.prompt];
    if (v.negative_prompt) parts.push(`\nNegative prompt: ${v.negative_prompt}`);
    if (v.prompt_fr) parts.push(`\n\n--- Traduction FR ---\n${v.prompt_fr}`);
    if (v.prompt_en) parts.push(`\n\n--- English version ---\n${v.prompt_en}`);
    return parts.join("");
  }

  const currentLangHint = OUTPUT_LANGUAGE_OPTIONS.find(
    (o) => o.value === outputLanguage
  )?.hint;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Générateur</h1>
        {credits && (
          <span className="chip border-fuchsia-700/60 text-fuchsia-300">
            💳 {credits.credits} crédits · plan {credits.plan}
          </span>
        )}
      </div>

      {/* ---------- FORMULAIRE ---------- */}
      <form onSubmit={handleSubmit} className="card mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-300">
            Votre idée <span className="text-slate-500">(en français, même vague)</span>
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="ex. un renard roux traverse une forêt brumeuse à l'aube"
            className="input resize-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Modèle cible
            </label>
            <select
              value={model.id}
              onChange={(e) =>
                setModel(
                  MODEL_PROFILES.find((m) => m.id === e.target.value) ??
                    MODEL_PROFILES[0]
                )
              }
              className="input"
            >
              {MODEL_PROFILES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.vendor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="input"
            >
              {STYLE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Durée : {duration}s{" "}
              <span className="text-slate-500">
                (max {model.maxDurationSeconds}s pour {model.name})
              </span>
            </label>
            <input
              type="range"
              min={2}
              max={model.maxDurationSeconds}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-fuchsia-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Format
            </label>
            <select
              value={aspect}
              onChange={(e) => setAspect(e.target.value)}
              className="input"
            >
              <option value="16:9">16:9 — paysage (YouTube)</option>
              <option value="9:16">9:16 — vertical (TikTok / Reels)</option>
              <option value="1:1">1:1 — carré</option>
            </select>
          </div>

          {/* ---------- SÉLECTEUR DE LANGUE DU PROMPT ---------- */}
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-300">
              Langue du prompt final
            </label>
            <select
              value={outputLanguage}
              onChange={(e) =>
                setOutputLanguage(e.target.value as OutputLanguage)
              }
              className="input"
            >
              {OUTPUT_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {currentLangHint && (
              <p className="mt-1 text-xs text-slate-500">{currentLangHint}</p>
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-base"
        >
          {loading ? "Le réalisateur travaille…" : "✨ Générer 3 prompts (1 crédit)"}
        </button>
      </form>

      {/* ---------- RÉSULTATS ---------- */}
      {result && (
        <section className="mt-10 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Vos prompts pour{" "}
              <span className="gradient-text">{model.name}</span>
            </h2>
            <a
              href={model.openUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-fuchsia-400 hover:text-fuchsia-300"
            >
              Ouvrir {model.name} ↗
            </a>
          </div>

          {result.variants.map((v, i) => (
            <article key={i} className="card border-slate-700">
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip border-fuchsia-700/60 bg-fuchsia-950/40 text-fuchsia-300">
                  {v.label}
                </span>
                <span className="chip">{v.camera}</span>
                <span className="chip">{v.lighting}</span>
                <span className="chip">{v.style}</span>
                <span className="chip">⏱ {v.duration_hint}s</span>
              </div>

              <p className="mt-4 whitespace-pre-wrap rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-200">
                {v.prompt}
              </p>

              {v.prompt_fr && (
                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-fuchsia-900/40 bg-fuchsia-950/20 p-3 text-xs italic leading-relaxed text-fuchsia-200">
                  <span className="font-semibold not-italic">🇫🇷 Traduction : </span>
                  {v.prompt_fr}
                </p>
              )}

              {v.prompt_en && (
                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-blue-900/40 bg-blue-950/20 p-3 text-xs italic leading-relaxed text-blue-200">
                  <span className="font-semibold not-italic">
                    🇬🇧 Version anglaise :{" "}
                  </span>
                  {v.prompt_en}
                </p>
              )}

              {v.negative_prompt && (
                <p className="mt-2 rounded-xl border border-red-950 bg-red-950/30 p-3 text-xs text-red-300">
                  <span className="font-semibold">Prompt négatif : </span>
                  {v.negative_prompt}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs italic text-slate-500">
                  💡 {v.why_it_works}
                </p>
                <button
                  onClick={() => copy(buildCopyText(v), i)}
                  className="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                >
                  {copied === i ? "Copié ✓" : "Copier"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
