// ============================================================
// Profils des modèles vidéo cibles.
// Chaque profil décrit CE que le modèle aime — c'est ce qui rend
// les prompts générés réellement efficaces, pas génériques.
// ============================================================
export type ModelId = "sora" | "kling" | "runway" | "veo" | "pika" | "luma";
export interface ModelProfile {
  id: ModelId;
  name: string;
  vendor: string;
  /** Durée max d'un plan en secondes */
  maxDurationSeconds: number;
  supportsNegativePrompt: boolean;
  supportsAudio: boolean;
  /** Où ouvrir l'outil pour générer la vidéo */
  openUrl: string;
  /** Guide de style injecté dans le méta-prompt (en anglais, pour le LLM) */
  styleGuide: string;
}
export const MODEL_PROFILES: ModelProfile[] = [
  {
    id: "sora",
    name: "Sora",
    vendor: "OpenAI",
    maxDurationSeconds: 20,
    supportsNegativePrompt: false,
    supportsAudio: true,
    openUrl: "https://sora.com",
    styleGuide:
      "Loves rich, story-like natural language paragraphs. Describe the scene as flowing prose: subject and action, environment, camera work, lighting, mood. Cinematography vocabulary works well (\"slow dolly-in\", \"35mm\", \"shallow depth of field\"). Avoid parameter tags and keyword soup; write 2-4 elegant sentences. Short dialogue and sound cues are supported.",
  },
  {
    id: "kling",
    name: "Kling",
    vendor: "Kuaishou",
    maxDurationSeconds: 10,
    supportsNegativePrompt: true,
    supportsAudio: false,
    openUrl: "https://klingai.com",
    styleGuide:
      "Prefers clear, structured prompts: [subject] + [action with one strong motion verb] + [scene] + [style/lighting]. Supports a negative_prompt field. Keep attention on ONE main motion; avoid multiple simultaneous actions. Image-to-video is strong: when animating an image, describe the MOTION, do not re-describe the image.",
  },
  {
    id: "runway",
    name: "Runway",
    vendor: "Runway",
    maxDurationSeconds: 10,
    supportsNegativePrompt: false,
    supportsAudio: false,
    openUrl: "https://runwayml.com",
    styleGuide:
      "Likes compact, front-loaded prompts: start with the camera movement, then subject and action, then scene details and lighting. Keywords beat prose; keep the prompt under roughly 500 characters. Text on screen is possible by quoting the exact text. Avoid negations in the main prompt.",
  },
  {
    id: "veo",
    name: "Veo",
    vendor: "Google",
    maxDurationSeconds: 8,
    supportsNegativePrompt: false,
    supportsAudio: true,
    openUrl: "https://labs.google/fx/tools/video-fx",
    styleGuide:
      "Handles detailed cinematic scene descriptions and NATIVE AUDIO: describe ambient sound, sound effects, and even one short dialogue line. Rich cinematography vocabulary is rewarded (lens, lighting, color grade). Structure: scene -> subject/action -> camera -> lighting/mood -> audio.",
  },
  {
    id: "pika",
    name: "Pika",
    vendor: "Pika Labs",
    maxDurationSeconds: 10,
    supportsNegativePrompt: true,
    supportsAudio: false,
    openUrl: "https://pika.art",
    styleGuide:
      "Short, punchy prompts work best (1-3 sentences), with optional inline parameters like \"-camera zoom in\" and \"-motion 3\". Focus on ONE clear subject and ONE clear motion. Avoid long paragraphs; the model ignores excess detail.",
  },
  {
    id: "luma",
    name: "Luma",
    vendor: "Luma AI",
    maxDurationSeconds: 9,
    supportsNegativePrompt: false,
    supportsAudio: false,
    openUrl: "https://lumalabs.ai/dream-machine",
    styleGuide:
      "Natural language with emphasis on MOTION and physics. Supports start/end keyframes for transitions. Describe how things move and how the camera moves; keep scene complexity moderate for coherent results.",
  },
];
export function getModel(id: string): ModelProfile | undefined {
  return MODEL_PROFILES.find((m) => m.id === id);
}