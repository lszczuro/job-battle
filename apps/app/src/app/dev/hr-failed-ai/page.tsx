"use client";

import { HRFailedScreen } from "@/components/game/hr-failed-screen";
import { MOCK_STATE_HR_FAILED_AI } from "@/mocks/game-state";

export default function HRFailedAIDevPage() {
  return (
    <div className="h-[calc(100vh-40px)]">
      <HRFailedScreen state={MOCK_STATE_HR_FAILED_AI} onRestart={() => {}} />
    </div>
  );
}
