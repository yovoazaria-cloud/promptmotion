"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/generate");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-20">
      <h1 className="text-center text-3xl font-bold">Content de te revoir 👋</h1>
      <p className="mt-2 text-center text-sm text-slate-400">
        Connectez-vous pour retrouver vos prompts.
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm text-slate-400">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="input"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-slate-400">Mot de passe</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            className="input"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Un instant…" : "Se connecter"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Pas de compte ? Créez-le dans votre tableau de bord Supabase
        (Authentication → Users → Add user).
      </p>
    </div>
  );
}
