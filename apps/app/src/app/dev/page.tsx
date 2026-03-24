const SCREENS = [
  {
    slug: "offer-selection",
    label: "Wybór oferty",
    description: "Ekran startowy — preset cards + input do AI",
    stage: "offer_selection",
  },
  {
    slug: "hr",
    label: "Rozmowa HR",
    description: "Czat z rekruterem — mock wiadomości",
    stage: "hr",
  },
  {
    slug: "hr-failed-ai",
    label: "HR oblane (AI)",
    description: "Overlay — wykryto użycie AI",
    stage: "hr_failed + hr_ai_rejected",
  },
  {
    slug: "offer",
    label: "Oferta pracy",
    description: "Ekran końcowy — kandydat dostał ofertę",
    stage: "offer",
  },
  {
    slug: "rejected",
    label: "Odrzucony",
    description: "Ekran końcowy — kandydat odrzucony",
    stage: "rejected",
  },
];

export default function DevIndexPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1
        className="text-2xl font-bold mb-1"
        style={{ color: "var(--foreground)" }}
      >
        Dev Screens
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted-foreground)" }}>
        Dostępne tylko w trybie development. Na produkcji zwraca 404.
      </p>

      <div className="flex flex-col gap-3">
        {SCREENS.map((screen) => (
          <a
            key={screen.slug}
            href={`/dev/${screen.slug}`}
            className="flex items-center justify-between rounded-xl px-5 py-4 transition-opacity hover:opacity-80"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {screen.label}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                {screen.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <code
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                {screen.stage}
              </code>
              <span style={{ color: "var(--muted-foreground)" }}>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
