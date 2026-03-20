"use client";

import { CallView } from "./call-view";

interface HRScreeningProps {
  offer: Record<string, unknown> | null;
  isRunning: boolean;
}

export function HRScreening({ offer, isRunning }: HRScreeningProps) {
  return (
    <div className="h-full" style={{ background: "#0e0e14" }}>
      <CallView offer={offer} isRunning={isRunning} />
    </div>
  );
}
