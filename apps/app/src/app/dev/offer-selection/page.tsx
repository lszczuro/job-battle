"use client";

import { OfferCardItem } from "@/components/offer-board/offer-card";
import type { OfferCard } from "@/components/offer-board/offer-card";

const PRESET_OFFERS: OfferCard[] = [
  {
    id: "preset-1",
    company_name: "NovaTech Sp. z o.o.",
    target_role: "Senior Python Developer",
    company_vibe: "scale-up, fintech, Warszawa, 200 os.",
    emoji: "🐍",
    tech_stack: ["Python", "FastAPI", "PostgreSQL", "Docker"],
    difficulty: 2,
    company_quote: "Mały zespół, duże ambicje, brak procesów — czyli pełna autonomia!",
  },
  {
    id: "preset-2",
    company_name: "CloudBase S.A.",
    target_role: "Frontend Engineer (React)",
    company_vibe: "startup, SaaS B2B, Kraków / remote, 60 os.",
    emoji: "⚛️",
    tech_stack: ["React", "TypeScript", "Next.js", "Tailwind"],
    difficulty: 3,
    company_quote: "Szukamy kogoś z 5-letnim doświadczeniem w technologii wydanej 3 lata temu",
  },
  {
    id: "preset-3",
    company_name: "DataFlow Systems",
    target_role: "Machine Learning Engineer",
    company_vibe: "korporacja, AI/ML, Wrocław, 500 os.",
    emoji: "🤖",
    tech_stack: ["Python", "PyTorch", "MLflow", "AWS"],
    difficulty: 4,
    company_quote: "Oferujemy pracę z najnowszymi modelami AI w środowisku... Excela",
  },
];

export default function OfferSelectionDevPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Top nav */}
      <div
        className="px-6 py-3 shrink-0 flex items-center justify-center"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">💼</span>
          <span className="font-bold text-base" style={{ color: "var(--foreground)" }}>
            Job Battle
          </span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 sm:px-6 py-6 sm:py-10">
        {/* Hero */}
        <div className="text-center mb-6 max-w-lg w-full">
          <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-3" style={{ color: "var(--foreground)" }}>
            AI ocenia twoje odpowiedzi.
          </h1>
          <p className="text-sm mb-5" style={{ color: "var(--muted-foreground)" }}>
            I potrafi wykryć, że używasz AI. Powodzenia.
          </p>
          <button
            className="px-6 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Zagraj teraz →
          </button>
        </div>

        {/* Live stats */}
        <div
          className="flex items-center gap-2 text-xs rounded-full px-4 py-2 mb-8 text-center"
          style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span>
            Na żywo: <strong style={{ color: "var(--foreground)" }}>847 kandydatów odrzuconych dzisiaj</strong>
            {" · "}Średni wynik: <strong style={{ color: "var(--foreground)" }}>41/100</strong>
          </span>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-3 w-full max-w-2xl mb-6">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
            Gotowe oferty
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
          {PRESET_OFFERS.map((offer) => (
            <OfferCardItem
              key={offer.id}
              card={offer}
              onSelect={() => {}}
              isLoading={false}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-2xl mb-6">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            albo
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        {/* Hint */}
        <p className="text-xs mb-4 text-center" style={{ color: "var(--muted-foreground)" }}>
          Nie widzisz swojej branży? Wpisz w chacie poniżej.
        </p>
      </div>

    </div>
  );
}
