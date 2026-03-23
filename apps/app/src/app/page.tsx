"use client";

import { useState, useEffect } from "react";
import { ExampleCanvas } from "@/components/example-canvas";
import { OfferBoard } from "@/components/offer-board";
import type { OfferCard } from "@/components/offer-board/offer-card";
import { useExampleSuggestions } from "@/hooks";

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

function GamePage() {
  useExampleSuggestions();
  const { agent } = useAgent();
  const [gameStarted, setGameStarted] = useState(false);

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

  useEffect(() => {
    if (gameStarted && agent.messages.length === 0 && !agent.isRunning) {
      agent.runAgent();
    }
  }, [gameStarted]);

  if (!gameStarted) {
    return <OfferBoard onSelectOffer={handleSelectOffer} />;
  }

  const isHr = stage === "hr";

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
  return <GamePage />;
}
