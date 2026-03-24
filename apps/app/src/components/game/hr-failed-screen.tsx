import { ProgressTracker } from "./progress-tracker";
import { OfferCard, FeedbackBlock, ResultHeader } from "./result-ui";

export function HRFailedScreen({
  state,
  onRestart,
}: {
  state: Record<string, unknown> | null;
  onRestart: () => void;
}) {
  const hrScore = state?.hr_score as number | null;
  const hrScoreRaw = state?.hr_score_raw as number | null;
  const hrFeedback = state?.hr_feedback as string | null;
  const hrSummary = state?.hr_summary as string | null;
  const hrAiSuspicion = state?.hr_ai_suspicion as number | null;
  const hrAiRejected = state?.hr_ai_rejected as boolean | null;
  const offer = state?.selected_offer as Record<string, unknown> | null;

  const aiDetected = hrAiRejected === true;
  const aiSuspicionPct = hrAiSuspicion !== null ? Math.round(hrAiSuspicion * 100) : null;

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-xl flex flex-col gap-5">

        <ProgressTracker hr="failed" wynik="failed" />

        {offer && <OfferCard offer={offer} />}

        <ResultHeader
          emoji={aiDetected ? "🤖" : "😔"}
          title={aiDetected ? "Wykryto użycie AI" : "Nie tym razem"}
          subtitle={aiDetected ? "Kandydatura odrzucona z powodu nieuczciwości" : "Nie przeszedłeś etapu HR — spróbuj ponownie"}
        />

        {aiDetected && (
          <div
            className="rounded-xl px-5 py-4 flex flex-col gap-2"
            style={{ background: "var(--status-ai-bg)", border: "1px solid var(--status-ai-border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <p className="text-sm font-semibold" style={{ color: "var(--status-ai)" }}>
                Podejrzenie oszustwa — użycie AI
              </p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              System wykrył z {aiSuspicionPct}% pewnością, że odpowiedzi zostały wygenerowane
              przez AI. Kandydatura została odrzucona niezależnie od treści odpowiedzi.
            </p>
            {hrScoreRaw !== null && (
              <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                Wynik przed karą: {hrScoreRaw}/100 → po karze: {hrScore}/100
              </p>
            )}
          </div>
        )}

        {hrScore !== null && (
          <div
            className="flex items-center justify-between rounded-xl px-5 py-4"
            style={{ background: "var(--status-error-bg)", border: "1px solid var(--status-error-border)" }}
          >
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--status-error)", opacity: 0.6 }}>
              Wynik HR
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--status-error)" }}>
                {hrScore}
              </span>
              <span className="text-sm" style={{ color: "var(--status-error)", opacity: 0.5 }}>/ 100</span>
            </div>
          </div>
        )}

        {hrFeedback && !aiDetected && <FeedbackBlock label="Ocena rekrutera" text={hrFeedback} />}
        {hrSummary && !aiDetected && <FeedbackBlock label="Podsumowanie" text={hrSummary} />}

        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] bg-[var(--secondary)] text-[var(--secondary-foreground)]"
          style={{ border: "1px solid var(--border)" }}
        >
          Spróbuj z inną ofertą →
        </button>

      </div>
    </div>
  );
}
