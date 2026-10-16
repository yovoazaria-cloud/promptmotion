"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getModel } from "@/lib/models";
import type { GenerationResult } from "@/lib/prompt-engine";
interface PromptRow {
  id: string;
  idea: string;
  model: string;
  result: GenerationResult;
  created_at: string;
}
export default function DashboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PromptRow[] | null>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const { data: prompts, error } = await supabase
        .from("prompts")
        .select("id, idea, model, result, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (active && !error) setRows(prompts ?? []);
    });
    return () => {
      active = false;
    };
  }, [router]);
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Historique</h1>
        <Link href="/generate" className="btn-primary px-4 py-2 text-sm">
          + Nouvelle génération
        </Link>
      </div>
      {rows === null ? (
        <p className="mt-10 text-slate-400">Chargement…</p>
      ) : rows.length === 0 ? (
        <div className="card mt-10 text-center">
          <p className="text-4xl">🎬</p>
          <h2 className="mt-3 font-semibold">Aucun prompt pour le moment</h2>
          <p className="mt-1 text-sm text-slate-400">
            Générez votre premier prompt vidéo et il apparaîtra ici.
          </p>
          <Link href="/generate" className="btn-primary mt-6">
            Créer mon premier prompt
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map((row) => {
            const model = getModel(row.model);
            const first = row.result?.variants?.[0];
            return (
              <article key={row.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="chip">{model?.name ?? row.model}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(row.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <p className="mt-3 font-medium">« {row.idea} »</p>
                {first && (
                  <p className="mt-2 line-clamp-2 font-mono text-xs leading-relaxed text-slate-400">
                    {first.prompt}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  {row.result?.variants?.length ?? 0} variante(s) générée(s)
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}