import type { OfferCard } from "@/components/offer-board/offer-card";

export const MOCK_OFFER_NOVATECH: OfferCard = {
  id: "mock-1",
  company_name: "NovaTech Sp. z o.o.",
  target_role: "Senior Python Developer",
  company_vibe: "scale-up, fintech, Warszawa, 200 os.",
  emoji: "🐍",
  tech_stack: ["Python", "FastAPI", "PostgreSQL", "Docker", "K8s"],
};

export const MOCK_OFFER_CLOUDBASE: OfferCard = {
  id: "mock-2",
  company_name: "CloudBase S.A.",
  target_role: "Frontend Engineer (React)",
  company_vibe: "startup, SaaS B2B, Kraków / remote, 60 os.",
  emoji: "⚛️",
  tech_stack: ["React", "TypeScript", "Next.js", "Tailwind", "GraphQL"],
};

const BASE_STATE = {
  company_name: MOCK_OFFER_NOVATECH.company_name,
  target_role: MOCK_OFFER_NOVATECH.target_role,
  company_vibe: MOCK_OFFER_NOVATECH.company_vibe,
  tech_stack: MOCK_OFFER_NOVATECH.tech_stack,
  selected_offer: MOCK_OFFER_NOVATECH,
  turn_count: 3,
  game_over: false,
  hr_ai_suspicion: 0.1,
  hr_ai_rejected: false,
};

export const MOCK_STATE_HR: Record<string, unknown> = {
  ...BASE_STATE,
  current_stage: "hr",
  hr_score: null,
  hr_feedback: null,
  final_summary: null,
};


export const MOCK_STATE_HR_FAILED_AI: Record<string, unknown> = {
  ...BASE_STATE,
  current_stage: "hr_failed",
  hr_score: 8,
  hr_ai_rejected: true,
  hr_ai_suspicion: 0.91,
  hr_feedback:
    "Odpowiedzi miały strukturę typową dla modeli językowych — nadmiernie rozbudowane, z wieloma punktami i powtarzającymi się frazami.",
  final_summary: null,
};

export const MOCK_STATE_OFFER: Record<string, unknown> = {
  ...BASE_STATE,
  current_stage: "offer",
  hr_score: 85,
  hr_ai_rejected: false,
  hr_ai_suspicion: 0.05,
  hr_feedback:
    "Wyjątkowa rozmowa. Kandydat wyróżnił się autentycznością, konkretnymi przykładami i pasją do technologii. Zdecydowanie rekomendujemy do kolejnego etapu.",
  final_summary:
    "Gratulacje! Twoja odpowiedź na pytanie o największe wyzwanie techniczne szczególnie przekonała rekruterkę. Wyróżniłeś się spośród innych kandydatów autentycznością i precyzją myślenia. Czekamy na Ciebie w NovaTech!",
};

export const MOCK_STATE_REJECTED: Record<string, unknown> = {
  ...BASE_STATE,
  current_stage: "rejected",
  hr_score: 48,
  hr_ai_rejected: false,
  hr_ai_suspicion: 0.12,
  hr_feedback:
    "Kandydat wykazał się podstawową wiedzą, jednak odpowiedzi były zbyt schematyczne. Brakowało przykładów i głębszej refleksji nad doświadczeniem.",
  final_summary:
    "Niestety tym razem nie udało się przejść etapu HR. Wynik 48/100 jest poniżej progu kwalifikacji (70). Wróć za jakiś czas i spróbuj ponownie — każda rozmowa to cenne doświadczenie!",
};

export const MOCK_CHAT_MESSAGES = [
  {
    role: "assistant" as const,
    content:
      "Dzień dobry! Jestem Anna Kowalska, HR Manager w NovaTech. Cieszę się, że możemy porozmawiać o stanowisku Senior Python Developer. Zacznijmy od czegoś nieoczekiwanego — gdybyś był przyprawą, jaką przyprawą byś był i dlaczego?",
  },
  {
    role: "user" as const,
    content:
      "Ha, ciekawe pytanie! Chyba bylbym czarnym pieprzem - wszechstronny, pasuje do wiekszosci kontekstow, a do tego potrafi 'kopnac' w odpowiednim momencie, zeby obudzic projekt z letargu.",
  },
  {
    role: "assistant" as const,
    content:
      "Świetna metafora! Wszechstronność to cecha, którą bardzo cenimy. Powiedzmy, że Twój zespół właśnie odkrył krytyczny błąd w systemie płatności — 30 minut przed wdrożeniem na produkcję. Jak reagujesz?",
  },
  {
    role: "user" as const,
    content:
      "Przede wszystkim zatrzymuję wdrożenie — nic nie jest ważniejsze niż stabilność systemu płatności. Potem szybka analiza: czy błąd jest w zakresie tej zmiany? Jeśli tak, przywracamy poprzednią wersję i debugujemy. Komunikuję status zespołowi i stakeholderom.",
  },
];
