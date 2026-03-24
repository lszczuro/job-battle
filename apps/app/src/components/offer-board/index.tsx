"use client";

import { useRenderTool, CopilotChat } from "@copilotkit/react-core/v2";
import { OfferCardItem, OfferCard } from "./offer-card";
import { useState } from "react";
import { z } from "zod";

const offerSchema = z.object({
  id: z.string(),
  company_name: z.string(),
  target_role: z.string(),
  company_vibe: z.string(),
  emoji: z.string(),
  tech_stack: z.array(z.string()),
});

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
  },
];

interface OfferBoardProps {
  onSelectOffer: (offer: OfferCard) => void;
}

interface WelcomeScreenProps {
  input: React.ReactNode;
  onSelectOffer: (offer: OfferCard) => void;
  isSelecting: boolean;
}

function WelcomeScreen({ input, onSelectOffer, isSelecting }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto flex flex-col items-center px-6 py-8">
        {/* Intro */}
        <div className="text-center mb-8 max-w-sm">
          <div className="text-4xl mb-3">💼</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--foreground)" }}>
            Witaj w Job Battle!
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Wciel się w kandydata i przejdź rozmowę rekrutacyjną z AI.
            Wybierz gotową ofertę poniżej lub opisz czego szukasz — znajdziemy
            dopasowane stanowisko.
          </p>
        </div>

        {/* Section label */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--muted-foreground)" }}>
          Gotowe oferty
        </p>

        {/* Preset cards */}
        <div className="flex flex-wrap gap-6 justify-center">
          {PRESET_OFFERS.map((offer, i) => (
            <OfferCardItem
              key={offer.id}
              card={offer}
              index={i}
              onSelect={onSelectOffer}
              isLoading={isSelecting}
            />
          ))}
        </div>

        <p className="text-xs mt-8" style={{ color: "var(--muted-foreground)" }}>
          albo wpisz swoje preferencje poniżej ↓
        </p>
      </div>

      {/* Input passed from CopilotChat */}
      {input}
    </div>
  );
}

export function OfferBoard({ onSelectOffer }: OfferBoardProps) {
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSelect = (offer: OfferCard) => {
    setIsSelecting(true);
    onSelectOffer(offer);
  };

  useRenderTool(
    {
      name: "show_job_offers",
      parameters: z.object({ offers: z.array(offerSchema) }),
      render: ({ parameters }) => {
        const offers = parameters.offers ?? [];
        if (offers.length === 0) {
          return (
            <div className="flex items-center gap-2 py-4 px-2">
              <span className="text-2xl animate-bounce">🔍</span>
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Szukam ofert...
              </span>
            </div>
          );
        }
        return (
          <div className="flex flex-wrap gap-6 justify-center py-4 px-2">
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
        );
      },
    },
    [isSelecting, handleSelect],
  );

  return (
    <div className="h-full flex flex-col">
      <div
        className="px-4 py-3 shrink-0 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--card)" }}
      >
        <span className="text-lg">💼</span>
        <div>
          <div className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
            Job Battle
          </div>
          <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
            Wybierz ofertę lub opisz czego szukasz
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <CopilotChat
          welcomeScreen={({ input }: { input: React.ReactNode }) => (
            <WelcomeScreen
              input={input}
              onSelectOffer={handleSelect}
              isSelecting={isSelecting}
            />
          )}
          input={{ disclaimer: () => null, className: "pb-4" }}
        />
      </div>
    </div>
  );
}
