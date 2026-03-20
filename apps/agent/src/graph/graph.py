from langgraph.graph import StateGraph, START, END

from src.graph.state import GameState
from src.graph.nodes.evaluate import evaluate_hr, evaluate_tech
from src.graph.nodes.hr import hr_agent
from src.graph.nodes.tech import tech_agent
from src.graph.nodes.final_report import final_report
from src.graph.nodes.generate_offers import generate_offers


def route_evaluate_hr(state: GameState) -> str:
    return state.get("decision", "continue")  # type: ignore[return-value]


def route_evaluate_tech(state: GameState) -> str:
    return state.get("decision", "continue")  # type: ignore[return-value]


def route_start(state: GameState) -> str:
    stage = state.get("current_stage", "offer_selection")
    if stage == "offer_selection":
        return "generate_offers"
    if stage == "hr":
        # First turn: no previous answer to evaluate, go straight to hr_agent
        # Subsequent turns: evaluate previous answer first
        turn_count = state.get("turn_count", 0)
        if turn_count == 0:
            return "hr_agent"
        return "evaluate_hr"
    if stage == "tech":
        turn_count = state.get("turn_count", 0)
        if turn_count == 0:
            return "tech_agent"
        return "evaluate_tech"
    return "hr_agent"


# Build graph

graph = StateGraph(GameState)

graph.add_node("generate_offers", generate_offers)
graph.add_node("hr_agent", hr_agent)
graph.add_node("evaluate_hr", evaluate_hr)
graph.add_node("tech_agent", tech_agent)
graph.add_node("evaluate_tech", evaluate_tech)
graph.add_node("final_report", final_report)

# Edges
graph.add_conditional_edges(
    START,
    route_start,
    {
        "generate_offers": "generate_offers",
        "hr_agent": "hr_agent",
        "evaluate_hr": "evaluate_hr",
        "tech_agent": "tech_agent",
        "evaluate_tech": "evaluate_tech",
    },
)
graph.add_edge("generate_offers", END)

# HR: evaluate → route → ask next question OR end stage
graph.add_conditional_edges(
    "evaluate_hr",
    route_evaluate_hr,
    {
        "continue": "hr_agent",
        "pass": "tech_agent",
        "fail": "final_report",
    },
)
graph.add_edge("hr_agent", END)

# Tech: evaluate → route → ask next question OR end stage
graph.add_conditional_edges(
    "evaluate_tech",
    route_evaluate_tech,
    {
        "pass": "final_report",
        "fail": "final_report",
        "continue": "tech_agent",
    },
)
graph.add_edge("tech_agent", END)

graph.add_edge("final_report", END)

# No interrupt_after needed — CopilotKit handles the user-turn boundary externally
app = graph.compile()

game_graph = app
