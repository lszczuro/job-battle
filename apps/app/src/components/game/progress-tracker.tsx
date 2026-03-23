export type StepState = "done" | "next" | "pending" | "failed";

function ProgressStep({ label, state }: { label: string; state: StepState }) {
  const styles = {
    done: { bg: "rgba(74,222,128,0.15)", border: "rgba(74,222,128,0.4)", text: "#4ade80" },
    next: { bg: "rgba(59,79,216,0.2)", border: "rgba(59,79,216,0.5)", text: "#818cf8" },
    pending: { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)", text: "rgba(255,255,255,0.3)" },
    failed: { bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.35)", text: "#f87171" },
  }[state];
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
        style={{ background: styles.bg, border: `1px solid ${styles.border}`, color: styles.text }}
      >
        {state === "done" ? "✓" : state === "failed" ? "✗" : label[0]}
      </div>
      <span className="text-xs font-mono" style={{ color: styles.text }}>{label}</span>
    </div>
  );
}

export function ProgressTracker({ hr, tech, wynik }: { hr: StepState; tech: StepState; wynik: StepState }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-5 py-3"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <ProgressStep label="HR" state={hr} />
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.1)" }} />
      <ProgressStep label="Tech" state={tech} />
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
      <ProgressStep label="Wynik" state={wynik} />
    </div>
  );
}
