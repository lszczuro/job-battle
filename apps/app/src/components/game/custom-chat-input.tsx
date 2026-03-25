"use client";

import { useRef, useCallback } from "react";
import { useAgent } from "@copilotkit/react-core/v2";

interface CustomChatInputProps {
  placeholder?: string;
}

export function CustomChatInput({ placeholder }: CustomChatInputProps) {
  const { agent } = useAgent();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "48px";
    el.style.height = Math.min(el.scrollHeight, 264) + "px";
  }, []);

  const submit = useCallback(() => {
    const el = textareaRef.current;
    if (!el || !el.value.trim() || agent.isRunning) return;
    const text = el.value.trim();
    el.value = "";
    el.style.height = "48px";
    agent.addMessage({ role: "user", content: text, id: crypto.randomUUID() });
    agent.runAgent();
  }, [agent]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submit();
      }
    },
    [submit],
  );

  return (
    <div style={{ background: "var(--card)" }}>
      <div
        className="h-6 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--card))" }}
      />
      <div className="px-3 pb-4 max-w-3xl mx-auto">
      <div
        className="flex items-end rounded-2xl border"
        style={{ borderColor: "color-mix(in oklab, var(--ring) 50%, transparent)", background: "var(--background)" }}
      >
        <textarea
          ref={textareaRef}
          placeholder={placeholder}
          onInput={adjustHeight}
          onKeyDown={handleKeyDown}
          disabled={agent.isRunning}
          rows={1}
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck
          className="flex-1 bg-transparent outline-none antialiased font-normal text-[16px] placeholder:text-[#00000077] dark:placeholder:text-[#fffc] w-full py-3 px-5 resize-none overflow-auto"
          style={{ maxHeight: "264px", height: "48px" }}
        />
        <button
          onClick={submit}
          disabled={agent.isRunning}
          aria-label="Wyślij"
          className="shrink-0 mr-3 mb-3 flex items-center justify-center w-7 h-7 rounded-full transition-opacity disabled:opacity-40"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 12V2M2 7L7 2L12 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      </div>
    </div>
  );
}
