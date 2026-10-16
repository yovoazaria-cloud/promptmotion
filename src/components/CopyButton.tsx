"use client";

import { useState } from "react";

type CopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

export default function CopyButton({ text, label = "Copier", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erreur de copie :", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        copied
          ? "bg-green-600 text-white"
          : "bg-neutral-800 text-white hover:bg-neutral-700"
      } ${className}`}
    >
      {copied ? "✓ Copié !" : label}
    </button>
  );
}
