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

  const MOCK_STATE = {
    hr_score: 85,
    final_summary: "Świetna rozmowa! Wykazałeś się doskonałymi umiejętnościami komunikacyjnymi.",
    selected_offer: {
      company_name: "Acme Corp",
      target_role: "Senior Frontend Developer",
      company_vibe: "startup",
      tech_stack: ["React", "TypeScript"],
    },
    target_role: "Senior Frontend Developer",
    company_name: "Acme Corp",
  };

  state = MOCK_STATE;

  const hrScore = state?.hr_score as number | null;
  const finalSummary = state?.final_summary as string | null;
  const offer = state?.selected_offer as Record<string, unknown> | null;

  const isOffer = type === "offer";

  const hrColors = (() => {
    if (hrScore === null) return { text: "rgba(255,255,255,0.4)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.1)" };
    if (hrScore >= 70) return { text: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" };
    if (hrScore >= 50) return { text: "#facc15", bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)" };
    return { text: "#f87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" };
  })();

  return (
    <div
      className="h-full overflow-y-auto flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "#0e0e14" }}
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
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={
            isOffer
              ? {
                  background: "rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.65)",
                  border: "1px solid rgba(255,255,255,0.1)",
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
