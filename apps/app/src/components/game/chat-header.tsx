"use client";

import { useState, useEffect } from "react";

function ChatHeader({
  offer,
  isRunning,
  name,
  title,
  avatarContent,
  avatarGradient,
  accentColor,
  accentRgb,
}: {
  offer: Record<string, unknown> | null;
  isRunning: boolean;
  name: string;
  title: string;
  avatarContent: string | "dynamic";
  avatarGradient: string;
  accentColor: string;
  accentRgb: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const company = (offer?.company_name as string) ?? "Company";
  const role = (offer?.target_role as string) ?? "Position";
  const initials =
    avatarContent === "dynamic"
      ? company.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
      : avatarContent;

  return (
    <div
      className="px-4 py-3 flex items-center gap-3 shrink-0"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{
          background: avatarGradient,
          color: "var(--primary-foreground)",
          letterSpacing: "-0.02em",
        }}
      >
        {initials}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <div className="text-[var(--foreground)] text-sm font-semibold leading-none truncate">
          {name}
        </div>
        <div
          className="text-xs mt-0.5 truncate font-mono"
          style={{ color: "var(--muted-foreground)" }}
        >
          {title} · {company} · {role}
        </div>
      </div>

      {/* Timer + status */}
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="font-mono text-xs tabular-nums"
          style={{ color: "var(--muted-foreground)" }}
        >
          {mm}:{ss}
        </span>
        <div
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono tracking-wide transition-all duration-300"
          style={
            isRunning
              ? {
                  background: `rgba(${accentRgb},0.15)`,
                  color: accentColor,
                  border: `1px solid rgba(${accentRgb},0.3)`,
                }
              : {
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                  border: "1px solid var(--border)",
                }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
            style={{ background: isRunning ? accentColor : "var(--muted-foreground)" }}
          />
          {isRunning ? "pisze..." : "czeka"}
        </div>
      </div>
    </div>
  );
}

export function HRChatHeader({ offer, isRunning }: { offer: Record<string, unknown> | null; isRunning: boolean }) {
  return (
    <ChatHeader
      offer={offer}
      isRunning={isRunning}
      name="Anna Kowalska"
      title="HR Manager"
      avatarContent="AK"
      avatarGradient="linear-gradient(135deg, #3b4fd8 0%, #6d28d9 100%)"
      accentColor="#60a5fa"
      accentRgb="59,130,246"
    />
  );
}

export function TechChatHeader({ offer, isRunning }: { offer: Record<string, unknown> | null; isRunning: boolean }) {
  return (
    <ChatHeader
      offer={offer}
      isRunning={isRunning}
      name="Marek Wiśniewski"
      title="Technical Interviewer"
      avatarContent="MW"
      avatarGradient="linear-gradient(135deg, #7c3aed 0%, #065f46 100%)"
      accentColor="#a78bfa"
      accentRgb="124,58,237"
    />
  );
}
