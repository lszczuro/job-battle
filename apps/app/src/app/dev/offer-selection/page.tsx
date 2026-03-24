"use client";

import { WelcomeScreen } from "@/components/offer-board";

export default function OfferSelectionDevPage() {
  return (
    <div className="h-[calc(100vh-40px)]">
      <WelcomeScreen
        input={
          <div
            className="shrink-0 px-4 pb-4 pt-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-4 py-3"
              style={{ background: "var(--muted)", border: "1px solid var(--border)" }}
            >
              <span className="flex-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Opisz stanowisko, o którym marzysz...
              </span>
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                Wyślij
              </button>
            </div>
          </div>
        }
        onSelectOffer={() => {}}
        isSelecting={false}
      />
    </div>
  );
}
