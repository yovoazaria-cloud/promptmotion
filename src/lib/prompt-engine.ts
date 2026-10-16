// ============================================================
// LE MOTEUR — le cœur différenciant du produit.
//
// Un "méta-prompt" transforme une idée brute de l'utilisateur en
// 3 prompts vidéo professionnels, adaptés aux conventions du
// modèle cible (Sora, Kling, Runway, Veo, Pika, Luma).
//
// Voir docs/02-PROMPT-SYSTEM.md pour la méthodologie d'itération.
// ============================================================

import type { ModelProfile } from "./models";

/** Langue du prompt final */
export type OutputLanguage = "en" | "fr" | "both";

export interface GenerateOptions {
  /** L'idée brute de l'utilisateur (n'importe quelle langue) */
  idea: string;
  /** Style demandé (valeur de STYLE_OPTIONS) */
  style: string;
  /** Durée cible en secondes */
  duration: number;
  /** Ratio d'aspect : "16:9" | "9:16" | "1:1" */
  aspect: string;
  /** Langue des libellés et explications (le prompt peut être dans une autre langue) */
  language: string;
  /** Langue du prompt final : EN (recommandé), FR, ou les deux */
  outputLanguage?: OutputLanguage;
}

export interface PromptVariant {
  /** Libellé court dans la langue de l'utilisateur, ex. "Cinématique" */
  label: string;
  /** Le prompt final dans la langue choisie */
  prompt: string;
  /** Prompt négatif si le modèle le supporte, sinon null */
  negative_prompt: string | null;
  /** Résumé mouvement caméra (langue utilisateur) */
  camera: string;
  /** Résumé éclairage (langue utilisateur) */
  lighting: string;
  /** Résumé style (langue utilisateur) */
  style: string;
  duration_hint: number;
  /** Une phrase expliquant la technique utilisée (langue utilisateur) */
  why_it_works: string;
  /** Traduction française si outputLanguage === "both" */
  prompt_fr?: string;
  /** Traduction anglaise si outputLanguage === "fr" (pour info) */
  prompt_en?: string;
}

export interface GenerationResult {
  model: string;
  variants: PromptVariant[];
}

export const STYLE_OPTIONS = [
  { value: "any", label: "Laisser le moteur choisir" },
  { value: "cinematic", label: "Cinématique (film)" },
  { value: "realistic", label: "Réaliste / documentaire" },
  { value: "anime", label: "Anime" },
  { value: "3d", label: "3D / animation (style Pixar)" },
  { value: "hyperreal", label: "Hyperréaliste publicitaire" },
  { value: "retro", label: "Rétro (VHS, argentique)" },
] as const;

export const OUTPUT_LANGUAGE_OPTIONS: {
  value: OutputLanguage;
  label: string;
  hint: string;
}[] = [
  {
    value: "en",
    label: "🇬🇧 Anglais (recommandé)",
    hint: "Meilleure qualité sur Sora, Kling, Runway, Veo…",
  },
  {
    value: "fr",
    label: "🇫🇷 Français",
    hint: "Pour comprendre le prompt — qualité légèrement réduite",
  },
  {
    value: "both",
    label: "🌍 Les deux (anglais + français)",
    hint: "Prompt en anglais + traduction française en dessous",
  },
];

function promptLanguageRule(outputLanguage: OutputLanguage): string {
  switch (outputLanguage) {
    case "fr":
      return `3. "prompt" must be written in FRENCH. Also provide "prompt_en" with the equivalent ENGLISH version (video models perform better in English — this helps the user copy it if needed).`;
    case "both":
      return `3. "prompt" must be written in ENGLISH (video models perform best in English). Also provide "prompt_fr" with the equivalent FRENCH translation for the user's understanding.`;
    case "en":
    default:
      return `3. "prompt" must ALWAYS be written in ENGLISH (video models perform best in English), following the model conventions above and formatted exactly the way this model likes it.`;
  }
}

function jsonSchemaForLang(outputLanguage: OutputLanguage): string {
  const base = `{"label":"...","prompt":"...","negative_prompt":null,"camera":"...","lighting":"...","style":"...","duration_hint":DURATION,"why_it_works":"..."`;
  if (outputLanguage === "fr") {
    return `{"variants":[${base},"prompt_en":"..."}]}`.replace("DURATION", "${options.duration}");
  }
  if (outputLanguage === "both") {
    return `{"variants":[${base},"prompt_fr":"..."}]}`.replace("DURATION", "${options.duration}");
  }
  return `{"variants":[${base}]}`.replace("DURATION", "${options.duration}");
}

export function buildSystemPrompt(
  model: ModelProfile,
  options: GenerateOptions
): string {
  const outputLanguage: OutputLanguage = options.outputLanguage ?? "en";
  const negativeRule = model.supportsNegativePrompt
    ? `"negative_prompt": a short comma-separated list of things to AVOID (e.g. "artifacts, morphing, blurry, text, watermark"). Keep it relevant to the scene.`
    : `"negative_prompt": always null (this model does not support negative prompts).`;

  const langRule = promptLanguageRule(outputLanguage);

  const jsonExample = jsonSchemaForLang(outputLanguage).replace(
    "DURATION",
    String(options.duration)
  );

  return `You are an elite AI video prompt engineer. Your job: transform a short user idea into 3 ready-to-use, high-quality prompts for ONE specific AI video generation model.

## Target model: ${model.name} (${model.vendor})
Conventions:
${model.styleGuide}
Max duration: ${model.maxDurationSeconds} seconds. Native audio: ${
    model.supportsAudio ? "supported" : "not supported"
  }.

## User intent
- Requested style: ${options.style}
- Requested aspect ratio: ${options.aspect}
- Target duration: ${options.duration} seconds
- Language for labels and explanations: ${options.language}
- Language of the final prompt: ${outputLanguage}

## Hard rules
1. Return ONLY a valid JSON object, no markdown fences, matching exactly:
${jsonExample}
2. Exactly 3 variants with three DISTINCT creative directions (different camera movement, lighting and rhythm). "label" must be short, written in ${options.language}, e.g. "Cinématique", "Dynamique", "Ambiance artistique" — adapt to the idea.
${langRule}
4. Expand the idea with concrete, sensory visual details (materials, textures, atmosphere, color palette) but NEVER contradict or replace the user's core idea. If the idea is vague, make ONE clear creative choice and commit to it.
5. ONE scene and ONE main action per prompt. Use strong motion verbs and explicit camera direction. Always describe what moves and how.
6. ${negativeRule}
7. "camera", "lighting", "style": 2-6 word summaries in ${options.language}.
8. "duration_hint": integer seconds between 2 and ${model.maxDurationSeconds}.
9. "why_it_works": ONE sentence in ${options.language} explaining the prompt-engineering technique used.
10. Do not add extra keys, comments, or any text outside the JSON.`;
}

export function buildUserMessage(options: GenerateOptions): string {
  return JSON.stringify({
    idea: options.idea,
    requested_style: options.style,
    aspect_ratio: options.aspect,
    duration_seconds: options.duration,
    labels_language: options.language,
    output_language: options.outputLanguage ?? "en",
  });
}

/** Parse robuste de la réponse du LLM (tolère les fences markdown) */
export function parseGeneration(raw: string): GenerationResult {
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Aucun JSON trouvé dans la réponse du moteur");
  }
  const parsed = JSON.parse(text.slice(start, end + 1)) as GenerationResult;
  if (!Array.isArray(parsed.variants) || parsed.variants.length === 0) {
    throw new Error("Variantes manquantes dans la réponse");
  }
  return parsed;
}
