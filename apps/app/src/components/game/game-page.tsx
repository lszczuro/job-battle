"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAgent, useRenderTool } from "@copilotkit/react-core/v2";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { WelcomeScreen, offerSchema } from "@/components/offer-board";
import { z } from "zod";

const showJobOffersSchema = z.object({ offers: z.array(offerSchema) });
import type { OfferCard } from "@/components/offer-board/offer-card";
import { OfferCardItem } from "@/components/offer-board/offer-card";
import { HRChatHeader } from "./chat-header";
import { HRFailedScreen } from "./hr-failed-screen";
import { GameResultScreen } from "./game-result-screen";

export function GamePage({ onRestart }: { onRestart: () => void }) {
  const { agent } = useAgent();
  const [gameStarted, setGameStarted] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const hrStartedRef = useRef(false);

  const state = agent.state as Record<string, unknown> | null;
  const stage = (state?.current_stage as string) ?? "hr";
  const offer = (state?.selected_offer as Record<string, unknown>) ?? null;

  const handleSelectOffer = useCallback(async (offer: OfferCard) => {
    setIsSelecting(true);
    agent.setState({
      selected_offer: offer,
      tech_stack: offer.tech_stack,
      current_stage: "hr",
      turn_count: 0,
      game_over: false,
    });
    setGameStarted(true);
  }, [agent]);

  useRenderTool(
    {
      name: "show_job_offers",
      parameters: showJobOffersSchema,
      render: ({ parameters }) => {
        const offers = (parameters as { offers?: OfferCard[] }).offers ?? [];
        if (offers.length === 0) {
          return (
            <div className="flex items-center gap-2 py-4 px-2">
              <span className="text-2xl animate-bounce">🔍</span>
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Szukam ofert...
              </span>
            </div>
          );
        }
        return (
          <div className="flex flex-col gap-2 py-4 px-2 w-full">
            {offers.map((o) => (
              <OfferCardItem
                key={o.id}
                card={o}
                onSelect={handleSelectOffer}
                isLoading={isSelecting}
              />
            ))}
          </div>
        );
      },
    },
    [isSelecting, handleSelectOffer],
  );

  useEffect(() => {
    if (gameStarted && !hrStartedRef.current && !agent.isRunning) {
      hrStartedRef.current = true;
      agent.runAgent();
    }
  }, [gameStarted, agent]);

  const isHr = stage === "hr";
  const isHrFailed = stage === "hr_failed";
  const isOffer = stage === "offer";
  const isRejected = stage === "rejected";

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
          {gameStarted && isHr && (
            <HRChatHeader offer={offer} isRunning={agent.isRunning} />
          )}

          <div className="flex-1 min-h-0 overflow-hidden relative">
            <CopilotChat
              welcomeScreen={!gameStarted
                ? ({ input }: { input: React.ReactNode }) => (
                    <WelcomeScreen
                      input={input}
                      onSelectOffer={handleSelectOffer}
                      isSelecting={isSelecting}
                    />
                  )
                : undefined}
              input={{ disclaimer: () => null, className: "pb-4", textArea: { rows: 1, placeholder: "Opisz stanowisko, o którym marzysz..." } }}
            />
            {gameStarted && agent.messages.length === 0 && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
                style={{ background: "var(--background)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-sm font-mono" style={{ color: "var(--muted-foreground)" }}>
                  Nawiązywanie połączenia z rekruterem...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isHrFailed && (
        <div className="absolute inset-0 z-20">
          <HRFailedScreen state={state} onRestart={onRestart} />
        </div>
      )}
      {isOffer && (
        <div className="absolute inset-0 z-20">
          <GameResultScreen state={state} type="offer" onRestart={onRestart} />
        </div>
      )}
      {isRejected && (
        <div className="absolute inset-0 z-20">
          <GameResultScreen state={state} type="rejected" onRestart={onRestart} />
        </div>
      )}
    </div>
  );
}
