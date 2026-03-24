from typing import TypedDict, Literal, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


Decision = Literal["pass", "fail", "continue"]

Stage = Literal["offer_selection", "hr", "rejected", "offer"]


class OfferCard(TypedDict):
    id: str
    company_name: str
    target_role: str
    company_vibe: str
    emoji: str
    tech_stack: list[str]


class GameState(TypedDict):
    # Required by CopilotKit — active conversation for the current stage
    messages: Annotated[list[BaseMessage], add_messages]

    # Offer selection screen
    user_preference: str | None
    selected_offer: OfferCard | None

    # Hidden scores (not visible to the player)
    hr_score_raw: int | None       # raw score (before AI penalty)
    hr_score: int | None           # effective score (after AI penalty)
    hr_ai_suspicion: float | None  # 0.0–1.0 probability of AI usage (average)
    hr_ai_rejected: bool | None    # True when AI detection was the direct cause of rejection
    hr_feedback: str | None        # feedback from HR (text)

    # Internal decision of evaluate_* nodes
    decision: Decision | None

    # Final summary
    final_summary: str | None

    # Flow control
    current_stage: Stage
    turn_count: int
    game_over: bool

