"use client";

import { useEffect, useState } from "react";

interface CallViewProps {
  offer: Record<string, unknown> | null;
  isRunning: boolean;
}

export function CallView({ offer, isRunning }: CallViewProps) {
  const [elapsed, setElapsed] = useState(0);
  const [speakingDots, setSpeakingDots] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setSpeakingDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, [isRunning]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const company = (offer?.company_name as string) ?? "Company";
  const role = (offer?.target_role as string) ?? "Position";
  const initials = company
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative h-full flex flex-col select-none overflow-hidden" style={{ background: "#0e0e14" }}>

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #3b4fd8 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-48 right-0 w-[30rem] h-[30rem] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6d28d9 0%, transparent 70%)" }}
        />
      </div>

      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-3">
        {/* Left: live badge + timer */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold tracking-widest uppercase"
            style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
          <span className="font-mono text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.5)" }}>
            {mm}:{ss}
          </span>
        </div>

        {/* Center: call info */}
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <div className="text-white font-semibold text-sm leading-none">{company}</div>
          <div className="text-xs mt-0.5 truncate max-w-[16rem]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Rozmowa HR · {role}
          </div>
        </div>

        {/* Right: speaking state */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wide transition-all duration-300"
          style={
            isRunning
              ? { background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }
              : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.07)" }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
            style={{ background: isRunning ? "#60a5fa" : "rgba(255,255,255,0.2)" }}
          />
          {isRunning ? "MÓWI" : "CZEKA"}
        </div>
      </div>

      {/* ── Main video tile ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-4 relative">
        <div
          className="relative w-full h-full max-w-2xl rounded-2xl overflow-hidden flex flex-col items-center justify-center transition-all duration-500"
          style={{
            background: "linear-gradient(145deg, #161622 0%, #0f0f1a 100%)",
            border: isRunning
              ? "1px solid rgba(96,165,250,0.4)"
              : "1px solid rgba(255,255,255,0.06)",
            boxShadow: isRunning
              ? "0 0 0 1px rgba(96,165,250,0.2), 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          {/* Inner grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          {/* Pulse rings when speaking */}
          {isRunning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="absolute rounded-full border border-blue-400/20 animate-ping"
                style={{ width: 220, height: 220, animationDuration: "1.8s" }}
              />
              <div
                className="absolute rounded-full border border-blue-400/15 animate-ping"
                style={{ width: 280, height: 280, animationDuration: "1.8s", animationDelay: "0.4s" }}
              />
              <div
                className="absolute rounded-full border border-blue-400/08 animate-ping"
                style={{ width: 340, height: 340, animationDuration: "1.8s", animationDelay: "0.8s" }}
              />
            </div>
          )}

          {/* Avatar */}
          <div className="relative flex flex-col items-center gap-5">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #2d2f52 0%, #1e1f3a 100%)",
                border: isRunning ? "2px solid rgba(96,165,250,0.5)" : "2px solid rgba(255,255,255,0.08)",
                boxShadow: isRunning ? "0 0 24px rgba(96,165,250,0.25)" : "0 8px 32px rgba(0,0,0,0.4)",
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "-0.02em",
              }}
            >
              {initials}
            </div>

            <div className="text-center">
              <div className="text-white font-semibold text-xl tracking-tight">Anna Kowalska</div>
              <div className="text-sm mt-1 font-mono" style={{ color: "rgba(255,255,255,0.4)" }}>
                HR Manager · {company}
              </div>

              {/* Speaking indicator dots */}
              <div className="flex items-center justify-center gap-1.5 mt-3 h-4">
                {isRunning ? (
                  [0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-blue-400 transition-all duration-200"
                      style={{ opacity: speakingDots > i ? 1 : 0.2, transform: speakingDots === i ? "scale(1.4)" : "scale(1)" }}
                    />
                  ))
                ) : (
                  <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                    czeka na odpowiedź
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)" }} />

          {/* Network quality indicator */}
          <div className="absolute top-3 right-3 flex items-end gap-px">
            {[3, 5, 7, 9].map((h, i) => (
              <div
                key={i}
                className="w-1 rounded-sm transition-colors"
                style={{ height: h, background: i < 3 ? "rgba(74,222,128,0.8)" : "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>
        </div>

        {/* ── Self-view PiP ── */}
        <div
          className="absolute bottom-8 right-12 w-32 h-[4.5rem] rounded-xl overflow-hidden flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, #1a1a26 0%, #141420 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div className="text-2xl opacity-50">🧑‍💻</div>
          <div
            className="absolute bottom-1.5 left-2 text-[9px] font-mono"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Ty
          </div>
          {/* Muted icon */}
          <div
            className="absolute top-1.5 right-2 text-[10px]"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            🔇
          </div>
        </div>
      </div>

      {/* ── Control bar ── */}
      <div className="relative z-10 flex items-end justify-center gap-3 pb-6 pt-2">
        <CallControl icon="🎤" label="Wycisz" />
        <CallControl icon="📷" label="Kamera" />
        <CallControl icon="🖥" label="Udostępnij" />
        <div className="w-px h-8 self-center mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
        <EndCallControl />
      </div>
    </div>
  );
}

function CallControl({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      className="group flex flex-col items-center gap-1.5 focus:outline-none"
      title={label}
    >
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-base transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        {icon}
      </div>
      <span className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.25)" }}>
        {label}
      </span>
    </button>
  );
}

function EndCallControl() {
  return (
    <button className="group flex flex-col items-center gap-1.5 focus:outline-none" title="Zakończ">
      <div
        className="w-12 h-11 rounded-full flex items-center justify-center text-base transition-all duration-200"
        style={{
          background: "rgba(239,68,68,0.18)",
          border: "1px solid rgba(239,68,68,0.3)",
        }}
      >
        📵
      </div>
      <span className="text-[10px] font-mono" style={{ color: "rgba(239,68,68,0.45)" }}>
        Zakończ
      </span>
    </button>
  );
}
