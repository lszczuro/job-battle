import { ProgressTracker } from "./progress-tracker";
import { OfferCard, FeedbackBlock, ResultHeader } from "./result-ui";

function LinkedInShareButton({ state }: { state: Record<string, unknown> | null }) {
  const role = state?.target_role as string | null;
  const company = state?.company_name as string | null;
  const hrScore = state?.hr_score as number | null;

  const shareText = [
    `Właśnie przeszedłem rozmowę HR`,
    role && company ? ` na stanowisko ${role} w ${company}` : "",
    hrScore !== null ? ` z wynikiem ${hrScore}/100` : "",
    ` w grze Job Battle! 🎉`,
    `\n\nCzy Ty też dasz radę? Sprawdź swoje umiejętności rekrutacyjne.`,
  ].join("");

  const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Fjob-battle.example.com&title=Oferta%20pracy!&summary=${encodeURIComponent(shareText)}`;

  return (
    <button
      onClick={() => window.open(linkedInUrl, "_blank", "noopener,noreferrer")}
      className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
      style={{
        background: "#0A66C2",
        color: "#fff",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
      Pochwal się na LinkedIn
    </button>
  );
}

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
  const finalSummary = state?.final_summary as string | null;
  const offer = state?.selected_offer as Record<string, unknown> | null;

  const isOffer = type === "offer";

  const hrColors = (() => {
    if (hrScore === null) return { text: "var(--muted-foreground)", bg: "var(--muted)", border: "var(--border)" };
    if (hrScore >= 70) return { text: "var(--status-success)", bg: "var(--status-success-bg)", border: "var(--status-success-border)" };
    if (hrScore >= 50) return { text: "var(--status-warning)", bg: "var(--status-warning-bg)", border: "var(--status-warning-border)" };
    return { text: "var(--status-error)", bg: "var(--status-error-bg)", border: "var(--status-error-border)" };
  })();

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-xl flex flex-col gap-5">

        <ProgressTracker hr="done" wynik={isOffer ? "done" : "failed"} />

        {offer && <OfferCard offer={offer} />}

        <ResultHeader
          emoji={isOffer ? "🏆" : "😔"}
          title={isOffer ? "Otrzymałeś ofertę pracy!" : "Nie tym razem"}
          subtitle={isOffer ? "Gratulacje — wyróżniłeś się w rozmowie HR!" : "Nie przeszedłeś etapu HR — spróbuj ponownie"}
        />

        {hrScore !== null && (
          <div
            className="flex items-center justify-between rounded-xl px-5 py-4"
            style={{ background: hrColors.bg, border: `1px solid ${hrColors.border}` }}
          >
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: hrColors.text, opacity: 0.6 }}>
              Wynik HR
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums" style={{ color: hrColors.text }}>{hrScore}</span>
              <span className="text-sm" style={{ color: hrColors.text, opacity: 0.5 }}>/100</span>
            </div>
          </div>
        )}

        {finalSummary && <FeedbackBlock label={isOffer ? "Gratulacje" : "Podsumowanie"} text={finalSummary} />}

        {isOffer && <LinkedInShareButton state={state} />}

        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] bg-[var(--secondary)] text-[var(--secondary-foreground)]"
          style={{ border: "1px solid var(--border)" }}
        >
          Zagraj ponownie →
        </button>

      </div>
    </div>
  );
}
