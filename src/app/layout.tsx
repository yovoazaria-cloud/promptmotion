import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "PromptMotion — Générateur de prompts vidéo IA",
  description:
    "Transformez une simple idée en prompts vidéo professionnels, optimisés pour Sora, Kling, Runway, Veo, Pika et Luma.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold">
              🎬 Prompt<span className="text-fuchsia-400">Motion</span>
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/generate" className="hidden hover:text-fuchsia-400 sm:block">
                Générateur
              </Link>
              <Link href="/dashboard" className="hidden hover:text-fuchsia-400 sm:block">
                Historique
              </Link>
              <Link
                href="/login"
                className="rounded-xl bg-fuchsia-600 px-4 py-2 font-semibold text-white transition hover:bg-fuchsia-500"
              >
                Connexion
              </Link>
            </div>
          </nav>
        </header>
        <main className="min-h-[calc(100vh-9rem)]">{children}</main>
        <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
          PromptMotion © 2025 — Créez plus vite, publiez plus.
        </footer>
      </body>
    </html>
  );
}