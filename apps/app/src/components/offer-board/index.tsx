"use client";

import { useState, useTransition } from "react";
import { OfferCardItem, OfferCard } from "./offer-card";

const PRESET_OFFERS: OfferCard[] = [
  {
    id: "preset-1",
    company_name: "NovaTech Sp. z o.o.",
    target_role: "Senior Python Developer",
    company_vibe: "scale-up, fintech, Warszawa, 200 os.",
    emoji: "🐍",
    tech_stack: ["Python", "FastAPI", "PostgreSQL", "Docker", "K8s"],
  },
  {
    id: "preset-2",
    company_name: "CloudBase S.A.",
    target_role: "Frontend Engineer (React)",
    company_vibe: "startup, SaaS B2B, Kraków / remote, 60 os.",
    emoji: "⚛️",
    tech_stack: ["React", "TypeScript", "Next.js", "Tailwind", "GraphQL"],
  },
  {
    id: "preset-3",
    company_name: "DataFlow Systems",
    target_role: "Machine Learning Engineer",
    company_vibe: "korporacja, AI/ML, Wrocław, 500 os.",
    emoji: "🤖",
    tech_stack: ["Python", "PyTorch", "MLflow", "AWS", "Spark"],
  }
];

interface OfferBoardProps {
  onSelectOffer: (offer: OfferCard) => void;
}

export function OfferBoard({ onSelectOffer }: OfferBoardProps) {
  const [offers, setOffers] = useState<OfferCard[]>(PRESET_OFFERS);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSelecting, setIsSelecting] = useState(false);

  const handleRegenerate = () => {
    if (!input.trim() || isPending) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/generate-offers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preference: input }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.offers?.length) setOffers(data.offers);
        }
      } catch (e) {
        // keep current offers on error
      }
    });
  };

  const handleSelect = (offer: OfferCard) => {
    setIsSelecting(true);
    onSelectOffer(offer);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center py-10 px-6"
      style={{
        background: "radial-gradient(ellipse at 60% 0%, #fde68a22 0%, transparent 60%), #f5f0e8",
        backgroundImage:
          "radial-gradient(ellipse at 60% 0%, #fde68a22 0%, transparent 60%), linear-gradient(135deg, #f5f0e8 0%, #ede8df 100%)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <div className="text-4xl mb-3">💼</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Job Battle</h1>
        <p className="text-gray-500 text-sm">
          Wybierz ofertę i wejdź w rolę kandydata. Przejdź przez rozmowę HR i techniczną.
        </p>
      </div>

      {/* Input + Regenerate */}
      <div className="flex gap-2 mb-10 w-full max-w-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegenerate()}
          placeholder="Np. senior devops, fullstack JS, machine learning..."
          disabled={isPending || isSelecting}
          className="flex-1 px-4 py-2.5 rounded-lg border border-amber-300 bg-white/80 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-60"
        />
        <button
          onClick={handleRegenerate}
          disabled={!input.trim() || isPending || isSelecting}
          className="px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {isPending ? (
            <span className="animate-spin">↻</span>
          ) : (
            <>↻ Regeneruj</>
          )}
        </button>
      </div>

      {/* Cork board */}
      <div
        className="relative w-full max-w-5xl rounded-2xl p-10 shadow-inner"
        style={{
          background: "linear-gradient(135deg, #c8a06e 0%, #b8894f 100%)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {/* Cork texture overlay */}
        <div
          className="absolute inset-0 rounded-2xl opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px), repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
          }}
        />

        {isPending ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl animate-bounce mb-3">🔍</div>
              <p className="text-amber-100 font-medium">Szukam dopasowanych ofert...</p>
            </div>
          </div>
        ) : (
          <div className="relative flex flex-wrap gap-8 justify-center items-start py-4">
            {offers.map((offer, i) => (
              <OfferCardItem
                key={offer.id}
                card={offer}
                index={i}
                onSelect={handleSelect}
                isLoading={isSelecting}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-gray-400 text-xs mt-6">
        Kliknij karteczkę, żeby rozpocząć grę jako kandydat na to stanowisko
      </p>
    </div>
  );
}
