from typing import TypedDict, Literal, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


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
    available_offers: list[OfferCard]
    user_preference: str | None
    selected_offer: OfferCard | None

    # Podsumowania przekazywane między etapami
    hr_summary: str | None

    # Wybrana oferta (kopiowane z selected_offer dla wygody)
    company_name: str | None
    target_role: str | None
    company_vibe: str | None

    # Ukryte oceny (niewidoczne dla gracza)
    hr_score: int | None
    tech_score: int | None
    hr_feedback: str | None
    tech_feedback: str | None

    # Wewnętrzna decyzja węzłów evaluate_*
    decision: str | None

    # Podsumowanie końcowe
    final_summary: str | None

    # Kontrola przepływu
    current_stage: Literal["offer_selection", "hr", "tech", "rejected", "offer"]
    turn_count: int
    game_over: bool
