"use client";

import { HRChatHeader } from "@/components/game/chat-header";
import { MOCK_OFFER_NOVATECH, MOCK_CHAT_MESSAGES } from "@/mocks/game-state";

export default function HRDevPage() {
  const offer = MOCK_OFFER_NOVATECH as unknown as Record<string, unknown>;

  return (
    <div className="h-[calc(100vh-40px)] relative">
      <div
        className="h-full flex flex-col"
        style={{ background: "var(--card)" }}
      >
        <HRChatHeader offer={offer} isRunning={false} />

        {/* Mock chat messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
          {MOCK_CHAT_MESSAGES.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "var(--muted)",
                        color: "var(--foreground)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          <div className="flex justify-start">
            <div
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl"
              style={{
                background: "var(--muted)",
                borderBottomLeftRadius: "4px",
              }}
            >
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-[var(--muted-foreground)] animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mock input */}
        <div
          className="shrink-0 px-4 pb-4 pt-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
          >
            <span className="flex-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Twoja odpowiedź...
            </span>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Wyślij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
