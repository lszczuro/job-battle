from src.graph.state import GameState


def route_headhunter(state: GameState) -> str:
    if state.get("company_name") is not None:
        return "evaluate_headhunter"

    if (
        state.get("player_skills")
        and state.get("player_years_exp") is not None
        and state.get("player_current_role") is not None
    ):
        return "generate_offer"

    if state.get("turn_count", 0) >= 8:
        return "generate_offer"

    return "headhunter_agent"
