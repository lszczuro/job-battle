"use client";

import { useState } from "react";
import { ExampleLayout } from "@/components/example-layout";
import { ExampleCanvas } from "@/components/example-canvas";
import { OfferBoard } from "@/components/offer-board";
import type { OfferCard } from "@/components/offer-board/offer-card";
import { useExampleSuggestions } from "@/hooks";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useAgent } from "@copilotkit/react-core/v2";

function GamePage() {
  useExampleSuggestions();
  const { agent } = useAgent();
  const [gameStarted, setGameStarted] = useState(false);

  const handleSelectOffer = async (offer: OfferCard) => {
    await agent.setState({
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

  if (!gameStarted) {
    return <OfferBoard onSelectOffer={handleSelectOffer} />;
  }

  return (
    <ExampleLayout
      chatContent={
        <CopilotChat input={{ disclaimer: () => null, className: "pb-6" }} />
      }
      appContent={<ExampleCanvas />}
    />
  );
}

export default function HomePage() {
  return <GamePage />;
}
