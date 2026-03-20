from typing import TypedDict, Literal, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class GameState(TypedDict):
    # Wymagane przez CopilotKit — aktywna rozmowa bieżącego etapu
    messages: Annotated[list[BaseMessage], add_messages]

    # Podsumowania przekazywane między etapami
    headhunter_summary: str | None
    hr_summary: str | None

    # Profil gracza (budowany przez headhuntera)
    player_name: str | None
    player_current_role: str | None
    player_years_exp: int | None
    player_skills: list[str]
    player_salary_expectation: str | None

    # Oferta (generowana przez generate_offer)
    company_name: str | None
    target_role: str | None
    company_vibe: str | None
    offered_salary: str | None

    # Ukryte oceny (niewidoczne dla gracza)
    headhunter_score: int | None
    hr_score: int | None
    tech_score: int | None
    headhunter_feedback: str | None
    hr_feedback: str | None
    tech_feedback: str | None

    # Wewnętrzna decyzja węzłów evaluate_*
    decision: str | None

    # Podsumowanie końcowe
    final_summary: str | None

    # Kontrola przepływu
    current_stage: Literal["headhunter", "hr", "tech", "rejected", "offer"]
    turn_count: int
    game_over: bool
