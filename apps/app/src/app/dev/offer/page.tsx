"use client";

import { GameResultScreen } from "@/components/game/game-result-screen";
import { MOCK_STATE_OFFER } from "@/mocks/game-state";

export default function OfferDevPage() {
  return (
    <div className="h-[calc(100vh-40px)]">
      <GameResultScreen state={MOCK_STATE_OFFER} type="offer" onRestart={() => {}} />
    </div>
  );
}
