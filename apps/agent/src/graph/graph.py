from langgraph.graph import StateGraph, START, END

from src.graph.state import GameState
from src.graph.nodes.headhunter import headhunter_agent
from src.graph.nodes.extract_profile import extract_profile
from src.graph.nodes.generate_offer import generate_offer
from src.graph.nodes.route_headhunter import route_headhunter

from src.graph.nodes.evaluate import evaluate_headhunter, evaluate_hr, evaluate_tech
from src.graph.nodes.hr import hr_agent
from src.graph.nodes.tech import tech_agent
from src.graph.nodes.final_report import final_report


# Routing functions for conditional edges.
# Each evaluate node should set state["decision"] to one of the valid keys.

def route_evaluate_headhunter(state: GameState) -> str:
    # evaluate_headhunter node must set state["decision"] to "continue" | "pass" | "fail"
    return state.get("decision", "continue")  # type: ignore[return-value]


def route_evaluate_hr(state: GameState) -> str:
    # evaluate_hr node must set state["decision"] to "continue" | "pass" | "fail"
    return state.get("decision", "continue")  # type: ignore[return-value]


def route_evaluate_tech(state: GameState) -> str:
    # evaluate_tech node must set state["decision"] to "continue" | "pass" | "fail"
    return state.get("decision", "continue")  # type: ignore[return-value]


# Build graph

graph = StateGraph(GameState)

graph.add_node("headhunter_agent", headhunter_agent)
graph.add_node("extract_profile", extract_profile)
graph.add_node("generate_offer", generate_offer)
graph.add_node("evaluate_headhunter", evaluate_headhunter)
graph.add_node("hr_agent", hr_agent)
graph.add_node("evaluate_hr", evaluate_hr)
graph.add_node("tech_agent", tech_agent)
graph.add_node("evaluate_tech", evaluate_tech)
graph.add_node("final_report", final_report)

# Edges
graph.add_edge(START, "headhunter_agent")
graph.add_edge("headhunter_agent", "extract_profile")

graph.add_conditional_edges(
    "extract_profile",
    route_headhunter,
    {
        "headhunter_agent": "headhunter_agent",
        "generate_offer": "generate_offer",
        "evaluate_headhunter": "evaluate_headhunter",
    },
)

graph.add_edge("generate_offer", "headhunter_agent")

graph.add_conditional_edges(
    "evaluate_headhunter",
    route_evaluate_headhunter,
    {
        "continue": "headhunter_agent",
        "pass": "hr_agent",
        "fail": "final_report",
    },
)

graph.add_edge("hr_agent", "evaluate_hr")

graph.add_conditional_edges(
    "evaluate_hr",
    route_evaluate_hr,
    {
        "continue": "hr_agent",
        "pass": "tech_agent",
        "fail": "final_report",
    },
)

graph.add_edge("tech_agent", "evaluate_tech")

graph.add_conditional_edges(
    "evaluate_tech",
    route_evaluate_tech,
    {
        "pass": "final_report",
        "fail": "final_report",
        "continue": "tech_agent",
    },
)

graph.add_edge("final_report", END)

# Compile
app = graph.compile(
    interrupt_after=["headhunter_agent", "hr_agent", "tech_agent"],
)

game_graph = app
