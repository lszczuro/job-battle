import { ProgressTracker } from "./progress-tracker";
import { OfferCard, FeedbackBlock, ResultHeader } from "./result-ui";

export function GameResultScreen({
  state,
  type,
  onRestart,
}: {
  state: Record<string, unknown> | null;
  type: "offer" | "rejected";
  onRestart: () => void;
}) {
  const hrScore = state?.hr_score as number | null;
  const techScore = state?.tech_score as number | null;
  const finalSummary = state?.final_summary as string | null;
  const offer = state?.selected_offer as Record<string, unknown> | null;

  const isOffer = type === "offer";
  const techStepState: "done" | "failed" = isOffer ? "done" : "failed";

  const scoreColor = (score: number | null) => {
    if (score === null) return { text: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.1)" };
    if (score >= 70) return { text: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" };
    if (score >= 50) return { text: "#facc15", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)" };
    return { text: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" };
  };

  const hrColors = scoreColor(hrScore);
  const techColors = scoreColor(techScore);

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "#0e0e14" }}
    >
      <div className="w-full max-w-xl flex flex-col gap-5">

        <ProgressTracker hr="done" tech={techStepState} wynik={isOffer ? "done" : "failed"} />

        {offer && <OfferCard offer={offer} />}

        <ResultHeader
          emoji={isOffer ? "🏆" : "😔"}
          title={isOffer ? "Otrzymałeś ofertę pracy!" : "Nie tym razem"}
          subtitle={isOffer ? "Gratulacje — przeszedłeś przez cały proces rekrutacyjny" : "Nie przeszedłeś etapu technicznego — spróbuj ponownie"}
        />

        <div className="flex gap-3">
          {hrScore !== null && (
            <div
              className="flex-1 flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: hrColors.bg, border: `1px solid ${hrColors.border}` }}
            >
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: hrColors.text, opacity: 0.6 }}>
                Wynik HR
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold tabular-nums" style={{ color: hrColors.text }}>{hrScore}</span>
                <span className="text-xs" style={{ color: hrColors.text, opacity: 0.5 }}>/100</span>
              </div>
            </div>
          )}
          {techScore !== null && (
            <div
              className="flex-1 flex items-center justify-between rounded-xl px-4 py-3"
              style={{ background: techColors.bg, border: `1px solid ${techColors.border}` }}
            >
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: techColors.text, opacity: 0.6 }}>
                Wynik Tech
              </span>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-bold tabular-nums" style={{ color: techColors.text }}>{techScore}</span>
                <span className="text-xs" style={{ color: techColors.text, opacity: 0.5 }}>/100</span>
              </div>
            </div>
          )}
        </div>

        {finalSummary && <FeedbackBlock label="Podsumowanie końcowe" text={finalSummary} />}

        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={
            isOffer
              ? {
                  background: "linear-gradient(135deg, #16a34a 0%, #065f46 100%)",
                  color: "rgba(255,255,255,0.95)",
                }
              : {
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }
          }
        >
          Zagraj ponownie →
        </button>

      </div>
    </div>
  );
}
