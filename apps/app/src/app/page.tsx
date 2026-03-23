"use client";

import { useState, useEffect } from "react";
import { ExampleCanvas } from "@/components/example-canvas";
import { OfferBoard } from "@/components/offer-board";
import type { OfferCard } from "@/components/offer-board/offer-card";
import { useExampleSuggestions } from "@/hooks";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { useAgent } from "@copilotkit/react-core/v2";

function HRChatHeader({
  offer,
  isRunning,
}: {
  offer: Record<string, unknown> | null;
  isRunning: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const company = (offer?.company_name as string) ?? "Company";
  const role = (offer?.target_role as string) ?? "Position";
  const initials = company
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="px-4 py-3 flex items-center gap-3 shrink-0"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{
          background: "linear-gradient(135deg, #3b4fd8 0%, #6d28d9 100%)",
          color: "rgba(255,255,255,0.9)",
          letterSpacing: "-0.02em",
        }}
      >
        {initials}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-semibold leading-none truncate">
          Anna Kowalska
        </div>
        <div
          className="text-xs mt-0.5 truncate font-mono"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          HR Manager · {company} · {role}
        </div>
      </div>

      {/* Timer + status */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {mm}:{ss}
        </span>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono tracking-wide transition-all duration-300"
          style={
            isRunning
              ? {
                  background: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                  border: "1px solid rgba(59,130,246,0.3)",
                }
              : {
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
            style={{ background: isRunning ? "#60a5fa" : "rgba(255,255,255,0.2)" }}
          />
          {isRunning ? "pisze..." : "czeka"}
        </div>
      </div>
    </div>
  );
}

function ProgressStep({ label, state }: { label: string; state: "done" | "next" | "pending" | "failed" }) {
  const styles = {
    done: { bg: "rgba(74,222,128,0.15)", border: "rgba(74,222,128,0.4)", text: "#4ade80" },
    next: { bg: "rgba(59,79,216,0.2)", border: "rgba(59,79,216,0.5)", text: "#818cf8" },
    pending: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.3)" },
    failed: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)", text: "#f87171" },
  }[state];
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.text }}
      >
        {state === "done" ? "✓" : state === "failed" ? "✗" : label[0]}
      </div>
      <span className="text-xs font-mono" style={{ color: styles.text }}>{label}</span>
    </div>
  );
}

function HRPassedScreen({
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

        {/* Progress tracker */}
        <div
          className="flex items-center gap-2 rounded-xl px-5 py-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <ProgressStep label="HR" state="done" />
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <ProgressStep label="Tech" state="next" />
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <ProgressStep label="Wynik" state="pending" />
        </div>

        {/* Offer card */}
        {offer && (
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
        )}

        {/* Result header */}
        <div className="flex flex-col items-center gap-2 text-center pt-2">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.92)" }}>
            Rozmowa HR zaliczona!
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Przeszedłeś do etapu rozmowy technicznej
          </p>
        </div>

        {/* Score */}
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

        {/* Feedback */}
        {hrFeedback && (
          <div
            className="rounded-xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
              Ocena rekrutera
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {hrFeedback}
            </p>
          </div>
        )}

        {/* Next step callout */}
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

        {/* CTA Button */}
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

function HRFailedScreen({
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
      style={{ background: "#0e0e14" }}
    >
      <div className="w-full max-w-xl flex flex-col gap-5">

        {/* Progress tracker */}
        <div
          className="flex items-center gap-2 rounded-xl px-5 py-3"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <ProgressStep label="HR" state="failed" />
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <ProgressStep label="Tech" state="pending" />
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <ProgressStep label="Wynik" state="pending" />
        </div>

        {/* Offer card */}
        {offer && (
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
        )}

        {/* Result header */}
        <div className="flex flex-col items-center gap-2 text-center pt-2">
          <div className="text-5xl">{aiDetected ? "🤖" : "😔"}</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "rgba(255,255,255,0.92)" }}>
            {aiDetected ? "Wykryto użycie AI" : "Nie tym razem"}
          </h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            {aiDetected ? "Kandydatura odrzucona z powodu nieuczciwości" : "Nie przeszedłeś etapu HR — spróbuj ponownie"}
          </p>
        </div>

        {/* AI detection banner */}
        {aiDetected && (
          <div
            className="rounded-xl px-5 py-4 flex flex-col gap-2"
            style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>
                Podejrzenie oszustwa — użycie AI
              </p>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(251,191,36,0.7)" }}>
              System wykrył z {aiSuspicionPct}% pewnością, że odpowiedzi zostały wygenerowane
              przez AI. Kandydatura została odrzucona niezależnie od treści odpowiedzi.
            </p>
            {hrScoreRaw !== null && (
              <p className="text-xs font-mono" style={{ color: "rgba(251,191,36,0.45)" }}>
                Wynik przed karą: {hrScoreRaw}/100 → po karze: {hrScore}/100
              </p>
            )}
          </div>
        )}

        {/* Score */}
        {hrScore !== null && (
          <div
            className="flex items-center justify-between rounded-xl px-5 py-4"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}
          >
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "#f87171", opacity: 0.6 }}>
              Wynik HR
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tabular-nums" style={{ color: "#f87171" }}>
                {hrScore}
              </span>
              <span className="text-sm" style={{ color: "#f87171", opacity: 0.5 }}>/ 100</span>
            </div>
          </div>
        )}

        {/* Feedback */}
        {hrFeedback && !aiDetected && (
          <div
            className="rounded-xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
              Ocena rekrutera
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {hrFeedback}
            </p>
          </div>
        )}

        {/* Summary */}
        {hrSummary && !aiDetected && (
          <div
            className="rounded-xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
              Podsumowanie
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              {hrSummary}
            </p>
          </div>
        )}

        {/* Restart */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          Spróbuj z inną ofertą →
        </button>

      </div>
    </div>
  );
}

function GamePage({ onRestart }: { onRestart: () => void }) {
  useExampleSuggestions();
  const { agent } = useAgent();
  const [gameStarted, setGameStarted] = useState(false);
  const [techPending, setTechPending] = useState(false);

  const state = agent.state as Record<string, unknown> | null;
  const stage = (state?.current_stage as string) ?? "hr";
  const offer = (state?.selected_offer as Record<string, unknown>) ?? null;

  const handleSelectOffer = async (offer: OfferCard) => {
    agent.setState({
      selected_offer: offer,
      company_name: offer.company_name,
      target_role: offer.target_role,
      company_vibe: offer.company_vibe,
      tech_stack: offer.tech_stack,
      current_stage: "hr",
      turn_count: 0,
      game_over: false,
    });
    setGameStarted(true);
  };

  const handleStartTech = () => {
    agent.setState({ current_stage: "tech", turn_count: 0 });
    setTechPending(true);
  };

  const handleRestart = () => {
    onRestart();
  };

  useEffect(() => {
    if (gameStarted && agent.messages.length === 0 && !agent.isRunning) {
      agent.runAgent();
    }
  }, [gameStarted]);

  useEffect(() => {
    if (techPending && !agent.isRunning) {
      setTechPending(false);
      agent.runAgent();
    }
  }, [techPending, agent.isRunning]);

  if (!gameStarted) {
    return <OfferBoard onSelectOffer={handleSelectOffer} />;
  }

  const isHr = stage === "hr";
  const isHrPassed = stage === "hr_passed";
  const isHrFailed = stage === "hr_failed";

  if (isHrPassed) {
    return <HRPassedScreen state={state} onStartTech={handleStartTech} />;
  }

  if (isHrFailed) {
    return <HRFailedScreen state={state} onRestart={handleRestart} />;
  }

  // CopilotChat stays at the same position in the tree for all stages —
  // only the left panel changes. This prevents CopilotChat from
  // unmounting/remounting and aborting in-flight requests.
  return (
    <div
      className="h-full flex flex-row overflow-hidden"
      style={{ background: isHr ? "#0e0e14" : undefined }}
    >
      {/* Left panel — only shown outside HR stage */}
      {!isHr && (
        <div className="flex-1 h-full min-w-0 border-r">
          <ExampleCanvas />
        </div>
      )}

      {/* Right panel — CopilotChat always mounted here, never moves */}
      <div
        className={`${isHr ? "flex-1 min-w-0" : "w-[380px] shrink-0"} flex flex-col h-full`}
        style={{ background: isHr ? "#111118" : undefined }}
      >
        {isHr && (
          <HRChatHeader offer={offer} isRunning={agent.isRunning} />
        )}

        <div className="flex-1 min-h-0 overflow-hidden relative">
          <CopilotChat input={{ disclaimer: () => null, className: "pb-4" }} />
          {agent.messages.length === 0 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
              style={{ background: isHr ? "#111118" : "var(--background, #fff)" }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <p
                className="text-sm font-mono"
                style={{ color: isHr ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
              >
                Nawiązywanie połączenia z rekruterem...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  return (
    <CopilotKit key={threadId} runtimeUrl="/api/copilotkit" threadId={threadId}>
      <GamePage onRestart={() => setThreadId(crypto.randomUUID())} />
    </CopilotKit>
  );
}
