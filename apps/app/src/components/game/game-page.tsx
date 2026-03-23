"use client";

import { useState, useEffect } from "react";
import { useAgent } from "@copilotkit/react-core/v2";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { OfferBoard } from "@/components/offer-board";
import type { OfferCard } from "@/components/offer-board/offer-card";
import { HRChatHeader, TechChatHeader } from "./chat-header";
import { HRPassedScreen } from "./hr-passed-screen";
import { HRFailedScreen } from "./hr-failed-screen";
import { GameResultScreen } from "./game-result-screen";

export function GamePage({ onRestart }: { onRestart: () => void }) {
  const { agent } = useAgent();
  const [gameStarted, setGameStarted] = useState(false);
  const [waitingForTech, setWaitingForTech] = useState(false);

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
    setWaitingForTech(true);
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
    if (waitingForTech && stage === "tech" && !agent.isRunning) {
      setWaitingForTech(false);
      agent.runAgent();
    }
  }, [waitingForTech, stage, agent.isRunning]);

  if (!gameStarted) {
    return <OfferBoard onSelectOffer={handleSelectOffer} />;
  }

  const isHr = stage === "hr";
  const isTech = stage === "tech";
  const isHrPassed = stage === "hr_passed";
  const isHrFailed = stage === "hr_failed";
  const isOffer = stage === "offer";
  const isRejected = stage === "rejected";

  // CopilotChat stays mounted for ALL game stages (hr, hr_passed, hr_failed, tech, ...).
  // hr_passed / hr_failed screens are rendered as absolute overlays so CopilotChat
  // never unmounts — unmounting it while agent.setState is in-flight aborts the stream.
  return (
    <div className="h-full relative">
      {/* Base layout with CopilotChat — always mounted once gameStarted */}
      <div
        className="h-full flex flex-row overflow-hidden"
        style={{ background: (isHr || isTech) ? "#0e0e14" : undefined }}
      >
        {/* Right panel — CopilotChat always mounted here, never moves */}
        <div
          className="flex-1 min-w-0 flex flex-col h-full"
          style={{ background: (isHr || isTech) ? "#111118" : undefined }}
        >
          {isHr && (
            <HRChatHeader offer={offer} isRunning={agent.isRunning} />
          )}
          {isTech && (
            <TechChatHeader offer={offer} isRunning={agent.isRunning} />
          )}

          <div className="flex-1 min-h-0 overflow-hidden relative">
            <CopilotChat input={{ disclaimer: () => null, className: "pb-4" }} />
            {agent.messages.length === 0 && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
                style={{ background: (isHr || isTech) ? "#111118" : "var(--background, #fff)" }}
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
                  style={{ color: (isHr || isTech) ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}
                >
                  Nawiązywanie połączenia z rekruterem...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay screens — rendered on top without unmounting CopilotChat */}
      {isHrPassed && (
        <div className="absolute inset-0 z-20">
          <HRPassedScreen state={state} onStartTech={handleStartTech} />
        </div>
      )}
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
