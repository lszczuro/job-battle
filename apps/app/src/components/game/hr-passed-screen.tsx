import { ProgressTracker } from "./progress-tracker";
import { OfferCard, FeedbackBlock, ResultHeader } from "./result-ui";

export function HRPassedScreen({
  state,
  onStartTech,
}: {
  state: Record<string, unknown> | null;
  onStartTech: () => void;
}) {
  const hrScore = state?.hr_score as number | null;
  const hrFeedback = state?.hr_feedback as string | null;
  const offer = state?.selected_offer as Record<string, unknown> | null;

  const scoreColor =
    hrScore !== null && hrScore >= 70
      ? { text: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" }
      : hrScore !== null && hrScore >= 50
      ? { text: "#facc15", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)" }
      : { text: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" };

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "#0e0e14" }}
    >
      <div className="w-full max-w-xl flex flex-col gap-5">

        <ProgressTracker hr="done" wynik="pending" />

        {offer && <OfferCard offer={offer} />}

        <ResultHeader emoji="🎉" title="Rozmowa HR zaliczona!" subtitle="Przeszedłeś do etapu rozmowy technicznej" />

        {hrScore !== null && (
          <div
            className="flex items-center justify-between rounded-xl px-5 py-4"
            style={{ background: scoreColor.bg, border: `1px solid ${scoreColor.border}` }}
          >
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: scoreColor.text, opacity: 0.6 }}>
              Wynik HR
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums" style={{ color: scoreColor.text }}>
                {hrScore}
              </span>
              <span className="text-sm" style={{ color: scoreColor.text, opacity: 0.5 }}>/ 100</span>
            </div>
          </div>
        )}

        {hrFeedback && <FeedbackBlock label="Ocena rekrutera" text={hrFeedback} />}

        <div
          className="rounded-xl px-5 py-4 flex items-center gap-3"
          style={{ background: "rgba(59,79,216,0.08)", border: "1px solid rgba(59,79,216,0.2)" }}
        >
          <span className="text-xl">💻</span>
          <div>
            <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
              Następny etap: Rozmowa techniczna
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Pytania o kod, architekturę i rozwiązywanie problemów
            </p>
          </div>
        </div>

        <button
          onClick={onStartTech}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #3b4fd8 0%, #6d28d9 100%)",
            color: "rgba(255,255,255,0.95)",
          }}
        >
          Rozpocznij rozmowę techniczną →
        </button>

      </div>
    </div>
  );
}
