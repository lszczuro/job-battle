export function OfferCard({ offer }: { offer: Record<string, unknown> }) {
  return (
    <div
      className="rounded-xl px-5 py-4 flex items-start gap-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <span className="text-3xl leading-none mt-0.5">{offer.emoji as string}</span>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>
          {offer.target_role as string}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {offer.company_name as string} · {offer.company_vibe as string}
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {(offer.tech_stack as string[]).map((tech) => (
            <span
              key={tech}
              className="text-[10px] px-1.5 py-0.5 rounded font-medium font-mono"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedbackBlock({ label, text }: { label: string; text: string }) {
  return (
    <div
      className="rounded-xl px-5 py-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
        {label}
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
        {text}
      </p>
    </div>
  );
}

export function ResultHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center pt-2">
      <div className="text-5xl">{emoji}</div>
      <h1 className="text-2xl font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.92)" }}>
        {title}
      </h1>
      <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
        {subtitle}
      </p>
    </div>
  );
}
