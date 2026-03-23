"use client";

import { useState } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import { GamePage } from "@/components/game/game-page";

export default function HomePage() {
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  return (
    <CopilotKit key={threadId} runtimeUrl="/api/copilotkit" threadId={threadId}>
      <GamePage onRestart={() => setThreadId(crypto.randomUUID())} />
    </CopilotKit>
  );
}
