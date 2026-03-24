from typing import TypedDict, Literal, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


Decision = Literal["pass", "fail", "continue"]

Stage = Literal["offer_selection", "hr", "hr_failed", "offer"]


class OfferCard(TypedDict):
    id: str
    company_name: str
    target_role: str
    company_vibe: str
    emoji: str
    tech_stack: list[str]


class GameState(TypedDict):
    # Wymagane przez CopilotKit — aktywna rozmowa bieżącego etapu
    messages: Annotated[list[BaseMessage], add_messages]

    # Ekran wyboru oferty
    user_preference: str | None
    selected_offer: OfferCard | None

    # Ukryte oceny (niewidoczne dla gracza)
    hr_score_raw: int | None       # raw score (przed AI penalty)
    hr_score: int | None           # effective score (po AI penalty)
    hr_ai_suspicion: float | None  # 0.0–1.0 prawdopodobieństwo użycia AI (średnia)
    hr_ai_rejected: bool | None    # True gdy AI detection był bezpośrednią przyczyną odrzucenia
    hr_feedback: str | None        # feedback od HR (tekstowy)

    # Wewnętrzna decyzja węzłów evaluate_*
    decision: Decision | None

    # Podsumowanie końcowe
    final_summary: str | None

    # Kontrola przepływu
    current_stage: Stage
    turn_count: int
    game_over: bool

