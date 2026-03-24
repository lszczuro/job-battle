"use client";

import { GameResultScreen } from "@/components/game/game-result-screen";
import { MOCK_STATE_HR_FAILED_AI } from "@/mocks/game-state";

export default function HRFailedAIDevPage() {
  return (
    <div className="h-[calc(100vh-40px)]">
      <GameResultScreen state={MOCK_STATE_HR_FAILED_AI} type="rejected" onRestart={() => {}} />
    </div>
  );
}
