from langgraph.graph import StateGraph, START, END

from src.graph.state import GameState
from src.graph.nodes.evaluate import evaluate_hr, evaluate_tech
from src.graph.nodes.hr import hr_agent
from src.graph.nodes.tech import tech_agent
from src.graph.nodes.final_report import final_report


def route_evaluate_hr(state: GameState) -> str:
    return state.get("decision", "continue")  # type: ignore[return-value]


def route_evaluate_tech(state: GameState) -> str:
    return state.get("decision", "continue")  # type: ignore[return-value]


# Build graph

graph = StateGraph(GameState)

graph.add_node("hr_agent", hr_agent)
graph.add_node("evaluate_hr", evaluate_hr)
graph.add_node("tech_agent", tech_agent)
graph.add_node("evaluate_tech", evaluate_tech)
graph.add_node("final_report", final_report)

# Edges
graph.add_edge(START, "hr_agent")
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
    interrupt_after=["hr_agent", "tech_agent"],
)

game_graph = app
