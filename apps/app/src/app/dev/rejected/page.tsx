"use client";

import { GameResultScreen } from "@/components/game/game-result-screen";
import { MOCK_STATE_REJECTED } from "@/mocks/game-state";

export default function RejectedDevPage() {
  return (
    <div className="h-[calc(100vh-40px)]">
      <GameResultScreen state={MOCK_STATE_REJECTED} type="rejected" onRestart={() => {}} />
    </div>
  );
}
