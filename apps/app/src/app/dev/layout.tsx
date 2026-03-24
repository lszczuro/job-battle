export default function DevLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <nav
        className="px-4 py-2 flex items-center gap-4 text-xs font-mono"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--card)",
          color: "var(--muted-foreground)",
        }}
      >
        <span className="font-semibold" style={{ color: "var(--foreground)" }}>
          🛠 DEV
        </span>
        <a href="/dev" style={{ color: "var(--muted-foreground)" }}>
          index
        </a>
        <a href="/dev/offer-selection" style={{ color: "var(--muted-foreground)" }}>
          offer-selection
        </a>
        <a href="/dev/hr" style={{ color: "var(--muted-foreground)" }}>
          hr
        </a>
        <a href="/dev/hr-failed-ai" style={{ color: "var(--muted-foreground)" }}>
          hr-failed-ai
        </a>
        <a href="/dev/offer" style={{ color: "var(--muted-foreground)" }}>
          offer
        </a>
        <a href="/dev/rejected" style={{ color: "var(--muted-foreground)" }}>
          rejected
        </a>
      </nav>
      {children}
    </div>
  );
}
