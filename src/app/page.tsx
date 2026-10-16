import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { MODEL_PROFILES } from "@/lib/models";
const features = [
  {
    icon: "🎯",
    title: "Multi-modèles",
    text: "Chaque modèle vidéo a ses conventions. Nos prompts sont adaptés à Sora, Kling, Runway, Veo, Pika et Luma.",
  },
  {
    icon: "✨",
    title: "3 variantes par idée",
    text: "Cinématique, dynamique, ambiance artistique : comparez trois directions créatives en un clic.",
  },
  {
    icon: "🎥",
    title: "Vocabulaire de réalisateur",
    text: "Mouvements de caméra, éclairage, rythme : ce que 90 % des créateurs oublient d'écrire.",
  },
  {
    icon: "🇬🇧",
    title: "Anglais automatique",
    text: "Décrivez votre idée en français : le prompt final est rédigé en anglais, la langue où les modèles performent le mieux.",
  },
  {
    icon: "🚫",
    title: "Prompts négatifs",
    text: "Pour les modèles qui le supportent, on génère aussi ce qu'il faut éviter (artefacts, morphing, texte).",
  },
  {
    icon: "📚",
    title: "Bibliothèque personnelle",
    text: "Chaque génération est sauvegardée. Retrouvez, copiez et réutilisez vos meilleurs prompts.",
  },
];
const samplePrompt =
  "Slow dolly-in through dense morning fog as a red fox crosses a mossy forest path, golden rim light piercing through pine trees, cinematic 35mm anamorphic, shallow depth of field, atmospheric haze.";
export default function LandingPage() {
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <span className="chip mb-6">Nouveau — Sora 2, Kling 2.0, Veo 3</span>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
          Transformez une idée en <span className="gradient-text">prompt vidéo pro</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Les vidéos IA ratent à cause de prompts faibles. PromptMotion écrit pour vous le
          prompt que ferait un réalisateur : caméra, lumière, style, rythme.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/login" className="btn-primary">
            Essayer gratuitement →
          </Link>
          <Link href="#modeles" className="btn-secondary">
            Voir les modèles supportés
          </Link>
        </div>
        {/* Exemple concret */}
        <div className="mx-auto mt-14 grid max-w-4xl gap-4 text-left md:grid-cols-2">
          <div className="card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vous tapez
            </p>
            <p className="mt-3 text-lg">
              « un renard roux traverse une forêt brumeuse à l&apos;aube »
            </p>
          </div>
          <div className="card border-fuchsia-900/50 bg-fuchsia-950/20">
            <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-400">
              PromptMotion génère
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">{samplePrompt}</p>
            <CopyButton
              text={samplePrompt}
              label="Copier ce prompt"
              className="mt-4 text-xs font-medium text-fuchsia-400 hover:text-fuchsia-300"
            />
          </div>
        </div>
      </section>
      {/* ---------- FONCTIONNEMENT ---------- */}
      <section className="border-y border-slate-800 bg-slate-900/40 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
          {[
            { step: "1", title: "Décrivez votre idée", text: "En français, en une phrase. Même vague." },
            { step: "2", title: "Choisissez le modèle", text: "Sora, Kling, Runway, Veo, Pika, Luma…" },
            { step: "3", title: "Copiez-collez", text: "3 prompts prêts à l'emploi + réglages conseillés." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-600/20 text-xl font-bold text-fuchsia-400">
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      {/* ---------- FEATURES ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">Tout ce qu&apos;il faut pour bien générer</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card">
              <span className="text-2xl">{f.icon}</span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
      {/* ---------- MODÈLES ---------- */}
      <section id="modeles" className="border-y border-slate-800 bg-slate-900/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold">6 modèles, 6 langages</h2>
          <p className="mt-3 text-center text-slate-400">
            Sora aime la prose cinématographique, Kling un verbe d&apos;action fort, Pika des
            prompts courts. On adapte tout.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {MODEL_PROFILES.map((m) => (
              <span key={m.id} className="chip px-4 py-2 text-sm">
                {m.name} <span className="text-slate-500">· {m.vendor}</span>
              </span>
            ))}
          </div>
        </div>
      </section>
      {/* ---------- PRICING ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold">Des tarifs simples</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Découverte",
              price: "0 €",
              note: "30 crédits offerts",
              features: ["3 modèles", "1 génération/jour incluse", "Historique 7 jours"],
              cta: "Commencer gratuitement",
              highlight: false,
            },
            {
              name: "Créateur",
              price: "19 €",
              note: "/mois — 1000 crédits",
              features: ["Tous les modèles", "Variantes illimitées", "Historique complet"],
              cta: "Passer Créateur",
              highlight: true,
            },
            {
              name: "Pro / Agence",
              price: "49 €",
              note: "/mois — 5000 crédits",
              features: ["Tout le plan Créateur", "Presets de marque", "Support prioritaire"],
              cta: "Passer Pro",
              highlight: false,
            },
          ].map((p) => (
            <div
              key={p.name}
              className={`card flex flex-col ${
                p.highlight ? "border-fuchsia-600 ring-1 ring-fuchsia-600/50" : ""
              }`}
            >
              {p.highlight && (
                <span className="chip mb-3 self-start border-fuchsia-600 text-fuchsia-400">
                  Le plus populaire
                </span>
              )}
              <h3 className="font-semibold">{p.name}</h3>
              <p className="mt-2 text-3xl font-extrabold">
                {p.price}
                <span className="ml-1 text-sm font-normal text-slate-500">{p.note}</span>
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-300">
                {p.features.map((f) => (
                  <li key={f}>✓ {f}</li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-6 ${p.highlight ? "btn-primary" : "btn-secondary"}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}