"use client";

import { OfferCardItem, OfferCard } from "./offer-card";
import { z } from "zod";

export const offerSchema = z.object({
  id: z.string(),
  company_name: z.string(),
  target_role: z.string(),
  company_vibe: z.string(),
  emoji: z.string(),
  tech_stack: z.array(z.string()),
});

export const PRESET_OFFERS: OfferCard[] = [
  {
    id: "preset-1",
    company_name: "NovaTech Sp. z o.o.",
    target_role: "Senior Python Developer",
    company_vibe: "scale-up, fintech, Warszawa, 200 os.",
    emoji: "🐍",
    tech_stack: ["Python", "FastAPI", "PostgreSQL", "Docker", "K8s"],
    difficulty: 2,
    company_quote: "Mały zespół, duże ambicje, brak procesów — czyli pełna autonomia!",
  },
  {
    id: "preset-2",
    company_name: "CloudBase S.A.",
    target_role: "Frontend Engineer (React)",
    company_vibe: "startup, SaaS B2B, Kraków / remote, 60 os.",
    emoji: "⚛️",
    tech_stack: ["React", "TypeScript", "Next.js", "Tailwind", "GraphQL"],
    difficulty: 3,
    company_quote: "Szukamy kogoś z 5-letnim doświadczeniem w technologii wydanej 3 lata temu",
  },
  {
    id: "preset-3",
    company_name: "DataFlow Systems",
    target_role: "Machine Learning Engineer",
    company_vibe: "korporacja, AI/ML, Wrocław, 500 os.",
    emoji: "🤖",
    tech_stack: ["Python", "PyTorch", "MLflow", "AWS", "Spark"],
    difficulty: 4,
    company_quote: "Oferujemy pracę z najnowszymi modelami AI w środowisku... Excela",
  },
];

interface WelcomeScreenProps {
  input: React.ReactNode;
  onSelectOffer: (offer: OfferCard) => void;
  isSelecting: boolean;
}

export function WelcomeScreen({ input, onSelectOffer, isSelecting }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-4 py-5">
        <div className="text-center mb-4 sm:mb-6 max-w-sm sm:max-w-lg w-full">
          <h2 className="text-xl sm:text-4xl font-bold sm:leading-tight mb-1 sm:mb-3" style={{ color: "var(--foreground)" }}>
            <span>💼 Job Battle</span>
          </h2>
          <p className="text-sm sm:mb-5" style={{ color: "var(--muted-foreground)" }}>
            <span>Jest poniedziałek rano. Za chwilę zaczynasz rozmowę rekrutacyjną, której nie zapomnisz.</span>
          </p>
        </div>

        {/* TODO: Live stats — only on desktop */}
        {/* <div
          className="hidden sm:flex items-center gap-2 text-xs rounded-full px-4 py-2 mb-6"
          style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span>
            Na żywo: <strong style={{ color: "var(--foreground)" }}>847 kandydatów odrzuconych dzisiaj</strong>
            {" · "}Średni wynik: <strong style={{ color: "var(--foreground)" }}>41/100</strong>
          </span>
        </div> */}

        <div className="flex items-center gap-3 w-full max-w-2xl lg:max-w-5xl mb-3">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
            Wybierz swoją ofertę
          </span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-2xl lg:max-w-5xl">
          {PRESET_OFFERS.map((offer) => (
            <OfferCardItem
              key={offer.id}
              card={offer}
              onSelect={onSelectOffer}
              isLoading={isSelecting}
            />
          ))}
        </div>

        <p className="text-s mt-4" style={{ color: "var(--muted-foreground)" }}>
          albo opisz czego szukasz poniżej ↓
        </p>
      </div>

      {input}
    </div>
  );
}
