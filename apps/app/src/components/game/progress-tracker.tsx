export type StepState = "done" | "next" | "pending" | "failed";

function ProgressStep({ label, state }: { label: string; state: StepState }) {
  const styles = {
    done: { bg: "var(--status-success-bg)", border: "var(--status-success-border)", text: "var(--status-success)" },
    next: { bg: "var(--status-info-bg)", border: "var(--status-info-border)", text: "var(--status-info)" },
    pending: { bg: "var(--muted)", border: "var(--border)", text: "var(--muted-foreground)" },
    failed: { bg: "var(--status-error-bg)", border: "var(--status-error-border)", text: "var(--status-error)" },
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

export function ProgressTracker({ hr, wynik }: { hr: StepState; wynik: StepState }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-5 py-3"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <ProgressStep label="HR" state={hr} />
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <ProgressStep label="Wynik" state={wynik} />
    </div>
  );
}
