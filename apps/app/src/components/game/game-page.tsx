"use client";

import { useState, useEffect } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { OfferBoard } from "@/components/offer-board";
import type { OfferCard } from "@/components/offer-board/offer-card";
import { HRChatHeader } from "./chat-header";
import { HRFailedScreen } from "./hr-failed-screen";
import { GameResultScreen } from "./game-result-screen";

export function GamePage({ onRestart }: { onRestart: () => void }) {
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

  const handleRestart = () => {
    onRestart();
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
  const isHrFailed = stage === "hr_failed";
  const isOffer = stage === "offer";
  const isRejected = stage === "rejected";

  // CopilotChat stays mounted for ALL game stages.
  // Result screens are rendered as absolute overlays so CopilotChat never unmounts.
  return (
    <div className="h-full relative">
      <div
        className="h-full flex flex-row overflow-hidden"
        style={{ background: "var(--background)" }}
      >
        <div
          className="flex-1 min-w-0 flex flex-col h-full"
          style={{ background: "var(--card)" }}
        >
          {isHr && (
            <HRChatHeader offer={offer} isRunning={agent.isRunning} />
          )}

          <div className="flex-1 min-h-0 overflow-hidden relative">
            <CopilotChat input={{ disclaimer: () => null, className: "pb-4" }} />
            {agent.messages.length === 0 && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
                style={{ background: "var(--background)" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <p
                  className="text-sm font-mono"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Nawiązywanie połączenia z rekruterem...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isHrFailed && (
        <div className="absolute inset-0 z-20">
          <HRFailedScreen state={state} onRestart={handleRestart} />
        </div>
      )}
      {isOffer && (
        <div className="absolute inset-0 z-20">
          <GameResultScreen state={state} type="offer" onRestart={handleRestart} />
        </div>
      )}
      {isRejected && (
        <div className="absolute inset-0 z-20">
          <GameResultScreen state={state} type="rejected" onRestart={handleRestart} />
        </div>
      )}
    </div>
  );
}
