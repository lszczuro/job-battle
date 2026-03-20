"use client";

export interface OfferCard {
  id: string;
  company_name: string;
  target_role: string;
  company_vibe: string;
  offered_salary: string;
  emoji: string;
  tech_stack: string[];
}

const CARD_COLORS = [
  { bg: "bg-yellow-100", border: "border-yellow-300", pin: "bg-yellow-400" },
  { bg: "bg-blue-100", border: "border-blue-300", pin: "bg-blue-400" },
  { bg: "bg-green-100", border: "border-green-300", pin: "bg-green-400" },
  { bg: "bg-pink-100", border: "border-pink-300", pin: "bg-pink-400" },
  { bg: "bg-purple-100", border: "border-purple-300", pin: "bg-purple-400" },
];

interface OfferCardProps {
  card: OfferCard;
  index: number;
  onSelect: (card: OfferCard) => void;
  isLoading?: boolean;
}

export function OfferCardItem({ card, index, onSelect, isLoading }: OfferCardProps) {
  const color = CARD_COLORS[index % CARD_COLORS.length];
  const rotation = (index % 3 === 0 ? -1.5 : index % 3 === 1 ? 1 : -0.5) + (index % 2 === 0 ? 0.5 : -0.3);

  return (
    <button
      onClick={() => !isLoading && onSelect(card)}
      disabled={isLoading}
      style={{ transform: `rotate(${rotation}deg)` }}
      className={`
        relative group cursor-pointer
        ${color.bg} ${color.border}
        border-2 rounded-sm shadow-md
        p-5 w-64 min-h-52
        transition-all duration-200
        hover:scale-105 hover:shadow-xl hover:z-10 hover:-translate-y-1
        disabled:opacity-60 disabled:cursor-not-allowed
        text-left
      `}
    >
      {/* Pin */}
      <div
        className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 ${color.pin} rounded-full shadow-sm border border-white/50`}
      />

      {/* Emoji */}
      <div className="text-4xl mb-3">{card.emoji}</div>

      {/* Role */}
      <h3 className="font-bold text-gray-800 text-sm leading-tight mb-1">
        {card.target_role}
      </h3>

      {/* Company */}
      <p className="font-semibold text-gray-700 text-xs mb-2">{card.company_name}</p>

      {/* Vibe */}
      <p className="text-gray-500 text-xs leading-tight mb-3">{card.company_vibe}</p>

      {/* Salary */}
      <div className="bg-white/60 rounded px-2 py-1 mb-3">
        <p className="text-gray-700 text-xs font-medium">{card.offered_salary}</p>
      </div>

      {/* Tech stack tags */}
      <div className="flex flex-wrap gap-1">
        {card.tech_stack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="bg-white/70 text-gray-600 text-[10px] px-1.5 py-0.5 rounded font-medium"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 rounded-sm bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow">
          Wybieram →
        </span>
      </div>
    </button>
  );
}
