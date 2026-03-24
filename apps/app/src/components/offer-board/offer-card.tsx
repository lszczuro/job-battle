"use client";

export interface OfferCard {
  id: string;
  company_name: string;
  target_role: string;
  company_vibe: string;
  emoji: string;
  tech_stack: string[];
  difficulty?: number; // 1-5
  company_quote?: string;
}

interface OfferCardProps {
  card: OfferCard;
  onSelect: (card: OfferCard) => void;
  isLoading?: boolean;
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} style={{ color: i < value ? "#facc15" : "var(--border)", fontSize: 11 }}>
          ★
        </span>
      ))}
    </div>
  );
}

export function OfferCardItem({ card, onSelect, isLoading }: OfferCardProps) {
  const difficulty = card.difficulty ?? 3;

  return (
    <button
      onClick={() => !isLoading && onSelect(card)}
      disabled={isLoading}
      className="group w-full text-left rounded-xl border p-3 transition-all duration-200 hover:shadow-md hover:z-10 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-3">
        {/* Emoji */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 mt-0.5"
          style={{ background: "var(--muted)" }}
        >
          {card.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <h3 className="font-semibold text-sm leading-tight" style={{ color: "var(--foreground)" }}>
              {card.target_role}
            </h3>
            <StarRating value={difficulty} />
          </div>

          <p className="text-xs mb-1.5" style={{ color: "var(--muted-foreground)" }}>
            {card.company_name}
          </p>

          <p className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>
            {card.company_vibe}
          </p>

          {card.company_quote && (
            <p className="text-xs italic mb-2 leading-snug line-clamp-2 sm:line-clamp-none" style={{ color: "var(--muted-foreground)" }}>
              "{card.company_quote}"
            </p>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {card.tech_stack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
