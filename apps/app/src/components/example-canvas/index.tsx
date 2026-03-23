"use client";

import { useAgent } from "@copilotkit/react-core/v2";

const STAGE_LABELS: Record<string, string> = {
  offer_selection: "Wybór oferty",
  hr: "Rozmowa HR",
  hr_passed: "HR zaliczony ✓",
  hr_failed: "Odrzucony na etapie HR",
  tech: "Rozmowa techniczna",
  offer: "Oferta złożona! 🎉",
  rejected: "Odrzucony",
};

const STAGE_COLORS: Record<string, string> = {
  hr: "bg-blue-100 text-blue-700",
  hr_passed: "bg-green-100 text-green-700",
  hr_failed: "bg-red-100 text-red-700",
  tech: "bg-purple-100 text-purple-700",
  offer: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function ExampleCanvas() {
  const { agent } = useAgent();
  const state = agent.state as Record<string, unknown> | null;

  const stage = (state?.current_stage as string) || "hr";
  const offer = state?.selected_offer as Record<string, unknown> | null;
  const score_hr = state?.hr_score as number | null;
  const score_tech = state?.tech_score as number | null;

  return (
    <div className="h-full overflow-y-auto bg-[--background]">
      <div className="max-w-lg mx-auto px-8 py-10 flex flex-col gap-6">

        {/* Stage badge */}
        <div>
          <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${STAGE_COLORS[stage] || "bg-gray-100 text-gray-600"}`}
          >
            <span className="w-2 h-2 rounded-full bg-current opacity-60" />
            {STAGE_LABELS[stage] || stage}
          </span>
        </div>

        {/* Selected offer card */}
        {offer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{offer.emoji as string}</span>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-gray-800 text-base leading-tight">
                  {offer.target_role as string}
                </h2>
                <p className="text-gray-600 text-sm mt-0.5">{offer.company_name as string}</p>
                <p className="text-gray-400 text-xs mt-1">{offer.company_vibe as string}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(offer.tech_stack as string[]).map((tech) => (
                    <span
                      key={tech}
                      className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scores */}
        {(score_hr !== null || score_tech !== null) && (
          <div className="flex gap-4">
            {score_hr !== null && (
              <ScoreCard label="HR" score={score_hr} />
            )}
            {score_tech !== null && (
              <ScoreCard label="Tech" score={score_tech} />
            )}
          </div>
        )}

        {/* Progress stages */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <StageStep label="HR" active={stage === "hr"} done={["hr_passed", "tech", "offer", "rejected"].includes(stage)} />
          <div className="flex-1 h-px bg-gray-200" />
          <StageStep label="Tech" active={stage === "tech"} done={["offer", "rejected"].includes(stage)} />
          <div className="flex-1 h-px bg-gray-200" />
          <StageStep label="Wynik" active={stage === "offer" || stage === "rejected"} done={false} />
        </div>

      </div>
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const color =
    score >= 7 ? "text-green-600 bg-green-50 border-green-200" :
      score >= 5 ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
        "text-red-600 bg-red-50 border-red-200";
  return (
    <div className={`flex-1 rounded-xl border px-4 py-3 text-center ${color}`}>
      <div className="text-2xl font-bold">{score}<span className="text-sm font-normal">/10</span></div>
      <div className="text-xs mt-0.5 opacity-70">{label} Score</div>
    </div>
  );
}

function StageStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-bold border-2 transition-colors ${done
        ? "bg-gray-700 text-white border-gray-700"
        : active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-400 border-gray-200"
        }`}
    >
      {done ? "✓" : label[0]}
    </div>
  );
}
